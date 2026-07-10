/* ══════════════════════════════════════════
   CLAY BOWER — PORTFOLIO PAGES (work + ugc)
   Nav, scroll reveal, and photo lightbox.
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNav()
  initScrollReveal()
  initLightbox()
  initAnalytics()
})

/* ── Live analytics: interactive platform + period toggle dashboard ── */
function initAnalytics() {
  const root = document.getElementById('analytics')
  if (!root) return

  const commas = n => Number(n).toLocaleString('en-US')
  const abbr = n => {
    if (n == null) return '—'
    n = Number(n)
    if (n >= 1e6) return +(n / 1e6).toFixed(2) + 'M'
    if (n >= 1e5) return Math.round(n / 1e3) + 'K'
    if (n >= 1e3) return +(n / 1e3).toFixed(1) + 'K'
    return String(n)
  }
  const plabel = pr => (pr === '30d' ? 'Last 30 days' : 'Last 90 days')
  const tile = (num, label, sub) =>
    `<div class="an-tile"><div class="an-tile-num">${num}</div><div class="an-tile-label">${label}<span>${sub}</span></div></div>`

  let DATA = window.AN_FALLBACK || null
  let platform = 'all'
  let period = '30d'

  function render() {
    if (!DATA || !DATA[platform]) return
    const p = DATA[platform]
    const num = document.getElementById('an-headline-num')
    const label = document.getElementById('an-headline-label')
    const link = document.getElementById('an-headline-link')
    let html = ''

    if (platform === 'all') {
      num.textContent = commas(p.audience)
      label.textContent = 'Total Audience Across Platforms'
      link.style.display = 'none'
      html += tile('+' + commas(p.growth[period]), 'Followers Gained', plabel(period))
      html += tile(abbr(p.reach[period]), 'Views', 'Instagram + YouTube · ' + plabel(period).toLowerCase())
      html += tile(commas(p.content), 'Content Published', 'Posts + videos, all platforms')
      html += tile(abbr(p.likes), 'Total Likes', 'TikTok, all-time')
      if (p.partners) html += tile(p.partners, 'Brand Partners', 'Paid collaborations')
      if (p.revenue) html += tile(p.revenue, 'Revenue Generated', 'Across brand deals')
    } else {
      num.textContent = commas(p.followers)
      label.textContent = p.followers_label
      link.textContent = p.handle + ' ↗'
      link.href = p.url
      link.style.display = 'inline-block'
      const gained = (p.followers_label === 'Subscribers' ? 'Subscribers' : 'Followers') + ' Gained'
      html += tile('+' + commas(p.growth[period]), gained, plabel(period))
      if (p.reach && p.reach[period] != null) html += tile(abbr(p.reach[period]), 'Views', plabel(period))
      if (platform === 'instagram') {
        html += tile(p.engagement + '%', 'Avg Engagement', 'Recent posts')
        html += tile(commas(p.content), 'Posts Published', 'All-time')
      } else if (platform === 'tiktok') {
        html += tile(abbr(p.likes), 'Total Likes', 'All-time')
        html += tile(commas(p.content), 'Videos Published', 'All-time')
      } else if (platform === 'youtube') {
        html += tile(abbr(p.total_views), 'Total Views', 'All-time')
        html += tile(commas(p.content), 'Videos Published', 'All-time')
      }
    }
    document.getElementById('an-stats').innerHTML = html

    // Demographics are Instagram-only — show for All/Instagram, hide for TikTok/YouTube
    const demoBox = document.getElementById('an-demo')
    if (demoBox) {
      const showDemo = DATA.demographics && (platform === 'all' || platform === 'instagram')
      demoBox.style.display = showDemo ? '' : 'none'
      if (showDemo) {
        const active = root.querySelector('[data-demo].is-active')
        renderDemo(active ? active.dataset.demo : 'age')
      }
    }
  }

  root.querySelectorAll('[data-platform]').forEach(b => b.addEventListener('click', () => {
    platform = b.dataset.platform
    root.querySelectorAll('[data-platform]').forEach(x => x.classList.toggle('is-active', x === b))
    render()
  }))
  root.querySelectorAll('[data-period]').forEach(b => b.addEventListener('click', () => {
    period = b.dataset.period
    root.querySelectorAll('[data-period]').forEach(x => x.classList.toggle('is-active', x === b))
    render()
  }))

  /* Audience demographics (shown only if analytics.json has them) */
  function renderDemo(dim) {
    const rows = DATA && DATA.demographics && DATA.demographics[dim]
    const box = document.getElementById('an-demo-bars')
    if (!rows || !rows.length || !box) return
    const sum = rows.reduce((a, r) => a + (r.value || 0), 0) || 1
    const max = Math.max(...rows.map(r => r.value || 0)) || 1
    box.innerHTML = rows.map(r => {
      const pct = Math.round((r.value / sum) * 100)
      const w = Math.round((r.value / max) * 100)
      return `<div class="an-bar-row"><span class="an-bar-label">${r.label}</span>` +
             `<span class="an-bar-track"><span class="an-bar-fill" style="width:${w}%"></span></span>` +
             `<span class="an-bar-pct">${pct}%</span></div>`
    }).join('')
  }
  root.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => {
    root.querySelectorAll('[data-demo]').forEach(x => x.classList.toggle('is-active', x === b))
    renderDemo(b.dataset.demo)
  }))

  render()

  fetch('analytics.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => {
      DATA = d
      if (d.updated) {
        const dt = new Date(d.updated + 'T00:00:00')
        document.querySelectorAll('[data-an="updated"]').forEach(el => {
          el.textContent = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        })
      }
      render()
    })
    .catch(() => { /* keep inline fallback data */ })
}

/* ── Nav: scroll shadow + mobile hamburger ── */
function initNav() {
  const nav = document.getElementById('nav')
  if (!nav) return

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  const hamburger = document.getElementById('nav-hamburger')
  const navLinks = document.getElementById('nav-links')
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => nav.classList.toggle('nav-open'))
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('nav-open'))
    })
  }
}

/* ── Scroll reveal (mirrors main.js) ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-zoom')
  if (!els.length) return

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        obs.unobserve(e.target)
      }
    })
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' })

  els.forEach(el => obs.observe(el))
}

/* ── Photo gallery lightbox ── */
function initLightbox() {
  const items = document.querySelectorAll('.pf-gallery-item')
  if (!items.length) return

  const box = document.getElementById('pf-lightbox')
  const boxImg = document.getElementById('pf-lightbox-img')
  const close = document.getElementById('pf-lightbox-close')
  if (!box || !boxImg) return

  const open = (src, alt) => {
    boxImg.src = src
    boxImg.alt = alt || ''
    box.classList.add('open')
    document.body.style.overflow = 'hidden'
  }
  const shut = () => {
    box.classList.remove('open')
    document.body.style.overflow = ''
  }

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img')
      if (img) open(img.getAttribute('src'), img.getAttribute('alt'))
    })
  })

  close?.addEventListener('click', shut)
  box.addEventListener('click', e => { if (e.target === box) shut() })
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut() })
}

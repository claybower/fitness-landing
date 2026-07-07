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

/* ── Live analytics: fetch analytics.json, update the numbers ── */
function initAnalytics() {
  if (!document.getElementById('analytics')) return

  const commas = n => Number(n).toLocaleString('en-US')
  const abbr = n => {
    n = Number(n)
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(n)
  }
  const set = (key, val) => {
    const el = document.querySelector(`[data-an="${key}"]`)
    if (el != null && val != null) el.textContent = val
  }

  fetch('analytics.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => {
      set('total', commas(d.total))
      ;['instagram', 'tiktok', 'youtube'].forEach(p => {
        if (!d[p]) return
        set(`${p}-followers`, commas(d[p].followers))
        set(`${p}-weekly`, commas(d[p].weekly))
        set(`${p}-reach`, abbr(d[p].reach))
      })
      if (d.updated) {
        const dt = new Date(d.updated + 'T00:00:00')
        set('updated', dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
      }
    })
    .catch(() => { /* keep the baked-in fallback numbers */ })
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

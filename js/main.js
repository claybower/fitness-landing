/* ══════════════════════════════════════════
   CLAY BOWER — ASCEND · MAIN.JS
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNav()
  initScrollReveal()
  initHeroZoom()
  initFAQ()
  initTestimonialDrag()
})

/* ── Nav: shadow + size on scroll ── */
function initNav() {
  const nav = document.getElementById('nav')
  if (!nav) return
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}

/* ── Hero transformation scroll zoom ── */
function initHeroZoom() {
  const wrap = document.getElementById('hero-transform-wrap')
  if (!wrap) return
  const box = wrap.querySelector('.hero-transform-single')
  if (!box) return

  function onScroll() {
    const rect = wrap.getBoundingClientRect()
    const viewportH = window.innerHeight

    // How close the box center is to the viewport center (0 = off-screen, 1 = perfectly centered)
    const boxCenter = rect.top + rect.height / 2
    const viewportCenter = viewportH / 2
    const maxDist = viewportH * 0.85
    const dist = Math.abs(boxCenter - viewportCenter)
    const progress = Math.max(0, 1 - dist / maxDist)

    const scale = 1 + progress * 0.12
    box.style.transform = `scale(${scale})`
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}

/* ── Scroll Reveal (fade+slide AND zoom variants) ── */
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

/* ── FAQ Accordion ── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question')?.addEventListener('click', () => {
      const open = item.classList.contains('open')
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'))
      if (!open) item.classList.add('open')
    })
  })
}

/* ── Testimonials: drag to scroll ── */
function initTestimonialDrag() {
  const track = document.querySelector('.testimonials-track')
  if (!track) return

  let down = false, startX = 0, scrollLeft = 0

  track.addEventListener('mousedown', e => {
    down = true
    track.classList.add('dragging')
    startX = e.pageX - track.offsetLeft
    scrollLeft = track.scrollLeft
  })

  const end = () => { down = false; track.classList.remove('dragging') }
  track.addEventListener('mouseup', end)
  track.addEventListener('mouseleave', end)

  track.addEventListener('mousemove', e => {
    if (!down) return
    e.preventDefault()
    track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.4
  })
}

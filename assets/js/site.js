/* git-taller · mejoras opcionales de la landing */
(() => {
  const d = document
  const root = d.documentElement
  root.classList.add('js')
  // Revelado de una sola vez: .io oculta lo que se revela hasta que entra en
  // pantalla. Va antes de incluir las secciones para que no aparezcan y se oculten.
  // En la vista previa del taller (gt-embed=1), que se recarga con cada cambio,
  // lo que ya está a la vista aparece sin transición el primer segundo.
  const canReveal = 'IntersectionObserver' in window
  if (canReveal) {
    root.classList.add('io')
    if (/[?&]gt-embed=1/.test(location.search)) {
      root.classList.add('io-instant')
      setTimeout(() => root.classList.remove('io-instant'), 1200)
    }
  }

  // Cada sección vive en su propio archivo: sections/<nombre>.html
  const slots = [...d.querySelectorAll('[data-include]')]
  Promise.all(
    slots.map((el) =>
      fetch(el.getAttribute('data-include'))
        .then((r) => (r.ok ? r.text() : ''))
        .then((h) => { if (h) el.outerHTML = h })
        .catch(() => {}),
    ),
  ).then(ready)

  function ready() {
    if (canReveal) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) }
        root.dataset.ioReady = '1'
      }, { rootMargin: '0px 0px -8% 0px' })
      const targets = d.querySelectorAll('.reveal, .split, .ink, .img-settle, .fill-bar')
      targets.forEach((el) => io.observe(el))
      if (!targets.length) root.dataset.ioReady = '1'
    }

    const clocks = d.querySelectorAll('[data-clock]')
    const tick = () => clocks.forEach((c) => {
      try {
        c.textContent = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', timeZone: c.getAttribute('data-clock') || undefined })
      } catch {}
    })
    if (clocks.length) { tick(); setInterval(tick, 30000) }

    // Contadores: el número real ya está en el HTML; solo se anima desde 0 al verse.
    const counters = d.querySelectorAll('.countup')
    if (counters.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const run = (el) => {
        const to = Number(el.getAttribute('data-to')) || 0
        const t0 = performance.now()
        const step = (t) => {
          const k = Math.min(1, (t - t0) / 1200)
          el.textContent = String(Math.round(to * (1 - (1 - k) ** 3)))
          if (k < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
      const co = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { run(e.target); co.unobserve(e.target) }
      }, { threshold: 0.6 })
      counters.forEach((c) => co.observe(c))
    }

    d.querySelectorAll('[data-year]').forEach((y) => { y.textContent = String(new Date().getFullYear()) })
    d.dispatchEvent(new Event('sections:ready'))
  }
})()

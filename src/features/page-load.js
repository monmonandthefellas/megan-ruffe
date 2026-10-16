export function initPageLoad({ container = document } = {}) {
  const elements = Array.from(container.querySelectorAll('[data-page-load]'))

  if (!elements.length) {
    return undefined
  }

  requestAnimationFrame(() => {
    elements.forEach((element) => {
      element.classList.add('is-loaded')
    })
  })

  return () => {
    elements.forEach((element) => {
      element.classList.remove('is-loaded')
    })
  }
}

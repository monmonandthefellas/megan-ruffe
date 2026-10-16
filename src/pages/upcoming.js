import { resetLenis } from '../core/lenis.js'

const DESKTOP_MEDIA_QUERY = '(min-width: 992px)'

export function initUpcomingPage({ container = document } = {}) {
  const wrapper = container.querySelector('.upcoming')
  const content = container.querySelector('.upcoming__list')
  const desktopMediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)

  if (!wrapper || !content) {
    return undefined
  }

  let horizontalLenis
  let isHorizontalEnabled = false

  const resizeObserver = new ResizeObserver(() => {
    horizontalLenis?.resize()
  })

  function enableHorizontalLenis() {
    if (isHorizontalEnabled) {
      horizontalLenis?.resize()
      return
    }

    horizontalLenis = resetLenis({
      wrapper,
      content,
      orientation: 'horizontal',
      gestureOrientation: 'both',
    })

    isHorizontalEnabled = true
    resizeObserver.observe(wrapper)
    resizeObserver.observe(content)
  }

  function disableHorizontalLenis() {
    resizeObserver.disconnect()

    if (!isHorizontalEnabled) {
      return
    }

    horizontalLenis = undefined
    isHorizontalEnabled = false
    resetLenis()
  }

  function syncLenisToViewport() {
    if (desktopMediaQuery.matches) {
      enableHorizontalLenis()
      return
    }

    disableHorizontalLenis()
  }

  syncLenisToViewport()
  desktopMediaQuery.addEventListener('change', syncLenisToViewport)

  return () => {
    desktopMediaQuery.removeEventListener('change', syncLenisToViewport)
    disableHorizontalLenis()
  }
}
const DEFAULT_PLAYBACK_SPEED = 1
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i

const scrollIndicatorFrames = Object.entries(
  import.meta.glob('../assets/scroll-indicator/*.{avif,gif,jpeg,jpg,png,webp}', {
    eager: true,
    import: 'default',
    query: '?url',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => resolveFrameSrc(src))

function getAppScriptUrl() {
  return (
    Array.from(document.scripts).find((script) => (
      script.src.includes('/src/main.js') ||
      script.src.endsWith('/main.js')
    ))?.src || window.location.href
  )
}

function resolveFrameSrc(src) {
  if (ABSOLUTE_URL_PATTERN.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }

  return new URL(src, getAppScriptUrl()).href
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getLoopProgress(value) {
  const loopProgress = value % 1

  return loopProgress < 0 ? loopProgress + 1 : loopProgress
}

function preloadFrames(frames) {
  frames.forEach((src) => {
    const image = new Image()
    image.src = src
  })
}

export function initScrollIndicator({ container = document } = {}) {
  const scrollIndicatorImage = container.querySelector('[data-scroll-indicator-image]')

  if (!scrollIndicatorImage || !scrollIndicatorFrames.length) {
    return undefined
  }

  const playbackSpeed =
    Number.parseFloat(scrollIndicatorImage.dataset.playbackSpeed) || DEFAULT_PLAYBACK_SPEED
  let currentFrameIndex = -1
  let animationFrameId

  preloadFrames(scrollIndicatorFrames)

  function getScrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight

    if (maxScroll <= 0) {
      return 0
    }

    return clamp(window.scrollY / maxScroll, 0, 1)
  }

  function renderFrame() {
    animationFrameId = undefined

    const scrollProgress = getScrollProgress()
    const frameProgress = scrollProgress === 1 ? 1 : getLoopProgress(scrollProgress * playbackSpeed)
    const frameIndex = Math.round(frameProgress * (scrollIndicatorFrames.length - 1))

    if (frameIndex === currentFrameIndex) {
      return
    }

    currentFrameIndex = frameIndex
    scrollIndicatorImage.src = scrollIndicatorFrames[frameIndex]
  }

  function requestFrame() {
    if (animationFrameId) {
      return
    }

    animationFrameId = window.requestAnimationFrame(renderFrame)
  }

  renderFrame()
  window.addEventListener('scroll', requestFrame, { passive: true })
  window.addEventListener('resize', requestFrame)

  return () => {
    window.removeEventListener('scroll', requestFrame)
    window.removeEventListener('resize', requestFrame)

    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId)
    }
  }
}
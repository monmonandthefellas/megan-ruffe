import { gsap } from '../core/gsap.js'
import { getLenis } from '../core/lenis.js'

const DEFAULT_FRAME_DURATION = 100
const DEFAULT_FADE_DURATION = 1.2
const DEFAULT_CURTAIN_DURATION = 1.2
const DEFAULT_CURTAIN_HOLD = 0.8
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i
const SESSION_KEY = 'preloader-played'
const DESKTOP_MEDIA_QUERY = '(min-width: 992px)'
const skipPreloader = false

const preloaderFrames = Object.entries(
  import.meta.glob('../assets/preloader/*.{avif,gif,jpeg,jpg,png,webp}', {
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

function preloadFrames(frames) {
  frames.forEach((src) => {
    const image = new Image()
    image.src = src
  })
}

function hasAlreadyPlayed() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function isDesktopViewport() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches
}

function shouldSkipPreloader() {
  return skipPreloader || hasAlreadyPlayed() || !isDesktopViewport()
}

function markAsPlayed() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}

function skipPreloaderPlayback(preloader) {
  if (!shouldSkipPreloader()) {
    return false
  }

  hidePreloader(preloader)

  if (!skipPreloader && !hasAlreadyPlayed() && !isDesktopViewport()) {
    markAsPlayed()
  }

  return true
}

function hidePreloader(preloader) {
  preloader.style.display = 'none'
  preloader.setAttribute('aria-hidden', 'true')
}

function concealPreloader(preloader) {
  preloader.style.opacity = '0'
  preloader.style.visibility = 'hidden'
  preloader.style.pointerEvents = 'none'
  preloader.setAttribute('aria-hidden', 'true')
}

function preparePreloaderElement() {
  const preloader = document.querySelector('.preloader')
  if (!preloader) {
    return
  }

  if (skipPreloaderPlayback(preloader)) {
    return
  }

  concealPreloader(preloader)
}

preparePreloaderElement()

function collectPreloaderImages(preloader) {
  const imageTargets = Array.from(preloader.querySelectorAll('[data-preloader-image]'))
  const items = imageTargets.length
    ? imageTargets
    : Array.from(preloader.querySelectorAll('img'))

  return items
    .map((item) => {
      const image = item instanceof HTMLImageElement ? item : item.querySelector('img')
      return image ? { item, image } : undefined
    })
    .filter(Boolean)
}

function lockScroll() {
  const lenis = getLenis()

  if (lenis) {
    lenis.scrollTo(0, { immediate: true })
    lenis.stop()
    return () => lenis.start()
  }

  window.scrollTo(0, 0)
  return undefined
}

function createFrameController(preloader, preloaderImages) {
  const frameDuration =
    Number.parseFloat(preloader.dataset.preloaderFrameDuration) || DEFAULT_FRAME_DURATION
  const frameCount = preloaderFrames.length
  const images = preloaderImages.map(({ image }) => image)

  function showFrame(frameIndex) {
    if (!frameCount) {
      return
    }

    const index = ((frameIndex % frameCount) + frameCount) % frameCount
    const src = preloaderFrames[index]

    images.forEach((image) => {
      image.removeAttribute('srcset')
      image.removeAttribute('sizes')
      image.src = src
    })
  }

  return { frameDuration, frameCount, showFrame }
}

function buildPreloaderTimeline(preloader, preloaderImages, preLoaderTransitionLayer, { onComplete }) {
  const preloaderImageItems = preloaderImages.map(({ item }) => item)
  const { frameDuration, frameCount, showFrame } = createFrameController(preloader, preloaderImages)
  const fadeDuration =
    Number.parseFloat(preloader.dataset.preloaderFadeDuration) || DEFAULT_FADE_DURATION
  const curtainDuration =
    Number.parseFloat(preloader.dataset.preloaderCurtainDuration) || DEFAULT_CURTAIN_DURATION
  const curtainHold =
    Number.parseFloat(preloader.dataset.preloaderCurtainHold) || DEFAULT_CURTAIN_HOLD

  gsap.set(preloader, { autoAlpha: 1, backgroundColor: 'white' })
  gsap.set(preloaderImageItems, { autoAlpha: 0 })
  gsap.set(preLoaderTransitionLayer, { autoAlpha: 1, x: '-100%' })

  showFrame(0)

  const timeline = gsap.timeline({ delay: 0.5 })

  // 1. Fade the image in while the frame sequence is already playing
  timeline.to(preloaderImageItems, {
    autoAlpha: 1,
    duration: fadeDuration,
    ease: 'power2.inOut',
  })

  if (frameCount > 1) {
    const frameProgress = { value: 0 }

    timeline.to(frameProgress, {
      value: 1,
      duration: (frameCount * frameDuration) / 1000,
      ease: 'none',
      onUpdate: () => {
        const frameIndex = Math.min(frameCount - 1, Math.floor(frameProgress.value * frameCount))
        showFrame(frameIndex)
      },
    }, '<')
  }

  // 3. Fade the image out (opacity 1 -> 0)
  timeline.to(preloaderImageItems, {
    autoAlpha: 0,
    duration: fadeDuration,
    ease: 'power1.inOut',
  })

  // 4. Curtain sweeps in, holds on full red, then sweeps out
  timeline.to(preLoaderTransitionLayer, {
    x: '0%',
    duration: curtainDuration,
    ease: 'power1.inOut',
  }, '>-0.2')

  timeline.to(preloader, {
    backgroundColor: 'transparent',
    duration: 0,
  })

  timeline.to(preLoaderTransitionLayer, {
    delay: curtainHold,
    x: '-100%',
    duration: curtainDuration,
    ease: 'power1.inOut',
  })

  timeline.to(preloader, {
    duration: 0.3,
    autoAlpha: 0,
    ease: 'power1.inOut',
    onComplete,
  }, '>')

  return { timeline, preloaderImageItems }
}

/**
 * Home-only intro preloader. Place `.preloader` inside `data-barba="wrapper"`
 * but outside `data-barba="container"` so Barba does not replace it on navigation.
 * Runs once per browser tab session.
 */
export function initPreloader() {
  const preloader = document.querySelector('.preloader')
  const transitionLayer = document.querySelector('.preloader__transition')
  const preloaderImages = preloader ? collectPreloaderImages(preloader) : []


  if (!preloader || !preloaderImages.length || !transitionLayer) {
    return undefined
  }

  if (skipPreloaderPlayback(preloader)) {
    return undefined
  }

  const unlockScroll = lockScroll()

  preloadFrames(preloaderFrames)

  const finish = () => {
    unlockScroll?.()
    markAsPlayed()
    hidePreloader(preloader)
  }

  const { timeline, preloaderImageItems } = buildPreloaderTimeline(
    preloader,
    preloaderImages,
    transitionLayer,
    {
      onComplete: finish,
    },
  )

  return () => {
    timeline.kill()
    gsap.killTweensOf([preloader, ...preloaderImageItems])
    finish()
  }
}

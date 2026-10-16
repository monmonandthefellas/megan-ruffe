import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap.js'

let lenis
let frameId

function raf(time) {
  lenis?.raf(time)
  frameId = requestAnimationFrame(raf)
}

export function initLenis(options = {}) {
  if (lenis) {
    return lenis
  }

  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    ...options,
  })

  lenis.on('scroll', () => {
    ScrollTrigger.update()
  })

  frameId = requestAnimationFrame(raf)

  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function getLenis() {
  return lenis
}

export function destroyLenis() {
  if (frameId) {
    cancelAnimationFrame(frameId)
  }

  lenis?.destroy()
  lenis = undefined
  frameId = undefined
}

export function resetLenis(options = {}) {
  destroyLenis()

  return initLenis(options)
}
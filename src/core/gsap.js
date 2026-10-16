import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function setupGSAP() {
  gsap.registerPlugin(ScrollTrigger)

  gsap.defaults({
    ease: 'power2.out',
    duration: 0.6,
  })
}

export { gsap, ScrollTrigger }

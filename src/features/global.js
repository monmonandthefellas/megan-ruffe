import { setupGSAP } from '../core/gsap.js'
import { initLenis } from '../core/lenis.js'
import { initNavigationBar } from './navbar/navbar.js'

export function initGlobalFeatures() {
  document.documentElement.classList.add('js-enabled')
  setupGSAP()
  initLenis()
  initNavigationBar()
}

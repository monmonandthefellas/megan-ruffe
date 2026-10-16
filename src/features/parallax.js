import SimpleParallax from 'simple-parallax-js/vanilla'
import { getLenis } from '../core/lenis.js'

function getParallaxTargets(container) {
  return [...container.querySelectorAll('[data-parallax]')].flatMap((element) => {
    if (element.matches('img, picture, video')) {
      return [element]
    }

    const media = element.querySelector('img, picture, video')
    return media ? [media] : []
  })
}

export function initParallax({ container = document } = {}) {
  const targets = getParallaxTargets(container)
  if (!targets.length) {
    return undefined
  }

  const instance = new SimpleParallax(targets, {
    delay: 0.1,
    scale: 1.3,
    orientation: 'up',
    transition: 'cubic-bezier(0,0,0,1)',
  })

  const onScroll = () => instance.refresh()
  getLenis()?.on('scroll', onScroll)

  return () => {
    getLenis()?.off('scroll', onScroll)
    instance.destroy()
  }
}

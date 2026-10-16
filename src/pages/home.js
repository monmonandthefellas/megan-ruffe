import { initMediaSetup } from '../features/media-setup.js'
import { initParallax } from '../features/parallax.js'
import { initPreloader } from '../features/preloader.js'
import { gsap } from '../core/gsap.js'
const DESKTOP_MEDIA_QUERY = '(min-width: 992px)'

export function initHomePage({ container = document } = {}) {
  const cleanupPreloader = initPreloader()
  const cleanupParallax = initParallax({ container })

  container.querySelectorAll('[data-project-number]').forEach((element, index) => {
    const raw = element.textContent.trim().replace(/\.$/, '')
    const number = Number.parseInt(raw, 10)
    const normalized = Number.isNaN(number) ? index + 1 : number
    element.textContent = `${String(normalized).padStart(2, '0')}.`
  })

  function projectCardHoverEffect() {
    const cleanupFns = []
    const projectCards = Array.from(container.querySelectorAll('[data-project-wrapper]'))
      .map((card) => {
        const projectContent = card.querySelector('[data-project-content]')
        const projectPreview = card.querySelector('[data-project-preview]')
        const projectTitle = card.querySelector('[data-project-name]')
        const projectNumber = card.querySelector('[data-project-number]')
        const projectEyebrow = card.querySelector('[data-project-eyebrow]')

        if (!projectContent || !projectPreview) {
          return undefined
        }

        return { projectContent, projectPreview, projectTitle, projectNumber, projectEyebrow }
      })
      .filter(Boolean)
    const allProjectContent = projectCards.map((projectCard) => projectCard.projectContent)
    const allProjectPreview = projectCards.map((projectCard) => projectCard.projectPreview)
    const allProjectTitle = projectCards.map((projectCard) => projectCard.projectTitle).filter(Boolean)
    const allProjectEyebrow = projectCards.map((projectCard) => projectCard.projectEyebrow).filter(Boolean)
    const allProjectNumber = projectCards.map((projectCard) => projectCard.projectNumber).filter(Boolean)

    projectCards.forEach(({ projectContent, projectPreview, projectTitle, projectNumber, projectEyebrow }) => {
      gsap.set(projectPreview, { autoAlpha: 0, pointerEvents: 'none' })
      gsap.set(projectTitle, { autoAlpha: 0, pointerEvents: 'none', color: '#fff' })
      gsap.set(projectEyebrow, { autoAlpha: 0, pointerEvents: 'none', color: '#fff' })

      const showPreview = () => {
        const otherProjectContent = projectCards
          .filter((projectCard) => projectCard.projectContent !== projectContent)
          .map((projectCard) => projectCard.projectContent)

        gsap.to(otherProjectContent, {
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })

        gsap.to(projectPreview, {
          autoAlpha: 1,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })

        gsap.to(projectTitle, {
          autoAlpha: 1,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })

        gsap.to(projectEyebrow, {
          autoAlpha: 1,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })

        gsap.to(projectNumber, {
          color: '#fff',
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })
      }

      const hidePreview = () => {
        gsap.to(allProjectContent, {
          autoAlpha: 1,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })

        gsap.to(projectPreview, {
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })

        gsap.to(projectTitle, {
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })

        gsap.to(projectEyebrow, {
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })

        gsap.to(projectNumber, {
          color: '#000',
          duration: 0.3,
          ease: 'power2.inOut',
          overwrite: true,
        })
      }

      projectContent.addEventListener('mouseenter', showPreview)
      projectContent.addEventListener('mouseleave', hidePreview)

      cleanupFns.push(() => {
        projectContent.removeEventListener('mouseenter', showPreview)
        projectContent.removeEventListener('mouseleave', hidePreview)
        gsap.killTweensOf(projectPreview)
        gsap.killTweensOf(projectContent)
        gsap.killTweensOf(projectTitle)
        gsap.killTweensOf(projectEyebrow)
        gsap.killTweensOf(projectNumber)
      })
    })

    return () => {
      cleanupFns.forEach((cleanup) => cleanup())
      gsap.set(allProjectContent, { clearProps: 'opacity,visibility' })
      gsap.set(allProjectPreview, { clearProps: 'opacity,visibility,pointerEvents' })
      gsap.set(allProjectTitle, { clearProps: 'opacity,visibility,pointerEvents,color' })
      gsap.set(allProjectEyebrow, { clearProps: 'opacity,visibility,pointerEvents,color' })
      gsap.set(allProjectNumber, { clearProps: 'color' })
    }
  }

  const desktopMediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
  let cleanupProjectCardHoverEffect

  function enableProjectCardHoverEffect() {
    if (cleanupProjectCardHoverEffect) {
      return
    }

    cleanupProjectCardHoverEffect = projectCardHoverEffect()
  }

  function disableProjectCardHoverEffect() {
    cleanupProjectCardHoverEffect?.()
    cleanupProjectCardHoverEffect = undefined
  }

  function syncProjectCardHoverEffect() {
    if (desktopMediaQuery.matches) {
      enableProjectCardHoverEffect()
      return
    }

    disableProjectCardHoverEffect()
  }

  syncProjectCardHoverEffect()
  desktopMediaQuery.addEventListener('change', syncProjectCardHoverEffect)
  initMediaSetup()

  return () => {
    desktopMediaQuery.removeEventListener('change', syncProjectCardHoverEffect)
    disableProjectCardHoverEffect()
    cleanupPreloader?.()
    cleanupParallax?.()
  }
}
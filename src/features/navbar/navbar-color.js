import { getLenis } from '../../core/lenis.js'

// Extend each section's color zone past its edges so the nav flips slightly
// beyond the container boundary, not exactly on it.
const NAV_COLOR_BOUNDARY_OFFSET = 16

let isInitialized = false
let scheduleUpdateId = 0

function getNavStatusEl() {
  return document.querySelector('[data-navigation-status]')
}

function getPageContainer() {
  return document.querySelector('[data-barba="container"]') ?? document
}

function getColorSections() {
  // Exclude the nav root itself — updateNavColor writes data-nav-color onto it,
  // which would otherwise always match the probe and lock the color.
  return [
    ...getPageContainer().querySelectorAll(
      '[data-nav-color]:not([data-navigation-status])',
    ),
  ]
}

function getNavProbeY() {
  const navBar = document.querySelector('.navbar') ?? getNavStatusEl()
  if (!navBar) return 1

  const { bottom } = navBar.getBoundingClientRect()
  return Math.max(bottom, 1)
}

function getNavColorFromSections(sections, probeY) {
  for (const section of sections) {
    const { top, bottom } = section.getBoundingClientRect()
    const zoneTop = top - NAV_COLOR_BOUNDARY_OFFSET
    const zoneBottom = bottom + NAV_COLOR_BOUNDARY_OFFSET

    if (zoneTop <= probeY && zoneBottom > probeY) {
      return section.getAttribute('data-nav-color')
    }
  }

  return null
}

function updateNavColor() {
  const navStatusEl = getNavStatusEl()
  if (!navStatusEl) return

  const color = getNavColorFromSections(getColorSections(), getNavProbeY())

  if (color) {
    navStatusEl.setAttribute('data-nav-color', color)
    return
  }

  navStatusEl.removeAttribute('data-nav-color')
}

export function scheduleNavbarColorUpdate() {
  const updateId = ++scheduleUpdateId

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (updateId !== scheduleUpdateId) return
      updateNavColor()
    })
  })
}

function attachListeners() {
  if (isInitialized) return
  isInitialized = true

  const lenis = getLenis()
  lenis?.on('scroll', updateNavColor)
  window.addEventListener('scroll', updateNavColor, { passive: true })
  window.addEventListener('resize', updateNavColor)
}

export function initNavbarColor() {
  const navStatusEl = getNavStatusEl()
  if (!navStatusEl) return undefined

  attachListeners()
  scheduleNavbarColorUpdate()

  return () => {
    scheduleUpdateId += 1
    navStatusEl.removeAttribute('data-nav-color')
  }
}

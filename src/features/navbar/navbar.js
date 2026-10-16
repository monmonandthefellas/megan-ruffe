import { getLenis } from '../../core/lenis.js'

const SCROLL_DELTA_THRESHOLD = 8
const TOP_ALWAYS_VISIBLE_OFFSET = 48
const TOP_HOVER_ZONE_RATIO = 0.05
const MOBILE_MENU_BREAKPOINT = 991

let isInitialized = false

function getNavigationEl() {
  return document.querySelector('[data-navigation-status]')
}

function isMenuOpen(navigationEl) {
  return navigationEl?.getAttribute('data-navigation-menu') === 'open'
}

function setNavScrollVisibility(navigationEl, visible) {
  navigationEl.setAttribute('data-navigation-scroll', visible ? 'visible' : 'hidden')
}

function updateMenuA11y(navigationEl, open) {
  navigationEl.querySelectorAll('[data-navigation-toggle="toggle"]').forEach((toggleBtn) => {
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false')
  })

  navigationEl.querySelectorAll('.navbar__menu').forEach((menuEl) => {
    menuEl.setAttribute('aria-hidden', open ? 'false' : 'true')
  })
}

const MENU_LINK_ENTER_STAGGER = 0.05
const MENU_LINK_EXIT_STAGGER = 0.04
const MENU_LINK_ENTER_BASE_DELAY = 0.12

function applyMenuItemDelays(root, { open } = { open: false }) {
  const items = [...root.querySelectorAll('[data-navigation-item]')]

  items.forEach((item, index) => {
    if (open) {
      item.style.transitionDelay = `${MENU_LINK_ENTER_BASE_DELAY + index * MENU_LINK_ENTER_STAGGER}s`
      return
    }

    // Reverse of enter: last link leaves first
    const reverseIndex = items.length - 1 - index
    item.style.transitionDelay = `${reverseIndex * MENU_LINK_EXIT_STAGGER}s`
  })
}

function setMenuOpen(navigationEl, open) {
  if (!navigationEl.hasAttribute('data-navigation-menu')) {
    navigationEl.setAttribute('data-navigation-menu', 'closed')
  }

  applyMenuItemDelays(navigationEl, { open })

  // Ensure new transition-delays apply to this state change
  void navigationEl.offsetHeight

  navigationEl.setAttribute('data-navigation-menu', open ? 'open' : 'closed')
  updateMenuA11y(navigationEl, open)

  if (open) {
    getLenis()?.stop()
    return
  }

  getLenis()?.start()
}

function closeMenu(navigationEl = getNavigationEl()) {
  if (!navigationEl || !isMenuOpen(navigationEl)) return
  setMenuOpen(navigationEl, false)
}

function initNavbarScrollBehavior(getNavigation) {
  const lenis = getLenis()
  let lastScrollY = lenis?.scroll ?? window.scrollY
  let isHoveringTopZone = false

  function getScrollY() {
    return lenis?.scroll ?? window.scrollY
  }

  function updateNavScrollVisibility() {
    const navigationEl = getNavigation()
    if (!navigationEl) return

    const scrollY = getScrollY()

    if (isMenuOpen(navigationEl) || scrollY <= TOP_ALWAYS_VISIBLE_OFFSET || isHoveringTopZone) {
      setNavScrollVisibility(navigationEl, true)
      lastScrollY = scrollY
      return
    }

    const scrollDelta = scrollY - lastScrollY

    if (Math.abs(scrollDelta) < SCROLL_DELTA_THRESHOLD) {
      return
    }

    setNavScrollVisibility(navigationEl, scrollDelta < 0)
    lastScrollY = scrollY
  }

  function onMouseMove(event) {
    const inTopZone = event.clientY <= window.innerHeight * TOP_HOVER_ZONE_RATIO

    if (inTopZone === isHoveringTopZone) {
      return
    }

    isHoveringTopZone = inTopZone
    updateNavScrollVisibility()
  }

  const navigationEl = getNavigation()
  if (navigationEl) {
    setNavScrollVisibility(navigationEl, true)
  }

  lenis?.on('scroll', updateNavScrollVisibility)
  window.addEventListener('scroll', updateNavScrollVisibility, { passive: true })
  window.addEventListener('mousemove', onMouseMove)
}

/**
 * Call after Barba page enter — nav lives inside data-barba="container"
 * and is replaced on each transition.
 */
export function refreshNavigationBar(container = document) {
  const navigationEl = container.querySelector?.('[data-navigation-status]') ?? getNavigationEl()
  if (!navigationEl) return

  if (!navigationEl.hasAttribute('data-navigation-menu')) {
    navigationEl.setAttribute('data-navigation-menu', 'closed')
  }

  updateMenuA11y(navigationEl, isMenuOpen(navigationEl))
  applyMenuItemDelays(navigationEl, { open: isMenuOpen(navigationEl) })
}

export function initNavigationBar() {
  if (isInitialized) {
    refreshNavigationBar()
    return
  }
  isInitialized = true

  refreshNavigationBar()

  document.addEventListener('click', (event) => {
    const navigationEl = getNavigationEl()
    if (!navigationEl) return

    const toggleBtn = event.target.closest('[data-navigation-toggle="toggle"]')
    if (toggleBtn) {
      setMenuOpen(navigationEl, !isMenuOpen(navigationEl))
      return
    }

    const closeBtn = event.target.closest('[data-navigation-toggle="close"]')
    if (closeBtn) {
      closeMenu(navigationEl)
      return
    }

    const menuLink = event.target.closest('.navbar__menu-link')
    if (menuLink && navigationEl.contains(menuLink)) {
      closeMenu(navigationEl)
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    closeMenu()
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_MENU_BREAKPOINT) {
      closeMenu()
    }
  })

  initNavbarScrollBehavior(getNavigationEl)
}

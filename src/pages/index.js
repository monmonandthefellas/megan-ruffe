import { initHomePage } from './home.js'
import { initUpcomingPage } from './upcoming.js'
import { initProjectPage } from './project.js'

const pageModules = {
  home: initHomePage,
  upcoming: initUpcomingPage,
  project: initProjectPage,
}

function getPageName(container) {
  return (
    container.dataset?.barbaNamespace ||
    container.querySelector('[data-page]')?.dataset.page ||
    document.body.dataset.page
  )
}

export function initPageModule({ container = document } = {}) {
  const pageName = getPageName(container)
  const initializer = pageModules[pageName]

  if (!initializer) {
    return undefined
  }

  return initializer({ container })
}

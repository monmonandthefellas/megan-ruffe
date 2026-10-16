import { initBarba } from './barba.js'
import { restartWebflow } from './webflow.js'
import { initGlobalFeatures } from '../features/global.js'
import { initPageLoad } from '../features/page-load.js'
import { initPageModule } from '../pages/index.js'
import { initScrollIndicator } from '../features/scroll-indicator.js'
import { initDrawRandomUnderline } from '../features/draw-underline-btn.js'
import { initNavbarColor } from '../features/navbar/navbar-color.js'
import { refreshNavigationBar } from '../features/navbar/navbar.js'

let cleanupCurrentPage = () => {}

function runInitializers(initializers, context) {
  const cleanups = initializers
    .map((initializer) => initializer(context))
    .filter((cleanup) => typeof cleanup === 'function')

  return () => {
    const orderedCleanups = [...cleanups].reverse()
    orderedCleanups.forEach((cleanup) => cleanup())
  }
}

export function initPage(container = document) {
  refreshNavigationBar(container)
  cleanupCurrentPage = runInitializers(
    [initPageLoad, initPageModule, initScrollIndicator, initDrawRandomUnderline, initNavbarColor],
    { container },
  )
  restartWebflow()
}

export function destroyPage() {
  cleanupCurrentPage()
  cleanupCurrentPage = () => {}
}

export function startApp() {
  initGlobalFeatures()
  initDrawRandomUnderline()
  
  if (document.querySelector('[data-barba="wrapper"]')) {
    initBarba({ initPage, destroyPage })
    return
  }

  initPage(document)
}

import barba from '@barba/core'
import { getLenis } from './lenis.js'
import { scheduleNavbarColorUpdate } from '../features/navbar/navbar-color.js'

export function initBarba({ initPage, destroyPage }) {
  barba.init({
    preventRunning: true,
    transitions: [
      {
        name: 'default',
        once({ next }) {
          initPage(next.container)
          scheduleNavbarColorUpdate()
        },
        leave() {
          destroyPage()
        },
        enter({ next }) {
          initPage(next.container)
          getLenis()?.scrollTo(0, { immediate: true })
          scheduleNavbarColorUpdate()
        },
      },
    ],
  })
}

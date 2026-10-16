import {gsap} from '../core/gsap.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initParallax } from '../features/parallax.js'

const DESKTOP_MEDIA_QUERY = '(min-width: 992px)'

export function initProjectPage({ container = document } = {}) {
    const cleanupParallax = initParallax({ container })
    //==============Variables==============//
    const section = container.querySelector('[data-vi-section]')
    const phases = Array.from(container.querySelectorAll('[data-vi-phase]'))

    const phaseData = phases.map(phaseEl => ({
        id: phaseEl.dataset.viPhase,
        phase: phaseEl,
        title: phaseEl.querySelector('[data-vi-text="title"]'),
        description: phaseEl.querySelector('[data-vi-text="description"]'),
        caption: Array.from(phaseEl.querySelectorAll('[data-vi-text="caption"]')),
        images: Array.from(phaseEl.querySelectorAll('[data-vi-image]')),
      }))

    if (!phaseData.length || !section) {
        return cleanupParallax
    }

    gsap.registerPlugin(ScrollTrigger) 
    const media = gsap.matchMedia()

    media.add(DESKTOP_MEDIA_QUERY, () => {
        //==============Initial Reset==============//
        for (let i = 0; i < phaseData.length; i++) {
            const isFirstPhase = i === 0
            gsap.set(phaseData[i].phase, {opacity: isFirstPhase ? 1 : 0})

            for (let j = 0; j < phaseData[i].images.length; j++) {
                gsap.set(phaseData[i].images[j], {
                    opacity: isFirstPhase ? 1 : 0
                })
            }

            if (phaseData[i].title) {
                gsap.set(phaseData[i].title, {opacity: isFirstPhase ? 1 : 0})
            }

            if (phaseData[i].description) {
                gsap.set(phaseData[i].description, {opacity: isFirstPhase ? 1 : 0})
            }

            if (phaseData[i].caption) {
                for (let j = 0; j < phaseData[i].caption.length; j++) {
                    gsap.set(phaseData[i].caption[j], {opacity: isFirstPhase ? 1 : 0})
                }
            }
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                //markers: false,
                pin: true, // pin the trigger element while active
                start: "top top", // when the top of the trigger hits the top of the viewport
                end: `+=${phaseData.length * 200}%`,
                scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
            },
        })

        phaseData.forEach((activePhase, index) => {
            const nextPhase = phaseData[index + 1]
            const isFirstPhase = index === 0
            tl.set(activePhase.phase, {opacity: 1})

            if (nextPhase) {
                tl.set(nextPhase.phase, {opacity: 1}, '<')

                tl.to(nextPhase.images, {
                    opacity: 0.2,
                    ease: 'power2.inOut',
                }, '<')
            }

            if (!isFirstPhase && activePhase.title) {
                tl.to(activePhase.title, {
                    opacity: 1,
                    ease: 'power2.inOut',
                })
            }

            if (!isFirstPhase && activePhase.description) {
                tl.to(activePhase.description, {
                    opacity: 1,
                    ease: 'power2.inOut',
                })
            }

            if (!isFirstPhase && activePhase.caption) {
                for (let j = 0; j < activePhase.caption.length; j++) {
                    tl.to(activePhase.caption[j], {
                        opacity: 1,
                        ease: 'power2.inOut',
                    })
                }
            }

            if (!nextPhase) return

            tl.to(activePhase.phase, {
                opacity: 0,
                ease: 'power2.inOut',
            })

            tl.to(nextPhase.images, {
                opacity: 1,
                ease: 'power2.inOut',
            }, '<')
        })

        return () => {
            tl.kill()
        }
    })

    return () => {
        media.revert()
        cleanupParallax?.()
    }
}
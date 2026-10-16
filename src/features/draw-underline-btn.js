import { gsap } from '../core/gsap.js'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin);

export function initDrawRandomUnderline() {

  const svgNext = `<svg width="299" height="15" viewBox="0 0 299 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 7.5H295M295 7.5L288 1M295 7.5L288 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  const svgPrev = `<svg width="299" height="15" viewBox="0 0 299 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M298 7.5H4M4 7.5L11 1M4 7.5L11 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  // Add attributes to <svg> elements
  function decorateSVG(svgEl) {
    svgEl.setAttribute('preserveAspectRatio', 'none');
    svgEl.querySelectorAll('path').forEach(path => {
      path.setAttribute('stroke', 'currentColor');
    });
  }

  document.querySelectorAll('[data-draw-line]').forEach(container => {
    const box = container.querySelector('[data-draw-line-box]');
    if (!box) return;

    const isReversed = box.dataset.drawLineBox === 'alt';
    const svgMarkup = isReversed ? svgPrev : svgNext;
    const drawStart = '0%';
    const drawEnd = '100%';
    const drawExit = '100% 100%';
    let enterTween = null;
    let leaveTween = null;

    container.addEventListener('mouseenter', () => {
      // Don't restart if still playing
      if (enterTween && enterTween.isActive()) return;
      if (leaveTween && leaveTween.isActive()) leaveTween.kill();

      // Animate Draw
      box.innerHTML = svgMarkup;
      const svg = box.querySelector('svg');
      if (svg) {
        decorateSVG(svg);
        const path = svg.querySelector('path');
        if (path) {
          gsap.set(path, { drawSVG: drawStart });
          enterTween = gsap.to(path, {
            duration: 0.5,
            drawSVG: drawEnd,
            ease: 'power2.inOut',
            onComplete: () => { enterTween = null; }
          });
        }
      }
    });

    container.addEventListener('mouseleave', () => {
      const path = box.querySelector('path');
      if (!path) return;

      const playOut = () => {
        // Don't restart if still drawing out
        if (leaveTween && leaveTween.isActive()) return;
        leaveTween = gsap.to(path, {
          duration: 0.5,
          drawSVG: drawExit,
          ease: 'power2.inOut',
          onComplete: () => {
            leaveTween = null;
            box.innerHTML = ''; // remove SVG when done
          }
        });
      };

      if (enterTween && enterTween.isActive()) {
        // Wait until draw-in finishes
        enterTween.eventCallback('onComplete', playOut);
      } else {
        playOut();
      }
    });
  });
}
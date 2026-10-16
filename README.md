# Webflow Custom Code Starter

This repo is a Vite starter for Webflow projects where Webflow owns the HTML, CSS, and CMS, while custom JavaScript is developed locally and deployed through Vercel.

## What Was Set Up

- Vite is configured to run locally on `localhost:5173` with CORS enabled, so Webflow can load your local JavaScript while you develop.
- Production builds output one stable bundled file: `dist/webflow.js`.
- Vercel is configured to run `npm run build`, serve the `dist` folder, and allow the bundle to be loaded from Webflow.
- Barba.js is installed and wired into a reusable page lifecycle.
- Lenis and GSAP are installed and initialized globally.
- JavaScript is split by responsibility:
  - `src/main.js` starts the app.
  - `src/core/` contains app lifecycle, Barba, Lenis, GSAP, and Webflow reinitialization helpers.
  - `src/features/` contains reusable features, such as page-load behavior.
  - `src/pages/` contains page-specific modules.

## Local Development

Start Vite:

```bash
npm run dev
```

In Webflow, add this while developing:

```html
<script type="module" src="http://localhost:5173/src/main.js"></script>
```

Keep the Vite terminal running. When you edit files in `src`, Webflow will load the local code from your machine.

## Production

Build locally when you want to test the production output:

```bash
npm run build
```

After pushing to GitHub, Vercel builds the project and serves:

```text
https://your-vercel-project.vercel.app/webflow.js
```

In Webflow, replace the local development snippet with:

```html
<script src="https://your-vercel-project.vercel.app/webflow.js"></script>
```

## Barba Structure

For Barba-powered pages, the Webflow page should include the usual wrapper/container attributes:

```html
<div data-barba="wrapper">
  <main data-barba="container" data-barba-namespace="home">
    <!-- Webflow page content -->
  </main>
</div>
```

The `data-barba-namespace` value maps to page modules in `src/pages/index.js`.

Example:

```js
const pageModules = {
  home: initHomePage,
}
```

To add another page, create a new file in `src/pages/`, export an initializer, then register it in `src/pages/index.js`.

## Feature Modules

Put reusable behavior in `src/features/`. A feature initializer should receive a `container` and may return a cleanup function:

```js
export function initExampleFeature({ container = document } = {}) {
  const elements = Array.from(container.querySelectorAll('[data-example]'))

  elements.forEach((element) => {
    element.classList.add('is-active')
  })

  return () => {
    elements.forEach((element) => {
      element.classList.remove('is-active')
    })
  }
}
```

Register reusable per-page features in `src/core/app.js`.

## Lenis And GSAP

Lenis starts once from `src/core/lenis.js`. GSAP defaults are configured once from `src/core/gsap.js`.

Import them inside features or page modules when needed:

```js
import { gsap } from '../core/gsap.js'
import { getLenis } from '../core/lenis.js'

export function initExampleAnimation({ container = document } = {}) {
  const element = container.querySelector('[data-animate]')

  if (!element) {
    return undefined
  }

  gsap.from(element, { autoAlpha: 0, y: 24 })

  return () => {
    gsap.killTweensOf(element)
  }
}
```

## Webflow Notes

- Webflow interactions are restarted after each page init through `src/core/webflow.js`.
- Lenis is initialized globally. Add any Lenis-specific CSS in Webflow if a project needs it.
- Page-load behavior lives in `src/features/page-load.js` and targets elements with `data-page-load`.
- Keep CSS in Webflow unless a project truly needs JS-owned styles.
- The local Vite `index.html` is only a smoke test page. The production bundle does not create Webflow markup.

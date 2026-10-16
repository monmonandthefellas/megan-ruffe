export function restartWebflow() {
  const Webflow = window.Webflow

  if (!Webflow) {
    return
  }

  Webflow.destroy?.()
  Webflow.ready?.()
  Webflow.require?.('ix2')?.init?.()
}

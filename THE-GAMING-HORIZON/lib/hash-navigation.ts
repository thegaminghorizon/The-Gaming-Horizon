export function focusHashTarget(hash: string, behavior: ScrollBehavior = 'smooth') {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return false
  const target = document.getElementById(id)
  if (!target) return false

  target.scrollIntoView({ behavior, block: 'start' })
  const heading = target.matches('h1,h2,h3,[data-focus-target]')
    ? target
    : target.querySelector<HTMLElement>('h1,h2,h3,[data-focus-target]')
  const focusTarget = (heading || target) as HTMLElement
  const hadTabIndex = focusTarget.hasAttribute('tabindex')
  if (!hadTabIndex) focusTarget.setAttribute('tabindex', '-1')
  window.setTimeout(() => {
    focusTarget.focus({ preventScroll: true })
    if (!hadTabIndex) {
      focusTarget.addEventListener('blur', () => focusTarget.removeAttribute('tabindex'), { once: true })
    }
  }, behavior === 'smooth' ? 420 : 30)
  return true
}

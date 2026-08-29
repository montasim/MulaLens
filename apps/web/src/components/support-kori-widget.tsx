import { useEffect } from 'react'

const scriptId = 'mulalens-support-kori-script'
const dialogId = 'mulalens-support-kori-dialog'
const buttonSelector = '.sk-widget-btn'
const dialogSelector = '.sk-widget-iframe-container'

function removeExistingWidget() {
  document.getElementById(scriptId)?.remove()
  document
    .querySelectorAll(`${buttonSelector}, ${dialogSelector}`)
    .forEach((node) => node.remove())
  document
    .querySelectorAll('style[data-mulalens-support-kori]')
    .forEach((node) => node.remove())
}

export function SupportKoriWidget() {
  useEffect(() => {
    removeExistingWidget()

    const existingStyles = new Set(document.head.querySelectorAll('style'))
    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://www.supportkori.com/widget.js'
    script.async = true
    script.dataset.id = 'montasim'
    script.dataset.message = 'Support'
    script.dataset.color = '#187f73'
    script.dataset.position = 'right'

    let button: HTMLElement | null = null
    let dialog: HTMLElement | null = null
    let iframe: HTMLIFrameElement | null = null
    let stateObserver: MutationObserver | null = null

    const syncState = () => {
      const open = dialog?.classList.contains('open') ?? false
      button?.setAttribute('aria-expanded', String(open))
      dialog?.setAttribute('aria-hidden', String(!open))
      if (iframe) iframe.tabIndex = open ? 0 : -1
    }

    const handleButtonKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        button?.click()
      } else if (event.key === 'Escape' && dialog?.classList.contains('open')) {
        event.preventDefault()
        button?.click()
        button?.focus()
      }
    }

    const enhanceWidget = () => {
      const nextButton = document.querySelector<HTMLElement>(buttonSelector)
      const nextDialog = document.querySelector<HTMLElement>(dialogSelector)
      const nextIframe =
        nextDialog?.querySelector<HTMLIFrameElement>('iframe') ?? null

      if (!nextButton || !nextDialog || !nextIframe) return false
      if (button === nextButton && stateObserver) return true

      button = nextButton
      dialog = nextDialog
      iframe = nextIframe

      button.setAttribute('role', 'button')
      button.setAttribute('tabindex', '0')
      button.setAttribute('aria-label', 'Open support panel')
      button.setAttribute('aria-haspopup', 'dialog')
      button.setAttribute('aria-controls', dialogId)
      button.addEventListener('keydown', handleButtonKeyDown)

      dialog.id = dialogId
      dialog.setAttribute('role', 'dialog')
      dialog.setAttribute('aria-label', 'Support Montasim on SupportKori')
      iframe.title = 'Support Montasim on SupportKori'

      stateObserver = new MutationObserver(syncState)
      stateObserver.observe(dialog, {
        attributes: true,
        attributeFilter: ['class'],
      })
      syncState()

      document.head.querySelectorAll('style').forEach((style) => {
        if (
          !existingStyles.has(style) &&
          style.textContent.includes(buttonSelector)
        ) {
          style.dataset.mulalensSupportKori = 'true'
        }
      })

      return true
    }

    const bodyObserver = new MutationObserver(() => {
      if (enhanceWidget()) bodyObserver.disconnect()
    })

    script.addEventListener('load', enhanceWidget)
    document.body.appendChild(script)

    if (!enhanceWidget()) {
      bodyObserver.observe(document.body, { childList: true })
    }

    return () => {
      bodyObserver.disconnect()
      stateObserver?.disconnect()
      button?.removeEventListener('keydown', handleButtonKeyDown)
      script.removeEventListener('load', enhanceWidget)
      removeExistingWidget()
    }
  }, [])

  return null
}

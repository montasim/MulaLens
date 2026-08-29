import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { SupportKoriWidget } from '../components/support-kori-widget'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'MulaLens | Research before you join' },
      {
        name: 'description',
        content:
          'Research company culture, reported pay, open roles, and workplace stories without leaving Deshi Mula.',
      },
      { property: 'og:title', content: 'MulaLens' },
      {
        property: 'og:description',
        content: 'Research the workplace before you accept the offer.',
      },
      { name: 'theme-color', content: '#101715' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/brand/logo.png', type: 'image/png' },
    ],
  }),
  shellComponent: RootDocument,
})

const themeScript = `
  (() => {
    const stored = localStorage.getItem('mulalens-theme');
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
  })();
`

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <SupportKoriWidget />
        <Scripts />
      </body>
    </html>
  )
}

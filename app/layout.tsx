import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FX Journal — Forex Trading Journal',
  description: 'Track forex trades, daily journal, psychology tests & economic news.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='id' className='dark'>
      <body>
        <a href='#main-content' className='skip-link'>Skip to main content</a>
        {children}
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getGlobalStats } from '@/lib/db'
import AppShell from '@/components/layout/AppShell'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stats = await getGlobalStats().catch(() => ({ pnl:0, winRate:0, journalDays:0, totalTrades:0 }))

  return (
    <html lang='id' className='dark'>
      <body>
        <a href='#main-content' className='skip-link'>Skip to main content</a>
        <AppShell stats={stats}>{children}</AppShell>
      </body>
    </html>
  )
}

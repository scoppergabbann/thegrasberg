
import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header  from '@/components/layout/Header'
import { getGlobalStats } from '@/lib/db'

export const metadata: Metadata = {
  title: 'FX Journal — Forex Trading Journal',
  description: 'Track forex trades, daily journal, psychology tests & economic news.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Server-side fetch — runs on every request, always fresh
  const stats = await getGlobalStats().catch(() => ({ pnl:0, winRate:0, journalDays:0, totalTrades:0 }))

  return (
    <html lang='id' className='dark'>
      <body>
        <a href='#main-content' className='skip-link'>Skip to main content</a>
        <div className='flex h-screen overflow-hidden'>
          <Sidebar />
          <div className='flex flex-col flex-1 overflow-hidden'>
            <Header stats={stats} />
            <main id='main-content' className='flex-1 overflow-y-auto p-6' tabIndex={-1}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}

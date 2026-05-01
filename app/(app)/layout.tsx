import { getGlobalStats } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth — middleware should already block, but verify here too
  const session = await getSession()
  if (!session) redirect('/login')

  const stats = await getGlobalStats().catch(() =>
    ({ pnl: 0, winRate: 0, journalDays: 0, totalTrades: 0 })
  )

  return (
    <AppShell stats={stats} username={session.username}>
      {children}
    </AppShell>
  )
}

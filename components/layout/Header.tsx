
import { formatPnl, pnlColor } from '@/lib/utils'
import type { GlobalStats } from '@/types'

export default function Header({ stats }: { stats: GlobalStats }) {
  const { pnl, winRate, journalDays, totalTrades } = stats
  return (
    <header className='h-14 border-b border-zinc-800 bg-[#0d0d0d] flex items-center justify-end px-6 gap-6 shrink-0' role='banner'>
      <Stat label='Total PNL'       value={formatPnl(pnl)}          cls={pnlColor(pnl)} />
      <Stat label='Win Rate'        value={`${winRate}%`}            cls={winRate >= 50 ? 'text-green-400' : 'text-red-400'} />
      <Stat label='Total Trades'    value={String(totalTrades)}      cls='text-zinc-200' />
      <Stat label='Journal Entries' value={String(journalDays)}      cls='text-amber-400' />
    </header>
  )
}
function Stat({ label, value, cls }: { label:string; value:string; cls:string }) {
  return (
    <div className='text-right' aria-label={`${label}: ${value}`}>
      <p className={`mono text-sm font-semibold ${cls}`}>{value}</p>
      <p className='text-[10px] text-zinc-500 mt-0.5'>{label}</p>
    </div>
  )
}

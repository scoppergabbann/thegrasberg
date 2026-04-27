'use client'

import { formatPnl, pnlColor } from '@/lib/utils'
import { Toolbar } from '@/components/ui/UIControls'
import type { GlobalStats } from '@/types'

interface Props {
  stats: GlobalStats
  fz: number
  zoomIn:  () => void
  zoomOut: () => void
  reset:   () => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  toggleMobile:  () => void
}

export default function Header(props: Props) {
  const { stats, ...toolbarProps } = props
  const { pnl, winRate, journalDays, totalTrades } = stats

  return (
    <header className='h-14 border-b border-zinc-800 bg-[#0d0d0d] flex items-center px-3 sm:px-6 gap-3 shrink-0' role='banner'>
      <Toolbar {...toolbarProps} />

      {/* Stats — horizontal scroll on small screens */}
      <div className='flex items-center gap-4 sm:gap-6 ml-auto overflow-x-auto scrollbar-none'>
        <Stat label='Total PNL'    value={formatPnl(pnl)}     cls={pnlColor(pnl)} />
        <Stat label='Win Rate'     value={`${winRate}%`}      cls={winRate >= 50 ? 'text-green-400' : 'text-red-400'} />
        <Stat label='Trades'       value={String(totalTrades)} cls='text-zinc-200' hideOnXs />
        <Stat label='Journal'      value={String(journalDays)} cls='text-amber-400' hideOnXs />
      </div>
    </header>
  )
}

function Stat({ label, value, cls, hideOnXs }: { label: string; value: string; cls: string; hideOnXs?: boolean }) {
  return (
    <div className={`text-right shrink-0 ${hideOnXs ? 'hidden sm:block' : ''}`} aria-label={`${label}: ${value}`}>
      <p className={`mono text-sm font-semibold ${cls}`}>{value}</p>
      <p className='text-xs text-zinc-500 mt-0.5'>{label}</p>
    </div>
  )
}

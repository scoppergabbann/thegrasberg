import { LineChart } from 'lucide-react'
import { cn, formatPnl, pnlColor } from '@/lib/utils'
import type { PairPerformance } from '@/lib/analytics'

export default function PairBreakdown({ data }: { data: PairPerformance[] }) {
  if (data.length === 0) {
    return (
      <div className='card p-4 sm:p-5'>
        <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 flex items-center gap-2'>
          <LineChart className='w-3.5 h-3.5' aria-hidden='true' />
          Pair Performance
        </h2>
        <p className='text-xs text-zinc-600'>Belum ada data</p>
      </div>
    )
  }
  const maxAbsPnl = Math.max(...data.map(p => Math.abs(p.pnl)), 1)

  return (
    <div className='card p-4 sm:p-5'>
      <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 flex items-center gap-2'>
        <LineChart className='w-3.5 h-3.5' aria-hidden='true' />
        Pair Performance
      </h2>
      <div className='space-y-2.5'>
        {data.slice(0, 10).map(p => (
          <div key={p.pair}>
            <div className='flex items-center justify-between gap-2 mb-1'>
              <span className='mono text-xs font-semibold text-zinc-200'>{p.pair}</span>
              <div className='flex items-center gap-3 text-xs'>
                <span className={cn('mono', p.winRate >= 50 ? 'text-green-400' : 'text-red-400')}>{p.winRate.toFixed(0)}%</span>
                <span className={cn('mono font-semibold w-20 text-right', pnlColor(p.pnl))}>{formatPnl(p.pnl)}</span>
                <span className='text-zinc-500 mono w-8 text-right'>{p.trades}T</span>
              </div>
            </div>
            <div className='h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
              <div className='h-full rounded-full transition-all'
                style={{ width: `${(Math.abs(p.pnl) / maxAbsPnl) * 100}%`, background: p.pnl >= 0 ? '#16a34a' : '#dc2626' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

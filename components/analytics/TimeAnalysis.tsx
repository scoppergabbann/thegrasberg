import { cn, formatPnl, pnlColor } from '@/lib/utils'
import type { TimeBucket } from '@/lib/analytics'

interface Props { title: string; data: TimeBucket[] }

export default function TimeAnalysis({ title, data }: Props) {
  const totalTrades = data.reduce((a, d) => a + d.trades, 0)
  const maxAbsPnl   = Math.max(...data.map(d => Math.abs(d.pnl)), 1)

  return (
    <div className='card p-4 sm:p-5'>
      <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-4'>{title}</h2>
      {totalTrades === 0 ? (
        <p className='text-xs text-zinc-600'>Belum ada data</p>
      ) : (
        <div className='space-y-3'>
          {data.map(d => {
            const pct = totalTrades ? (d.trades / totalTrades) * 100 : 0
            return (
              <div key={d.label}>
                <div className='flex items-center justify-between gap-2 mb-1'>
                  <span className='text-xs font-semibold text-zinc-200'>{d.label}</span>
                  <div className='flex items-center gap-2 text-xs'>
                    <span className={cn('mono font-semibold', pnlColor(d.pnl))}>{formatPnl(d.pnl)}</span>
                    <span className={cn('mono', d.winRate >= 50 ? 'text-green-400' : 'text-red-400')}>
                      {d.winRate.toFixed(0)}% WR
                    </span>
                    <span className='text-zinc-500 mono w-10 text-right'>{d.trades}T</span>
                  </div>
                </div>
                {/* Composite bar: PNL bar + volume indicator */}
                <div className='relative h-2 bg-zinc-800 rounded-full overflow-hidden'>
                  <div
                    className='absolute top-0 left-0 h-full rounded-full transition-all'
                    style={{
                      width: `${(Math.abs(d.pnl) / maxAbsPnl) * 100}%`,
                      background: d.pnl >= 0 ? '#16a34a' : '#dc2626',
                    }}
                  />
                </div>
                <div className='flex justify-between mt-0.5'>
                  <span className='text-xs text-zinc-600'>Avg ${d.avgPnl >= 0 ? '+' : '-'}${Math.abs(d.avgPnl).toFixed(0)}/trade</span>
                  <span className='text-xs text-zinc-600'>{pct.toFixed(0)}% volume</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

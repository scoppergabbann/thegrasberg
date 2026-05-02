import { Tag, Info } from 'lucide-react'
import { cn, formatPnl, pnlColor } from '@/lib/utils'
import type { TagPerformance } from '@/lib/analytics-deep'

export default function TagsTab({ data, totalTrades }: { data: TagPerformance[]; totalTrades: number }) {
  if (data.length === 0) {
    return (
      <div className='card p-4 sm:p-5'>
        <div className='flex gap-2.5 items-start mb-4'>
          <Tag className='w-5 h-5 text-zinc-400 shrink-0 mt-0.5' aria-hidden='true' />
          <div>
            <p className='text-sm font-semibold text-zinc-100'>Belum ada custom tag</p>
            <p className='text-xs text-zinc-500 mt-1'>Tag trade dengan label custom (mis: "FOMO", "Disiplin", "Setup A+") untuk analisa pattern personal.</p>
          </div>
        </div>

        <div className='p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2'>
          <p className='text-xs font-semibold text-zinc-300'>💡 Contoh tags yang berguna:</p>
          <div className='flex flex-wrap gap-1.5 text-xs'>
            {['FOMO','Disiplin','Setup A+','Plan Followed','News-driven','Counter-trend','Scalp','Swing','Anti-trend','Confluence A+'].map(t => (
              <span key={t} className='px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300'>{t}</span>
            ))}
          </div>
          <p className='text-xs text-zinc-500 pt-2'>
            Saat add trade, isi field <span className='mono text-zinc-300'>Custom Tags</span> (multi-input dengan koma).
            Contoh: <span className='mono text-zinc-300'>FOMO, Counter-trend</span>
          </p>
        </div>
      </div>
    )
  }

  const maxAbs = Math.max(...data.map(d => Math.abs(d.pnl)), 1)
  const winners = data.filter(d => d.pnl > 0)
  const losers  = data.filter(d => d.pnl < 0)

  return (
    <>
      {/* Quick stats */}
      <div className='grid grid-cols-3 gap-2 sm:gap-3'>
        <div className='stat-card'>
          <p className='mono text-base sm:text-lg font-semibold text-zinc-200'>{data.length}</p>
          <p className='text-xs text-zinc-500 mt-0.5'>Unique Tags</p>
        </div>
        <div className='stat-card'>
          <p className='mono text-base sm:text-lg font-semibold text-green-400'>{winners.length}</p>
          <p className='text-xs text-zinc-500 mt-0.5'>Profitable Tags</p>
        </div>
        <div className='stat-card'>
          <p className='mono text-base sm:text-lg font-semibold text-red-400'>{losers.length}</p>
          <p className='text-xs text-zinc-500 mt-0.5'>Losing Tags</p>
        </div>
      </div>

      {/* Best & worst tag */}
      {data.length >= 2 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='card p-4 bg-green-950/30 border-green-900'>
            <p className='text-xs text-green-400 font-semibold mb-1'>🏆 Best Tag</p>
            <p className='text-base font-bold text-zinc-100 mb-1'>{data[0].tag}</p>
            <p className='text-xs text-zinc-400'>
              {formatPnl(data[0].pnl)} · {data[0].winRate.toFixed(0)}% WR · {data[0].trades} trades
            </p>
            <p className='text-xs text-zinc-500 mt-1'>
              Avg ${data[0].avgPnl >= 0 ? '+' : '-'}{Math.abs(data[0].avgPnl).toFixed(2)}/trade
            </p>
          </div>
          {data[data.length - 1].pnl < 0 && (
            <div className='card p-4 bg-red-950/30 border-red-900'>
              <p className='text-xs text-red-400 font-semibold mb-1'>⚠️ Worst Tag</p>
              <p className='text-base font-bold text-zinc-100 mb-1'>{data[data.length - 1].tag}</p>
              <p className='text-xs text-zinc-400'>
                {formatPnl(data[data.length - 1].pnl)} · {data[data.length - 1].winRate.toFixed(0)}% WR · {data[data.length - 1].trades} trades
              </p>
              <p className='text-xs text-zinc-500 mt-1'>
                Pertimbangkan stop tag/setup ini
              </p>
            </div>
          )}
        </div>
      )}

      {/* Full breakdown */}
      <div className='card p-4 sm:p-5'>
        <h3 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-4 flex items-center gap-2'>
          <Tag className='w-3.5 h-3.5' aria-hidden='true' />
          Performance per Tag
        </h3>

        <div className='space-y-2.5'>
          {data.map(d => (
            <div key={d.tag} className={cn('p-3 rounded-lg border',
              d.pnl >= 0 ? 'bg-green-950/15 border-green-900/40' : 'bg-red-950/15 border-red-900/40'
            )}>
              <div className='flex items-center justify-between gap-2 mb-2'>
                <div className='flex items-center gap-2 min-w-0'>
                  <span className={cn('text-xs px-2 py-0.5 rounded font-semibold border',
                    d.pnl >= 0 ? 'bg-green-950 text-green-400 border-green-900' : 'bg-red-950 text-red-400 border-red-900'
                  )}>
                    {d.tag}
                  </span>
                  <span className='text-xs text-zinc-500 mono'>{d.trades}T</span>
                </div>
                <span className={cn('mono text-sm font-bold', pnlColor(d.pnl))}>{formatPnl(d.pnl)}</span>
              </div>

              <div className='h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2'>
                <div className='h-full rounded-full transition-all'
                  style={{ width: `${(Math.abs(d.pnl) / maxAbs) * 100}%`, background: d.pnl >= 0 ? '#16a34a' : '#dc2626' }} />
              </div>

              <div className='flex items-center justify-between text-xs'>
                <span className={cn('mono', d.winRate >= 50 ? 'text-green-400' : 'text-red-400')}>
                  {d.winRate.toFixed(0)}% WR
                </span>
                <span className='text-zinc-500'>
                  Avg ${d.avgPnl >= 0 ? '+' : '-'}{Math.abs(d.avgPnl).toFixed(2)}/trade
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className='p-3 rounded-lg bg-blue-950/30 border border-blue-900 flex gap-2 items-start'>
        <Info className='w-4 h-4 text-blue-400 shrink-0 mt-0.5' aria-hidden='true' />
        <p className='text-xs text-blue-300 leading-relaxed'>
          <strong>Pro tip:</strong> Konsisten gunakan tag yang sama (mis: selalu tag "Disiplin" jika follow plan). Setelah 20+ trade, pattern akan jelas — tag mana yang harus dipertahankan, mana yang harus distop.
        </p>
      </div>
    </>
  )
}

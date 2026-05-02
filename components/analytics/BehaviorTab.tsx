import { Activity, Repeat, Flame, AlertTriangle, TrendingDown, TrendingUp, Calendar } from 'lucide-react'
import { cn, formatPnl, pnlColor } from '@/lib/utils'
import type { BehaviorMetrics } from '@/lib/analytics-deep'

export default function BehaviorTab({ behavior, totalTrades }: { behavior: BehaviorMetrics; totalTrades: number }) {
  const b = behavior

  return (
    <>
      {/* Top metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3'>
        <Card icon={<Calendar className='w-3.5 h-3.5' />} label='Avg Trades/Day'
          value={b.avgTradesPerDay.toFixed(1)}
          color={b.avgTradesPerDay <= 3 ? 'text-green-400' : b.avgTradesPerDay <= 5 ? 'text-amber-400' : 'text-red-400'}
          sub={`${b.daysTraded} days · max ${b.maxTradesInOneDay}/day`}
          tooltip='Lebih dari 5 trade/hari = potensi overtrading' />

        <Card icon={<Flame className='w-3.5 h-3.5' />} label='Max Win Streak'
          value={`${b.maxConsecutiveWins}`} color='text-green-400'
          sub={b.consecutiveWins > 0 ? `Current: ${b.consecutiveWins}` : 'no streak'} />

        <Card icon={<TrendingDown className='w-3.5 h-3.5' />} label='Max Loss Streak'
          value={`${b.maxConsecutiveLosses}`}
          color={b.maxConsecutiveLosses >= 4 ? 'text-red-400' : 'text-amber-400'}
          sub={b.consecutiveLosses > 0 ? `Current: ${b.consecutiveLosses}` : 'no streak'} />

        <Card icon={<Repeat className='w-3.5 h-3.5' />} label='Revenge Trades'
          value={`${b.revengeTrades}`}
          color={b.revengeTrades === 0 ? 'text-green-400' : 'text-red-400'}
          sub={b.revengeTradesLossPnl < 0 ? `Loss: -$${Math.abs(b.revengeTradesLossPnl).toFixed(0)}` : 'no losses'}
          tooltip='Trade dalam 30 menit setelah loss di hari yang sama' />
      </div>

      {/* Post-loss vs Post-win behavior */}
      <div className='card p-4 sm:p-5'>
        <h3 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-4 flex items-center gap-2'>
          <Activity className='w-3.5 h-3.5' aria-hidden='true' />
          Post-Trade Behavior — Win Rate Analysis
        </h3>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='p-4 rounded-lg bg-red-950/30 border border-red-900'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingDown className='w-4 h-4 text-red-400' aria-hidden='true' />
              <p className='text-xs font-semibold text-red-300'>After Loss → next trade WR</p>
            </div>
            <p className={cn('mono text-2xl font-bold mb-1',
              b.postLossWinRate >= 50 ? 'text-green-400' : 'text-red-400'
            )}>
              {b.postLossWinRate.toFixed(0)}%
            </p>
            <p className='text-xs text-zinc-500'>
              {b.postLossWinRate < 30 ? '⚠️ Tilt strong — break sebelum trade lagi'
                : b.postLossWinRate < 45 ? 'Sedikit tilt — pause sejenak'
                : 'OK — recover dengan baik dari loss'}
            </p>
          </div>

          <div className='p-4 rounded-lg bg-green-950/30 border border-green-900'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-4 h-4 text-green-400' aria-hidden='true' />
              <p className='text-xs font-semibold text-green-300'>After Win → next trade WR</p>
            </div>
            <p className={cn('mono text-2xl font-bold mb-1',
              b.postWinWinRate >= 50 ? 'text-green-400' : 'text-amber-400'
            )}>
              {b.postWinWinRate.toFixed(0)}%
            </p>
            <p className='text-xs text-zinc-500'>
              {b.postWinWinRate >= 60 ? '🔥 Momentum bagus — disciplined'
                : b.postWinWinRate < 40 ? '⚠️ Overconfidence — perketat plan'
                : 'OK — konsisten'}
            </p>
          </div>
        </div>

        {/* Insight if there's significant difference */}
        {Math.abs(b.postWinWinRate - b.postLossWinRate) > 15 && (
          <div className='mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-900 flex gap-2 items-start'>
            <AlertTriangle className='w-4 h-4 text-amber-400 shrink-0 mt-0.5' aria-hidden='true' />
            <p className='text-xs text-amber-300 leading-relaxed'>
              <strong>Pattern terdeteksi:</strong> WR setelah {b.postWinWinRate > b.postLossWinRate ? 'win' : 'loss'} jauh lebih tinggi.
              {b.postLossWinRate < b.postWinWinRate
                ? ' Buat rule: stop trading 1 jam setelah loss untuk reset emosi.'
                : ' Cek: apakah kamu jadi lebih konservatif setelah loss?'}
            </p>
          </div>
        )}
      </div>

      {/* Revenge trade detail */}
      {b.revengeTrades > 0 && (
        <div className='card p-4 sm:p-5 bg-red-950/10 border-red-900/40'>
          <div className='flex gap-2.5 items-start'>
            <Repeat className='w-5 h-5 text-red-400 shrink-0 mt-0.5' aria-hidden='true' />
            <div className='flex-1'>
              <p className='text-sm font-semibold text-red-300'>Revenge Trading Detected</p>
              <p className='text-xs text-zinc-400 mt-1 leading-relaxed'>
                <strong className='text-red-300'>{b.revengeTrades} trades</strong> diambil dalam 30 menit setelah loss di hari yang sama.
                {b.revengeTradesLossPnl < 0 && <> Total loss dari revenge trade: <strong className='text-red-300'>-${Math.abs(b.revengeTradesLossPnl).toFixed(2)}</strong>.</>}
              </p>
              <div className='mt-3 p-2.5 rounded bg-zinc-900 border border-zinc-800'>
                <p className='text-xs text-zinc-300 font-semibold mb-1'>💡 Rule yang harus kamu buat:</p>
                <p className='text-xs text-zinc-400'>
                  Setelah loss, <strong>tunggu minimum 30 menit</strong> sebelum entry lagi.
                  Selama menunggu: review chart, jangan staring di posisi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overtrading days */}
      {b.overtradingDays.length > 0 && (
        <div className='card p-4 sm:p-5'>
          <h3 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3'>
            Overtrading Days
          </h3>
          <p className='text-xs text-zinc-500 mb-3'>
            Hari-hari dengan jumlah trade di atas rata-rata + 1 ({(b.avgTradesPerDay + 1).toFixed(1)}+):
          </p>
          <div className='space-y-1.5'>
            {b.overtradingDays.map(d => (
              <div key={d.date} className='flex items-center gap-3 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs'>
                <span className='mono text-zinc-300 w-24'>{d.date}</span>
                <span className='mono text-amber-400 font-semibold w-16'>{d.count} trades</span>
                <span className={cn('mono ml-auto font-semibold', pnlColor(d.pnl))}>{formatPnl(d.pnl)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak warning */}
      {b.maxConsecutiveLosses >= 4 && (
        <div className='card p-4 sm:p-5 bg-amber-950/20 border-amber-900/50'>
          <div className='flex gap-2.5 items-start'>
            <Flame className='w-5 h-5 text-amber-400 shrink-0 mt-0.5' aria-hidden='true' />
            <div>
              <p className='text-sm font-semibold text-amber-300'>Loss Streak Pattern</p>
              <p className='text-xs text-zinc-400 mt-1 leading-relaxed'>
                Pernah loss <strong>{b.maxConsecutiveLosses}x berturut-turut</strong> — implementasi rule "<strong>stop after 3 losses</strong>" di hari yang sama untuk mencegah meltdown.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Card({ icon, label, value, color, sub, tooltip }: {
  icon: React.ReactNode; label: string; value: string; color: string; sub: string; tooltip?: string
}) {
  return (
    <div className='card p-3 sm:p-4' title={tooltip}>
      <div className='flex items-center gap-1.5 text-zinc-500 mb-1.5'>{icon}<p className='text-xs font-medium uppercase tracking-wide'>{label}</p></div>
      <p className={cn('mono text-base sm:text-lg font-bold', color)}>{value}</p>
      <p className='text-xs text-zinc-500 mt-0.5'>{sub}</p>
    </div>
  )
}

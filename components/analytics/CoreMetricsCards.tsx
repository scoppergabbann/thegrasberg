import { TrendingUp, TrendingDown, Target, Activity, Zap, Award, AlertTriangle, BarChart2 } from 'lucide-react'
import { formatPnl, pnlColor, cn } from '@/lib/utils'
import type { CoreMetrics, StreakStats } from '@/lib/analytics'

interface Props { metrics: CoreMetrics; streaks: StreakStats }

export default function CoreMetricsCards({ metrics, streaks }: Props) {
  const m = metrics

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3'>
      {/* Net PnL */}
      <Card icon={<Activity className='w-3.5 h-3.5' aria-hidden='true' />} label='Net P/L' value={formatPnl(m.netPnl)} color={pnlColor(m.netPnl)} sub={`${m.totalTrades} trades`} />

      {/* Win Rate */}
      <Card icon={<Target className='w-3.5 h-3.5' aria-hidden='true' />} label='Win Rate' value={`${m.winRate.toFixed(1)}%`}
        color={m.winRate >= 50 ? 'text-green-400' : 'text-red-400'}
        sub={`${m.wins}W · ${m.losses}L${m.breakeven ? ` · ${m.breakeven}BE` : ''}`} />

      {/* Risk:Reward */}
      <Card icon={<Award className='w-3.5 h-3.5' aria-hidden='true' />} label='Risk : Reward'
        value={m.riskReward > 0 ? `1 : ${m.riskReward.toFixed(2)}` : '—'}
        color={m.riskReward >= 2 ? 'text-green-400' : m.riskReward >= 1 ? 'text-amber-400' : 'text-red-400'}
        sub={`Avg win $${m.avgWin.toFixed(0)} / loss $${m.avgLoss.toFixed(0)}`} />

      {/* Expectancy */}
      <Card icon={<Zap className='w-3.5 h-3.5' aria-hidden='true' />} label='Expectancy'
        value={(m.expectancy >= 0 ? '+' : '-') + '$' + Math.abs(m.expectancy).toFixed(2)}
        color={m.expectancy > 0 ? 'text-green-400' : 'text-red-400'} sub='per trade'
        tooltip='Expected $ value per trade. Positif = sistem profitable jangka panjang.' />

      {/* Profit Factor */}
      <Card icon={<BarChart2 className='w-3.5 h-3.5' aria-hidden='true' />} label='Profit Factor'
        value={isFinite(m.profitFactor) ? m.profitFactor.toFixed(2) : '∞'}
        color={m.profitFactor >= 1.5 ? 'text-green-400' : m.profitFactor >= 1 ? 'text-amber-400' : 'text-red-400'}
        sub='gross profit ÷ loss'
        tooltip='Total gain dibagi total loss. >1 = profitable, >2 = excellent.' />

      {/* Max Drawdown */}
      <Card icon={<AlertTriangle className='w-3.5 h-3.5' aria-hidden='true' />} label='Max Drawdown'
        value={'-$' + m.maxDrawdown.toFixed(0)}
        color='text-red-400' sub={`${m.maxDrawdownPct.toFixed(1)}% from peak`}
        tooltip='Penurunan terdalam dari puncak balance ke lembah.' />

      {/* Streak */}
      <Card icon={streaks.currentStreak >= 0 ? <TrendingUp className='w-3.5 h-3.5' aria-hidden='true' /> : <TrendingDown className='w-3.5 h-3.5' aria-hidden='true' />}
        label='Current Streak'
        value={streaks.currentStreak === 0 ? '—' : `${Math.abs(streaks.currentStreak)} ${streaks.currentStreak > 0 ? 'wins' : 'losses'}`}
        color={streaks.currentStreak > 0 ? 'text-green-400' : streaks.currentStreak < 0 ? 'text-red-400' : 'text-zinc-400'}
        sub={`Max W:${streaks.maxWinStreak} · L:${streaks.maxLossStreak}`} />

      {/* Consistency */}
      <Card icon={<Activity className='w-3.5 h-3.5' aria-hidden='true' />} label='Consistency'
        value={`${m.consistencyScore.toFixed(0)}/100`}
        color={m.consistencyScore >= 60 ? 'text-green-400' : m.consistencyScore >= 40 ? 'text-amber-400' : 'text-red-400'}
        sub='lower variance = better' />
    </div>
  )
}

function Card({
  icon, label, value, color, sub, tooltip,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  sub: string
  tooltip?: string
}) {
  return (
    <div className='card p-3 sm:p-4 group relative' title={tooltip}>
      <div className='flex items-center gap-1.5 text-zinc-500 mb-1.5'>
        {icon}
        <p className='text-xs font-medium uppercase tracking-wide'>{label}</p>
      </div>
      <p className={cn('mono text-base sm:text-lg font-bold', color)}>{value}</p>
      <p className='text-xs text-zinc-500 mt-0.5'>{sub}</p>
    </div>
  )
}

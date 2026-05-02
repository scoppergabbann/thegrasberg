'use client'

import { useState, useMemo } from 'react'
import { Calendar, BarChart3, Shield, Activity, Tag } from 'lucide-react'
import {
  computeCoreMetrics, computeEquityCurve, computeDailyEquity, computeStreaks,
  computeBySession, computeByDayOfWeek, computeByMood, computeByPsychVerdict,
  computeBySetup, computeByPair, generateInsights,
} from '@/lib/analytics'
import {
  computeByHour, computeRiskMetrics, computeBehavior, computeByCustomTag,
} from '@/lib/analytics-deep'
import { cn } from '@/lib/utils'
import type { Trade, DayNote, PsychResult } from '@/types'

import CoreMetricsCards from './CoreMetricsCards'
import EquityCurve      from './EquityCurve'
import TimeAnalysis     from './TimeAnalysis'
import PsychCorrelation from './PsychCorrelation'
import SetupBreakdown   from './SetupBreakdown'
import PairBreakdown    from './PairBreakdown'
import InsightsPanel    from './InsightsPanel'
import HourHeatmap      from './HourHeatmap'
import RiskTab          from './RiskTab'
import BehaviorTab      from './BehaviorTab'
import TagsTab          from './TagsTab'

type Range = 'all' | '7d' | '30d' | '90d' | 'ytd' | 'mtd'
type Tab   = 'overview' | 'risk' | 'behavior' | 'tags'

const RANGES: { id: Range; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: '7d',  label: '7 Days'   },
  { id: '30d', label: '30 Days'  },
  { id: '90d', label: '90 Days'  },
  { id: 'mtd', label: 'MTD'      },
  { id: 'ytd', label: 'YTD'      },
]

const TABS: { id: Tab; label: string; icon: React.ComponentType<any>; desc: string }[] = [
  { id: 'overview', label: 'Overview',  icon: BarChart3, desc: 'Core metrics, equity curve, breakdowns' },
  { id: 'risk',     label: 'Risk',      icon: Shield,    desc: 'Risk per trade, drawdown, RR ratio' },
  { id: 'behavior', label: 'Behavior',  icon: Activity,  desc: 'Trades/day, streaks, revenge trading' },
  { id: 'tags',     label: 'Tags',      icon: Tag,       desc: 'Performance per custom tag' },
]

interface Props {
  trades:       Trade[]
  notes:        DayNote[]
  psych:        PsychResult[]
  initialRange: string
  initialTab:   string
}

export default function AnalyticsClient({ trades, notes, psych, initialRange, initialTab }: Props) {
  const [range, setRange] = useState<Range>((RANGES.find(r => r.id === initialRange)?.id ?? 'all') as Range)
  const [tab, setTab]     = useState<Tab>((TABS.find(t => t.id === initialTab)?.id ?? 'overview') as Tab)
  const [equityMode, setEquityMode] = useState<'trade' | 'day'>('trade')

  // Filter by date range
  const filteredTrades = useMemo(() => {
    if (range === 'all') return trades
    const today = new Date()
    let cutoff: Date
    if (range === 'mtd') cutoff = new Date(today.getFullYear(), today.getMonth(), 1)
    else if (range === 'ytd') cutoff = new Date(today.getFullYear(), 0, 1)
    else {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
      cutoff = new Date(today.getTime() - days * 86400000)
    }
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    return trades.filter(t => t.trade_date >= cutoffStr)
  }, [trades, range])

  const filteredNotes = useMemo(() => {
    if (range === 'all') return notes
    const dates = new Set(filteredTrades.map(t => t.trade_date))
    return notes.filter(n => dates.has(n.note_date))
  }, [notes, filteredTrades, range])

  const filteredPsych = useMemo(() => {
    if (range === 'all') return psych
    const dates = new Set(filteredTrades.map(t => t.trade_date))
    return psych.filter(p => dates.has(p.result_date))
  }, [psych, filteredTrades, range])

  // Compute analytics (only what's needed per tab — but cheap enough to do all)
  const metrics    = useMemo(() => computeCoreMetrics(filteredTrades), [filteredTrades])
  const equityT    = useMemo(() => computeEquityCurve(filteredTrades),  [filteredTrades])
  const equityD    = useMemo(() => computeDailyEquity(filteredTrades),  [filteredTrades])
  const streaks    = useMemo(() => computeStreaks(filteredTrades),      [filteredTrades])
  const bySession  = useMemo(() => computeBySession(filteredTrades),    [filteredTrades])
  const byDay      = useMemo(() => computeByDayOfWeek(filteredTrades),  [filteredTrades])
  const byMood     = useMemo(() => computeByMood(filteredTrades, filteredNotes), [filteredTrades, filteredNotes])
  const byPsych    = useMemo(() => computeByPsychVerdict(filteredTrades, filteredPsych), [filteredTrades, filteredPsych])
  const bySetup    = useMemo(() => computeBySetup(filteredTrades),      [filteredTrades])
  const byPair     = useMemo(() => computeByPair(filteredTrades),       [filteredTrades])
  const byHour     = useMemo(() => computeByHour(filteredTrades),       [filteredTrades])
  const riskMet    = useMemo(() => computeRiskMetrics(filteredTrades),  [filteredTrades])
  const behavior   = useMemo(() => computeBehavior(filteredTrades),     [filteredTrades])
  const tagPerf    = useMemo(() => computeByCustomTag(filteredTrades),  [filteredTrades])
  const insights   = useMemo(
    () => generateInsights(metrics, byMood, bySession, byDay, bySetup, byPsych, streaks),
    [metrics, byMood, bySession, byDay, bySetup, byPsych, streaks]
  )

  if (trades.length === 0) {
    return (
      <div className='card p-12 text-center'>
        <p className='text-zinc-400 font-medium'>Belum ada data trade</p>
        <p className='text-xs text-zinc-600 mt-1'>Tambah trade dulu di kalender untuk lihat analytics</p>
      </div>
    )
  }

  return (
    <>
      {/* Range filter */}
      <div className='flex items-center gap-2 flex-wrap'>
        <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
          <Calendar className='w-3.5 h-3.5' aria-hidden='true' />
          <span className='font-medium'>Range</span>
        </div>
        <div className='flex gap-1.5 flex-wrap' role='group' aria-label='Filter periode'>
          {RANGES.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)} aria-pressed={range === r.id}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-zinc-400',
                range === r.id ? 'bg-zinc-700 border-zinc-500 text-zinc-100' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
              )}>
              {r.label}
            </button>
          ))}
        </div>
        <span className='ml-auto text-xs text-zinc-600'>{filteredTrades.length} trades</span>
      </div>

      {/* Tab switcher */}
      <div role='tablist' aria-label='Analytics tabs' className='flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto scrollbar-none'>
        {TABS.map(t => {
          const Icon   = t.icon
          const active = tab === t.id
          return (
            <button key={t.id} role='tab' aria-selected={active} onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 min-w-[110px] sm:min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-zinc-400',
                active ? 'bg-zinc-700 text-zinc-100 shadow' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              )}>
              <Icon className='w-4 h-4 shrink-0' aria-hidden='true' />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <>
          {insights.length > 0 && <InsightsPanel insights={insights} />}
          <CoreMetricsCards metrics={metrics} streaks={streaks} />
          <EquityCurve equityT={equityT} equityD={equityD} mode={equityMode} onModeChange={setEquityMode} maxDrawdown={metrics.maxDrawdown} />
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'>
            <TimeAnalysis title='Performance by Session'     data={bySession} />
            <TimeAnalysis title='Performance by Day of Week' data={byDay.filter(d => d.trades > 0)} />
          </div>
          <PsychCorrelation byMood={byMood} byPsych={byPsych} />
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'>
            <SetupBreakdown data={bySetup} />
            <PairBreakdown  data={byPair} />
          </div>
        </>
      )}

      {tab === 'risk' && (
        <RiskTab
          metrics={metrics}
          riskMet={riskMet}
          totalTrades={filteredTrades.length}
        />
      )}

      {tab === 'behavior' && (
        <>
          <HourHeatmap data={byHour} />
          <BehaviorTab behavior={behavior} totalTrades={filteredTrades.length} />
        </>
      )}

      {tab === 'tags' && (
        <TagsTab data={tagPerf} totalTrades={filteredTrades.length} />
      )}
    </>
  )
}

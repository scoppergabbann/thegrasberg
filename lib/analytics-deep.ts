/**
 * Deep analytics — Hour-based, Risk, Behavior, Custom tags
 */
import type { Trade } from '@/types'

// ─── HOUR-BASED ANALYSIS ──────────────────────────────────────

export interface HourBucket {
  hour:    number
  label:   string
  pnl:     number
  trades:  number
  winRate: number
  avgPnl:  number
  zone:    'asia' | 'london' | 'newyork' | 'overlap' | 'off'
}

function hourZone(hour: number): HourBucket['zone'] {
  if (hour >= 12 && hour < 16) return 'overlap'
  if (hour >= 7  && hour < 16) return 'london'
  if (hour >= 12 && hour < 21) return 'newyork'
  if (hour >= 21 || hour < 8 ) return 'asia'
  return 'off'
}

export function computeByHour(trades: Trade[]): HourBucket[] {
  const buckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h, pnl: 0, trades: 0, wins: 0, zone: hourZone(h),
  }))
  for (const t of trades) {
    if (!t.trade_time) continue
    const h = parseInt(t.trade_time.slice(0, 2))
    if (isNaN(h) || h < 0 || h > 23) continue
    buckets[h].pnl    += Number(t.pnl)
    buckets[h].trades += 1
    if (Number(t.pnl) > 0) buckets[h].wins += 1
  }
  return buckets.map(b => ({
    hour:    b.hour,
    label:   `${String(b.hour).padStart(2, '0')}:00`,
    pnl:     b.pnl,
    trades:  b.trades,
    winRate: b.trades ? (b.wins / b.trades) * 100 : 0,
    avgPnl:  b.trades ? b.pnl / b.trades : 0,
    zone:    b.zone,
  }))
}

// ─── RISK MANAGEMENT ──────────────────────────────────────────

export interface RiskMetrics {
  avgRiskPct:       number
  maxRiskPct:       number
  oversizedTrades:  number
  riskRewardActual: number
  riskRewardPlanned: number
  drawdownDuration: number
  recoveryFactor:   number
  avgRiskUSD:       number
  totalTradesWithRisk: number
  totalTradesWithSlTp: number
}

export function computeRiskMetrics(trades: Trade[]): RiskMetrics {
  const sorted = [...trades].sort((a, b) =>
    a.trade_date.localeCompare(b.trade_date) ||
    (a.created_at ?? '').localeCompare(b.created_at ?? '')
  )

  const withRisk = sorted.filter(t => t.risk_pct !== null && t.risk_pct !== undefined)
  const avgRiskPct = withRisk.length ? withRisk.reduce((a, t) => a + Number(t.risk_pct), 0) / withRisk.length : 0
  const maxRiskPct = withRisk.length ? Math.max(...withRisk.map(t => Number(t.risk_pct))) : 0
  const oversizedTrades = withRisk.filter(t => Number(t.risk_pct) > 2).length

  const withSlTp = sorted.filter(t => t.entry_price !== null && t.sl_price !== null && t.tp_price !== null)
  let plannedRR = 0
  if (withSlTp.length) {
    const ratios = withSlTp.map(t => {
      const slDist = Math.abs(Number(t.entry_price) - Number(t.sl_price))
      const tpDist = Math.abs(Number(t.tp_price) - Number(t.entry_price))
      return slDist > 0 ? tpDist / slDist : 0
    })
    plannedRR = ratios.reduce((a, b) => a + b, 0) / ratios.length
  }

  const wins   = sorted.filter(t => Number(t.pnl) > 0)
  const losses = sorted.filter(t => Number(t.pnl) < 0)
  const avgWin  = wins.length ? wins.reduce((a, t) => a + Number(t.pnl), 0) / wins.length : 0
  const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + Number(t.pnl), 0)) / losses.length : 0
  const actualRR = avgLoss > 0 ? avgWin / avgLoss : 0

  let peak = 0, runningPnl = 0, maxDDDuration = 0, currentDDDuration = 0, maxDD = 0
  for (const t of sorted) {
    runningPnl += Number(t.pnl)
    if (runningPnl > peak) {
      peak = runningPnl
      currentDDDuration = 0
    } else if (runningPnl < peak) {
      currentDDDuration++
      if (currentDDDuration > maxDDDuration) maxDDDuration = currentDDDuration
      if (peak - runningPnl > maxDD) maxDD = peak - runningPnl
    }
  }
  const netProfit = sorted.reduce((a, t) => a + Number(t.pnl), 0)
  const recoveryFactor = maxDD > 0 ? netProfit / maxDD : 0

  return {
    avgRiskPct, maxRiskPct, oversizedTrades,
    riskRewardActual: actualRR, riskRewardPlanned: plannedRR,
    drawdownDuration: maxDDDuration, recoveryFactor,
    avgRiskUSD: avgLoss,
    totalTradesWithRisk: withRisk.length,
    totalTradesWithSlTp: withSlTp.length,
  }
}

// ─── TRADE BEHAVIOR ───────────────────────────────────────────

export interface BehaviorMetrics {
  avgTradesPerDay:      number
  maxTradesInOneDay:    number
  daysTraded:           number
  consecutiveWins:      number
  consecutiveLosses:    number
  maxConsecutiveWins:   number
  maxConsecutiveLosses: number
  revengeTrades:        number
  revengeTradesLossPnl: number
  overtradingDays:      Array<{ date: string; count: number; pnl: number }>
  postLossWinRate:      number
  postWinWinRate:       number
}

export function computeBehavior(trades: Trade[]): BehaviorMetrics {
  const sorted = [...trades].sort((a, b) =>
    a.trade_date.localeCompare(b.trade_date) ||
    (a.trade_time ?? '00:00').localeCompare(b.trade_time ?? '00:00') ||
    (a.created_at ?? '').localeCompare(b.created_at ?? '')
  )

  const byDay: Record<string, Trade[]> = {}
  sorted.forEach(t => {
    if (!byDay[t.trade_date]) byDay[t.trade_date] = []
    byDay[t.trade_date].push(t)
  })

  const days = Object.keys(byDay).sort()
  const tradesPerDay = days.map(d => byDay[d].length)
  const avgTradesPerDay = tradesPerDay.length ? tradesPerDay.reduce((a, b) => a + b, 0) / tradesPerDay.length : 0
  const maxTradesInOneDay = tradesPerDay.length ? Math.max(...tradesPerDay) : 0

  let curWins = 0, curLosses = 0, maxWins = 0, maxLosses = 0
  let lastResult: 'win' | 'loss' | null = null
  for (const t of sorted) {
    const pnl = Number(t.pnl)
    if (pnl > 0) {
      if (lastResult === 'loss') curWins = 0
      curWins++
      if (curWins > maxWins) maxWins = curWins
      lastResult = 'win'
    } else if (pnl < 0) {
      if (lastResult === 'win') curLosses = 0
      curLosses++
      if (curLosses > maxLosses) maxLosses = curLosses
      lastResult = 'loss'
    }
  }

  // Revenge: trade dalam 30 menit setelah loss, hari yang sama
  let revengeTrades = 0, revengeLossPnl = 0
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1], cur = sorted[i]
    if (Number(prev.pnl) >= 0) continue
    if (prev.trade_date !== cur.trade_date) continue
    if (!prev.trade_time || !cur.trade_time) continue
    const [ph, pm] = prev.trade_time.split(':').map(Number)
    const [ch, cm] = cur.trade_time.split(':').map(Number)
    const diff = (ch * 60 + cm) - (ph * 60 + pm)
    if (diff > 0 && diff <= 30) {
      revengeTrades++
      if (Number(cur.pnl) < 0) revengeLossPnl += Number(cur.pnl)
    }
  }

  const threshold = avgTradesPerDay + 1
  const overtradingDays = days
    .filter(d => byDay[d].length > threshold)
    .map(d => ({ date: d, count: byDay[d].length, pnl: byDay[d].reduce((a, t) => a + Number(t.pnl), 0) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  let afterLossWins = 0, afterLossTotal = 0, afterWinWins = 0, afterWinTotal = 0
  for (let i = 1; i < sorted.length; i++) {
    const prev = Number(sorted[i - 1].pnl)
    const cur  = Number(sorted[i].pnl)
    if (prev < 0) {
      afterLossTotal++
      if (cur > 0) afterLossWins++
    } else if (prev > 0) {
      afterWinTotal++
      if (cur > 0) afterWinWins++
    }
  }

  return {
    avgTradesPerDay,
    maxTradesInOneDay,
    daysTraded: days.length,
    consecutiveWins:      curWins,
    consecutiveLosses:    curLosses,
    maxConsecutiveWins:   maxWins,
    maxConsecutiveLosses: maxLosses,
    revengeTrades,
    revengeTradesLossPnl: revengeLossPnl,
    overtradingDays,
    postLossWinRate: afterLossTotal ? (afterLossWins / afterLossTotal) * 100 : 0,
    postWinWinRate:  afterWinTotal  ? (afterWinWins  / afterWinTotal)  * 100 : 0,
  }
}

// ─── CUSTOM TAGS ──────────────────────────────────────────────

export interface TagPerformance {
  tag:     string
  pnl:     number
  trades:  number
  winRate: number
  avgPnl:  number
}

export function computeByCustomTag(trades: Trade[]): TagPerformance[] {
  const buckets: Record<string, Trade[]> = {}
  for (const t of trades) {
    for (const tag of t.custom_tags || []) {
      if (!buckets[tag]) buckets[tag] = []
      buckets[tag].push(t)
    }
  }
  return Object.entries(buckets).map(([tag, items]) => {
    const pnl  = items.reduce((a, t) => a + Number(t.pnl), 0)
    const wins = items.filter(t => Number(t.pnl) > 0).length
    return {
      tag, pnl,
      trades:  items.length,
      winRate: items.length ? (wins / items.length) * 100 : 0,
      avgPnl:  items.length ? pnl / items.length : 0,
    }
  }).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
}

export function getAllUsedTags(trades: Trade[]): string[] {
  const set = new Set<string>()
  trades.forEach(t => (t.custom_tags || []).forEach(tag => set.add(tag)))
  return Array.from(set).sort()
}

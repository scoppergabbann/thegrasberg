/**
 * Advanced trading analytics calculations
 */
import type { Trade, DayNote, PsychResult, Mood } from '@/types'

// ─── CORE METRICS ─────────────────────────────────────────────

export interface CoreMetrics {
  netPnl:          number
  totalTrades:     number
  wins:            number
  losses:          number
  breakeven:       number
  winRate:         number   // %
  avgWin:          number
  avgLoss:         number
  largestWin:      number
  largestLoss:     number
  riskReward:      number   // avgWin / avgLoss
  expectancy:      number   // (winRate * avgWin) - (lossRate * avgLoss) → expected $ per trade
  profitFactor:    number   // grossProfit / grossLoss
  maxDrawdown:     number   // worst peak-to-valley drop
  maxDrawdownPct:  number
  consistencyScore: number  // 0-100, semakin tinggi = makin konsisten
}

export function computeCoreMetrics(trades: Trade[]): CoreMetrics {
  if (trades.length === 0) {
    return {
      netPnl:0, totalTrades:0, wins:0, losses:0, breakeven:0, winRate:0,
      avgWin:0, avgLoss:0, largestWin:0, largestLoss:0,
      riskReward:0, expectancy:0, profitFactor:0,
      maxDrawdown:0, maxDrawdownPct:0, consistencyScore:0,
    }
  }

  const sorted = [...trades].sort((a, b) =>
    a.trade_date.localeCompare(b.trade_date) ||
    (a.created_at ?? '').localeCompare(b.created_at ?? '')
  )

  const pnls   = sorted.map(t => Number(t.pnl))
  const netPnl = pnls.reduce((a, b) => a + b, 0)

  const winsTrades   = sorted.filter(t => Number(t.pnl) > 0)
  const lossesTrades = sorted.filter(t => Number(t.pnl) < 0)
  const beTrades     = sorted.filter(t => Number(t.pnl) === 0)

  const grossProfit = winsTrades.reduce((a, t) => a + Number(t.pnl), 0)
  const grossLoss   = Math.abs(lossesTrades.reduce((a, t) => a + Number(t.pnl), 0))

  const avgWin  = winsTrades.length   ? grossProfit / winsTrades.length   : 0
  const avgLoss = lossesTrades.length ? grossLoss   / lossesTrades.length : 0

  const winRate    = (winsTrades.length / sorted.length) * 100
  const lossRate   = (lossesTrades.length / sorted.length) * 100
  const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0

  // Expectancy: average $ expected per trade
  const expectancy = (winRate / 100) * avgWin - (lossRate / 100) * avgLoss

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0)

  // Max drawdown: jejak peak → valley terdalam
  let peak = 0, valley = 0, maxDD = 0, maxDDPct = 0, runningPnl = 0
  for (const p of pnls) {
    runningPnl += p
    if (runningPnl > peak) { peak = runningPnl; valley = runningPnl }
    if (runningPnl < valley) {
      valley = runningPnl
      const dd = peak - valley
      if (dd > maxDD) {
        maxDD = dd
        maxDDPct = peak > 0 ? (dd / peak) * 100 : 0
      }
    }
  }

  // Consistency score: 100 - coefficient of variation (clamped 0-100)
  const mean    = netPnl / pnls.length
  const stdDev  = Math.sqrt(pnls.reduce((a, p) => a + Math.pow(p - mean, 2), 0) / pnls.length)
  const cv      = mean !== 0 ? Math.abs(stdDev / mean) : 999
  const consistencyScore = Math.max(0, Math.min(100, 100 - cv * 20))

  return {
    netPnl,
    totalTrades: sorted.length,
    wins:        winsTrades.length,
    losses:      lossesTrades.length,
    breakeven:   beTrades.length,
    winRate,
    avgWin, avgLoss,
    largestWin:  winsTrades.length ? Math.max(...winsTrades.map(t => Number(t.pnl))) : 0,
    largestLoss: lossesTrades.length ? Math.min(...lossesTrades.map(t => Number(t.pnl))) : 0,
    riskReward, expectancy, profitFactor,
    maxDrawdown: maxDD, maxDrawdownPct: maxDDPct,
    consistencyScore,
  }
}

// ─── EQUITY CURVE ─────────────────────────────────────────────

export interface EquityPoint {
  index:       number
  date:        string
  cumulative:  number
  pnl:         number
  drawdown:    number
}

export function computeEquityCurve(trades: Trade[], startingBalance = 0): EquityPoint[] {
  const sorted = [...trades].sort((a, b) =>
    a.trade_date.localeCompare(b.trade_date) ||
    (a.created_at ?? '').localeCompare(b.created_at ?? '')
  )
  let cumulative = startingBalance
  let peak       = startingBalance
  return sorted.map((t, i) => {
    cumulative += Number(t.pnl)
    if (cumulative > peak) peak = cumulative
    return {
      index:      i + 1,
      date:       t.trade_date,
      cumulative,
      pnl:        Number(t.pnl),
      drawdown:   peak - cumulative,
    }
  })
}

// Group by day → daily PNL untuk equity curve mode "per day"
export function computeDailyEquity(trades: Trade[]): EquityPoint[] {
  const byDate: Record<string, number> = {}
  trades.forEach(t => { byDate[t.trade_date] = (byDate[t.trade_date] || 0) + Number(t.pnl) })
  const dates = Object.keys(byDate).sort()
  let cumulative = 0, peak = 0
  return dates.map((date, i) => {
    cumulative += byDate[date]
    if (cumulative > peak) peak = cumulative
    return {
      index:      i + 1,
      date,
      cumulative,
      pnl:        byDate[date],
      drawdown:   peak - cumulative,
    }
  })
}

// ─── STREAK ANALYSIS ──────────────────────────────────────────

export interface StreakStats {
  currentStreak:    number    // positif = win streak, negatif = loss streak
  maxWinStreak:     number
  maxLossStreak:    number
  currentStreakPnl: number
}

export function computeStreaks(trades: Trade[]): StreakStats {
  const sorted = [...trades].sort((a, b) =>
    a.trade_date.localeCompare(b.trade_date) ||
    (a.created_at ?? '').localeCompare(b.created_at ?? '')
  )
  let curStreak = 0, maxWin = 0, maxLoss = 0, curPnl = 0
  for (const t of sorted) {
    const pnl = Number(t.pnl)
    if (pnl > 0) {
      curStreak = curStreak >= 0 ? curStreak + 1 : 1
      if (curStreak > maxWin) maxWin = curStreak
      curPnl    = curStreak === 1 ? pnl : curPnl + pnl
    } else if (pnl < 0) {
      curStreak = curStreak <= 0 ? curStreak - 1 : -1
      if (-curStreak > maxLoss) maxLoss = -curStreak
      curPnl    = curStreak === -1 ? pnl : curPnl + pnl
    }
  }
  return { currentStreak: curStreak, maxWinStreak: maxWin, maxLossStreak: maxLoss, currentStreakPnl: curPnl }
}

// ─── TIME-BASED ANALYSIS ──────────────────────────────────────

export interface TimeBucket {
  label:    string
  pnl:      number
  trades:   number
  winRate:  number
  avgPnl:   number
}

export function computeBySession(trades: Trade[]): TimeBucket[] {
  const sessions = ['Asia', 'London', 'New York', 'London/NY']
  return sessions.map(s => {
    const items = trades.filter(t => t.session === s)
    const pnl   = items.reduce((a, t) => a + Number(t.pnl), 0)
    const wins  = items.filter(t => Number(t.pnl) > 0).length
    return {
      label:   s,
      pnl,
      trades:  items.length,
      winRate: items.length ? (wins / items.length) * 100 : 0,
      avgPnl:  items.length ? pnl / items.length : 0,
    }
  })
}

export function computeByDayOfWeek(trades: Trade[]): TimeBucket[] {
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return dayLabels.map((label, idx) => {
    const items = trades.filter(t => new Date(t.trade_date).getDay() === idx)
    const pnl   = items.reduce((a, t) => a + Number(t.pnl), 0)
    const wins  = items.filter(t => Number(t.pnl) > 0).length
    return {
      label,
      pnl,
      trades:  items.length,
      winRate: items.length ? (wins / items.length) * 100 : 0,
      avgPnl:  items.length ? pnl / items.length : 0,
    }
  })
}

// ─── PSYCHOLOGICAL CORRELATION ────────────────────────────────

export interface MoodPerformance {
  mood:      Mood | 'Tanpa Journal'
  pnl:       number
  trades:    number
  winRate:   number
  avgPnl:    number
}

export function computeByMood(trades: Trade[], notes: DayNote[]): MoodPerformance[] {
  const moodByDate: Record<string, Mood | null> = {}
  notes.forEach(n => { moodByDate[n.note_date] = n.mood })

  const moods: (Mood | 'Tanpa Journal')[] = ['Focused','Confident','Anxious','FOMO','Revenge','Tanpa Journal']

  return moods.map(mood => {
    const items = trades.filter(t => {
      const m = moodByDate[t.trade_date]
      if (mood === 'Tanpa Journal') return m === undefined || m === null
      return m === mood
    })
    const pnl  = items.reduce((a, t) => a + Number(t.pnl), 0)
    const wins = items.filter(t => Number(t.pnl) > 0).length
    return {
      mood,
      pnl,
      trades:  items.length,
      winRate: items.length ? (wins / items.length) * 100 : 0,
      avgPnl:  items.length ? pnl / items.length : 0,
    }
  }).filter(m => m.trades > 0)
}

// Performance correlation dengan psych test verdict
export interface PsychPerformance {
  verdict:   string
  pnl:       number
  trades:    number
  winRate:   number
  days:      number
}

export function computeByPsychVerdict(trades: Trade[], psych: PsychResult[]): PsychPerformance[] {
  const verdictByDate: Record<string, string> = {}
  psych.forEach(p => { verdictByDate[p.result_date] = p.verdict })

  const buckets: Record<string, { pnl:number; trades:number; wins:number; days:Set<string> }> = {}
  trades.forEach(t => {
    const v = verdictByDate[t.trade_date] || 'Tanpa Test'
    if (!buckets[v]) buckets[v] = { pnl: 0, trades: 0, wins: 0, days: new Set() }
    buckets[v].pnl    += Number(t.pnl)
    buckets[v].trades += 1
    if (Number(t.pnl) > 0) buckets[v].wins += 1
    buckets[v].days.add(t.trade_date)
  })

  const order = ['SIAP TRADING','KONDISI CUKUP','WASPADA','JANGAN TRADING','Tanpa Test']
  return order
    .filter(v => buckets[v]?.trades > 0)
    .map(v => ({
      verdict: v,
      pnl:     buckets[v].pnl,
      trades:  buckets[v].trades,
      winRate: (buckets[v].wins / buckets[v].trades) * 100,
      days:    buckets[v].days.size,
    }))
}

// ─── STRATEGY / SETUP BREAKDOWN ───────────────────────────────

export interface SetupPerformance {
  setup:        string
  pnl:          number
  trades:       number
  winRate:      number
  avgPnl:       number
  expectancy:   number
}

export function computeBySetup(trades: Trade[]): SetupPerformance[] {
  const buckets: Record<string, Trade[]> = {}
  trades.forEach(t => {
    const s = t.setup_type || 'Tanpa Setup'
    if (!buckets[s]) buckets[s] = []
    buckets[s].push(t)
  })
  return Object.entries(buckets).map(([setup, items]) => {
    const m = computeCoreMetrics(items)
    return {
      setup,
      pnl:        m.netPnl,
      trades:     m.totalTrades,
      winRate:    m.winRate,
      avgPnl:     m.totalTrades ? m.netPnl / m.totalTrades : 0,
      expectancy: m.expectancy,
    }
  }).sort((a, b) => b.pnl - a.pnl)
}

// ─── PAIR BREAKDOWN ───────────────────────────────────────────

export interface PairPerformance {
  pair:    string
  pnl:     number
  trades:  number
  winRate: number
  avgPnl:  number
}

export function computeByPair(trades: Trade[]): PairPerformance[] {
  const buckets: Record<string, Trade[]> = {}
  trades.forEach(t => {
    if (!buckets[t.pair]) buckets[t.pair] = []
    buckets[t.pair].push(t)
  })
  return Object.entries(buckets).map(([pair, items]) => {
    const pnl  = items.reduce((a, t) => a + Number(t.pnl), 0)
    const wins = items.filter(t => Number(t.pnl) > 0).length
    return {
      pair,
      pnl,
      trades:  items.length,
      winRate: (wins / items.length) * 100,
      avgPnl:  pnl / items.length,
    }
  }).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
}

// ─── INSIGHT GENERATION (auto-narrative) ──────────────────────

export interface Insight { type: 'good' | 'warn' | 'bad' | 'info'; text: string }

export function generateInsights(
  metrics: CoreMetrics,
  byMood: MoodPerformance[],
  bySession: TimeBucket[],
  byDay: TimeBucket[],
  bySetup: SetupPerformance[],
  byPsych: PsychPerformance[],
  streaks: StreakStats,
): Insight[] {
  const insights: Insight[] = []

  // Profit factor
  if (metrics.profitFactor >= 2) {
    insights.push({ type: 'good', text: `Profit factor ${metrics.profitFactor.toFixed(2)} — sistem trading sangat solid.` })
  } else if (metrics.profitFactor >= 1.5) {
    insights.push({ type: 'good', text: `Profit factor ${metrics.profitFactor.toFixed(2)} — sistem profitable.` })
  } else if (metrics.profitFactor >= 1 && metrics.profitFactor > 0) {
    insights.push({ type: 'warn', text: `Profit factor ${metrics.profitFactor.toFixed(2)} — marginal, perlu refinement.` })
  } else if (metrics.totalTrades > 5) {
    insights.push({ type: 'bad', text: `Profit factor ${metrics.profitFactor.toFixed(2)} — sistem rugi, evaluasi serius.` })
  }

  // Expectancy
  if (metrics.expectancy > 0) {
    insights.push({ type: 'good', text: `Expectancy +$${metrics.expectancy.toFixed(2)}/trade — setiap trade rata-rata menguntungkan.` })
  } else if (metrics.totalTrades > 5) {
    insights.push({ type: 'bad', text: `Expectancy ${metrics.expectancy >= 0 ? '+' : '-'}$${Math.abs(metrics.expectancy).toFixed(2)}/trade — setiap trade rata-rata rugi.` })
  }

  // Drawdown warning
  if (metrics.maxDrawdownPct > 30 && metrics.totalTrades > 5) {
    insights.push({ type: 'bad', text: `Max drawdown ${metrics.maxDrawdownPct.toFixed(1)}% — terlalu besar, kurangi lot size.` })
  } else if (metrics.maxDrawdownPct > 15) {
    insights.push({ type: 'warn', text: `Max drawdown ${metrics.maxDrawdownPct.toFixed(1)}% — masih wajar tapi pantau ketat.` })
  }

  // Mood correlation
  const focused = byMood.find(m => m.mood === 'Focused')
  const revenge = byMood.find(m => m.mood === 'Revenge')
  const fomo    = byMood.find(m => m.mood === 'FOMO')
  const anxious = byMood.find(m => m.mood === 'Anxious')

  if (focused && (revenge || fomo || anxious)) {
    const bad = revenge || fomo || anxious!
    if (focused.winRate - bad.winRate > 15) {
      insights.push({
        type: 'info',
        text: `Win rate saat Focused ${focused.winRate.toFixed(0)}% vs ${bad.mood} ${bad.winRate.toFixed(0)}% — STOP trading saat mindset ${bad.mood}.`,
      })
    }
  }

  if (revenge && revenge.pnl < 0) {
    insights.push({ type: 'bad', text: `Revenge trading rugi $${Math.abs(revenge.pnl).toFixed(2)} (${revenge.trades} trades) — buat rule wajib stop setelah loss.` })
  }

  // Session insight
  const bestSession  = [...bySession].sort((a, b) => b.pnl - a.pnl)[0]
  const worstSession = [...bySession].filter(s => s.trades > 0).sort((a, b) => a.pnl - b.pnl)[0]
  if (bestSession && bestSession.trades >= 3) {
    insights.push({ type: 'info', text: `Sesi ${bestSession.label} adalah goldmine — ${bestSession.winRate.toFixed(0)}% WR, profit $${bestSession.pnl.toFixed(0)}.` })
  }
  if (worstSession && worstSession.trades >= 3 && worstSession.pnl < -50 && worstSession.label !== bestSession?.label) {
    insights.push({ type: 'warn', text: `Sesi ${worstSession.label} merugikan — pertimbangkan skip sesi ini.` })
  }

  // Day of week
  const bestDay = [...byDay].sort((a, b) => b.pnl - a.pnl)[0]
  if (bestDay && bestDay.trades >= 3 && bestDay.pnl > 0) {
    insights.push({ type: 'info', text: `Hari ${bestDay.label} performa terbaik (WR ${bestDay.winRate.toFixed(0)}%, $${bestDay.pnl.toFixed(0)}).` })
  }

  // Setup breakdown
  if (bySetup.length > 1) {
    const best = bySetup[0]
    if (best.trades >= 3 && best.pnl > 0) {
      insights.push({ type: 'good', text: `Setup terbaik: ${best.setup} (WR ${best.winRate.toFixed(0)}%, expectancy +$${best.expectancy.toFixed(2)}).` })
    }
    const worst = bySetup[bySetup.length - 1]
    if (worst.trades >= 3 && worst.pnl < 0 && worst.setup !== 'Tanpa Setup') {
      insights.push({ type: 'warn', text: `Setup ${worst.setup} rugi $${Math.abs(worst.pnl).toFixed(0)} — review ulang atau berhenti pakai.` })
    }
  }

  // Psych verdict correlation
  const tradedAfterWarn = byPsych.find(p => p.verdict === 'WASPADA' || p.verdict === 'JANGAN TRADING')
  if (tradedAfterWarn && tradedAfterWarn.pnl < 0) {
    insights.push({ type: 'bad', text: `Trade saat psych test "${tradedAfterWarn.verdict}" rugi $${Math.abs(tradedAfterWarn.pnl).toFixed(0)} — psych test kamu bekerja, IKUTI sarannya.` })
  }

  // Streaks
  if (streaks.maxLossStreak >= 4) {
    insights.push({ type: 'warn', text: `Pernah loss ${streaks.maxLossStreak}x berturut-turut — implementasi rule "stop after 3 losses".` })
  }
  if (streaks.currentStreak <= -3) {
    insights.push({ type: 'bad', text: `Sedang loss streak ${Math.abs(streaks.currentStreak)} trade — pertimbangkan istirahat sehari.` })
  }

  return insights
}

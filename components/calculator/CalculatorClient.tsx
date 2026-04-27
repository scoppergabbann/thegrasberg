'use client'

import { useState, useMemo, useEffect } from 'react'
import { Calculator, TrendingUp, TrendingDown, Wallet, Target, AlertTriangle, ArrowDownToLine, ArrowUpToLine, Info } from 'lucide-react'
import { ALL_PAIRS, getPairSpec, calculate, type CalcInput } from '@/lib/calc'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'fxj_calc_v1'

const RR_PRESETS = [
  { label: '1 : 1',   ratio: 1   },
  { label: '1 : 1.5', ratio: 1.5 },
  { label: '1 : 2',   ratio: 2   },
  { label: '1 : 3',   ratio: 3   },
]

interface SavedState {
  pair: string
  direction: 'BUY' | 'SELL'
  entryPrice: string
  slPrice: string
  tpPrice: string
  spread: string
  lotSize: string
  accountBalance: string
  riskPercent: string
}

const DEFAULT_STATE: SavedState = {
  pair: 'XAUUSD',
  direction: 'BUY',
  entryPrice: '2350.00',
  slPrice: '2340.00',
  tpPrice: '2370.00',
  spread: '0.30',
  lotSize: '0.10',
  accountBalance: '10000',
  riskPercent: '1',
}

export default function CalculatorClient() {
  const [state, setState] = useState<SavedState>(DEFAULT_STATE)

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setState({ ...DEFAULT_STATE, ...JSON.parse(saved) })
    } catch {}
  }, [])

  // Persist on change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const update = <K extends keyof SavedState>(k: K, v: SavedState[K]) =>
    setState(s => ({ ...s, [k]: v }))

  const result = useMemo(() => {
    const input: CalcInput = {
      pair:       state.pair,
      direction:  state.direction,
      entryPrice: parseFloat(state.entryPrice) || 0,
      slPrice:    parseFloat(state.slPrice)    || 0,
      tpPrice:    parseFloat(state.tpPrice)    || 0,
      spread:     parseFloat(state.spread)     || 0,
      lotSize:    parseFloat(state.lotSize)    || 0,
      accountBalance: parseFloat(state.accountBalance) || 0,
      riskPercent:    parseFloat(state.riskPercent)    || 0,
    }
    return calculate(input)
  }, [state])

  // Quick preset: set TP based on RR ratio
  function applyRR(ratio: number) {
    const entry = parseFloat(state.entryPrice)
    const sl    = parseFloat(state.slPrice)
    if (!entry || !sl) return
    const slDiff = state.direction === 'BUY' ? entry - sl : sl - entry
    if (slDiff <= 0) return
    const tpDiff = slDiff * ratio
    const newTp  = state.direction === 'BUY' ? entry + tpDiff : entry - tpDiff
    update('tpPrice', newTp.toFixed(result.spec.digits))
  }

  function applyRecommendedLot() {
    update('lotSize', result.recommendedLots.toFixed(2))
  }

  const fmt = (n: number, dec = 2) => {
    if (!isFinite(n) || isNaN(n)) return '—'
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  }

  const fmtPnl = (n: number) => (n >= 0 ? '+' : '-') + '$' + fmt(Math.abs(n))

  return (
    <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5'>
      {/* INPUT FORM ─────────────────────────────────────────── */}
      <section className='lg:col-span-3 space-y-4 sm:space-y-5' aria-label='Input form'>
        <div className='card p-4 sm:p-5 space-y-4'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono'>
            Trade Setup
          </h2>

          {/* Pair + Direction */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label htmlFor='c-pair' className='block text-xs text-zinc-500 font-medium mb-1.5'>
                Pair
              </label>
              <select
                id='c-pair'
                className='form-select'
                value={state.pair}
                onChange={e => update('pair', e.target.value)}
              >
                {ALL_PAIRS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs text-zinc-500 font-medium mb-1.5'>
                Direction
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {(['BUY', 'SELL'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => update('direction', d)}
                    aria-pressed={state.direction === d}
                    className={cn(
                      'py-2 rounded-lg text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 focus-visible:outline-2',
                      state.direction === d
                        ? d === 'BUY'
                          ? 'bg-green-950 border-green-600 text-green-400 focus-visible:outline-green-500'
                          : 'bg-red-950 border-red-600 text-red-400 focus-visible:outline-red-500'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                    )}
                  >
                    {d === 'BUY'
                      ? <TrendingUp className='w-4 h-4' aria-hidden='true' />
                      : <TrendingDown className='w-4 h-4' aria-hidden='true' />}
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Entry / SL / TP */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <PriceField
              id='c-entry'
              label='Entry Price'
              value={state.entryPrice}
              onChange={v => update('entryPrice', v)}
              digits={result.spec.digits}
              icon='entry'
            />
            <PriceField
              id='c-sl'
              label='Stop Loss'
              value={state.slPrice}
              onChange={v => update('slPrice', v)}
              digits={result.spec.digits}
              icon='sl'
            />
            <PriceField
              id='c-tp'
              label='Take Profit'
              value={state.tpPrice}
              onChange={v => update('tpPrice', v)}
              digits={result.spec.digits}
              icon='tp'
            />
          </div>

          {/* Quick RR presets */}
          <div>
            <p className='text-xs text-zinc-500 font-medium mb-1.5'>
              Set TP berdasarkan RR ratio
            </p>
            <div className='flex gap-1.5 flex-wrap' role='group' aria-label='RR ratio presets'>
              {RR_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyRR(p.ratio)}
                  className='px-3 py-1.5 rounded-lg text-xs font-semibold border bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-blue-950 hover:border-blue-600 hover:text-blue-400 transition-all focus-visible:outline-2 focus-visible:outline-blue-500'
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Spread + Lot */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label htmlFor='c-spread' className='flex items-center gap-1 text-xs text-zinc-500 font-medium mb-1.5'>
                Spread (pips)
                <span title='Selisih bid/ask saat ini' className='text-zinc-600'>
                  <Info className='w-3 h-3' aria-hidden='true' />
                </span>
              </label>
              <input
                id='c-spread'
                type='number'
                className='form-input'
                step='0.1'
                value={state.spread}
                onChange={e => update('spread', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='c-lot' className='block text-xs text-zinc-500 font-medium mb-1.5'>
                Lot Size
              </label>
              <input
                id='c-lot'
                type='number'
                className='form-input'
                step='0.01'
                value={state.lotSize}
                onChange={e => update('lotSize', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Account / Risk */}
        <div className='card p-4 sm:p-5 space-y-4'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono flex items-center gap-2'>
            <Wallet className='w-3.5 h-3.5' aria-hidden='true' />
            Account &amp; Risk Management
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label htmlFor='c-balance' className='block text-xs text-zinc-500 font-medium mb-1.5'>
                Account Balance ($)
              </label>
              <input
                id='c-balance'
                type='number'
                className='form-input'
                value={state.accountBalance}
                onChange={e => update('accountBalance', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='c-risk' className='block text-xs text-zinc-500 font-medium mb-1.5'>
                Risk per Trade (%)
              </label>
              <input
                id='c-risk'
                type='number'
                className='form-input'
                step='0.1'
                value={state.riskPercent}
                onChange={e => update('riskPercent', e.target.value)}
              />
            </div>
          </div>

          {/* Position size suggestion */}
          {result.slPips > 0 && result.recommendedLots > 0 && (
            <div className='p-3 rounded-lg bg-blue-950/40 border border-blue-900 flex items-start gap-2.5'>
              <Target className='w-4 h-4 shrink-0 mt-0.5 text-blue-400' aria-hidden='true' />
              <div className='flex-1 min-w-0'>
                <p className='text-xs text-blue-300 font-semibold mb-0.5'>
                  Recommended Lot Size
                </p>
                <p className='text-xs text-blue-200/70 leading-relaxed'>
                  Untuk risk <strong>${fmt(result.riskAmount)}</strong> ({state.riskPercent}% dari balance) dengan SL {fmt(result.slPips, 1)} pips,
                  gunakan lot size <strong>{result.recommendedLots.toFixed(2)}</strong>.
                </p>
              </div>
              <button
                onClick={applyRecommendedLot}
                className='shrink-0 text-xs font-semibold px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-300 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-blue-500'
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </section>

      {/* RESULTS PANEL ──────────────────────────────────────── */}
      <aside className='lg:col-span-2 lg:sticky lg:top-0 space-y-4 sm:space-y-5 lg:self-start' aria-label='Calculation results'>
        {/* Validation banner */}
        {!result.isValid && result.validationMsg && (
          <div className='p-3 rounded-lg bg-red-950/40 border border-red-900 flex items-start gap-2.5' role='alert'>
            <AlertTriangle className='w-4 h-4 shrink-0 mt-0.5 text-red-400' aria-hidden='true' />
            <p className='text-xs text-red-300 leading-relaxed'>{result.validationMsg}</p>
          </div>
        )}

        {/* RR + pips */}
        <div className='card p-4 sm:p-5 space-y-4'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono flex items-center gap-2'>
            <Calculator className='w-3.5 h-3.5' aria-hidden='true' />
            Risk : Reward
          </h2>

          <div className='text-center py-3'>
            <p className={cn(
              'mono text-3xl sm:text-4xl font-bold',
              result.rrRatio >= 2 ? 'text-green-400'
                : result.rrRatio >= 1 ? 'text-amber-400'
                : 'text-red-400'
            )}>
              {result.rrLabel}
            </p>
            <p className='text-xs text-zinc-500 mt-1'>
              {result.rrRatio >= 2  ? 'Excellent risk-reward'
                : result.rrRatio >= 1.5 ? 'Acceptable'
                : result.rrRatio >= 1 ? 'Marginal — bisa lebih baik'
                : result.rrRatio > 0 ? 'Poor — risk lebih besar dari reward'
                : 'Set entry, SL, dan TP untuk hitung'}
            </p>
          </div>

          {/* Visual RR bar */}
          {result.slPips > 0 && result.tpPips > 0 && (
            <div className='space-y-1'>
              <div className='flex items-center gap-1 h-3 rounded-md overflow-hidden bg-zinc-900'>
                <div
                  className='h-full bg-red-500/80'
                  style={{ width: `${(result.slPips / (result.slPips + result.tpPips)) * 100}%` }}
                />
                <div
                  className='h-full bg-green-500/80'
                  style={{ width: `${(result.tpPips / (result.slPips + result.tpPips)) * 100}%` }}
                />
              </div>
              <div className='flex justify-between text-xs'>
                <span className='text-red-400 mono font-semibold'>
                  Risk: {fmt(result.slPips, 1)} pips
                </span>
                <span className='text-green-400 mono font-semibold'>
                  Reward: {fmt(result.tpPips, 1)} pips
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PnL projections */}
        <div className='card p-4 sm:p-5 space-y-3'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono'>
            Projection (lot {state.lotSize})
          </h2>
          <ResultRow
            icon={<ArrowUpToLine className='w-4 h-4 text-green-400' aria-hidden='true' />}
            label='Potensi Profit'
            value={fmtPnl(result.potentialGain)}
            valueClass='text-green-400'
          />
          <ResultRow
            icon={<ArrowDownToLine className='w-4 h-4 text-red-400' aria-hidden='true' />}
            label='Potensi Loss'
            value={'-$' + fmt(result.potentialLoss)}
            valueClass='text-red-400'
          />
          <ResultRow
            label='Spread Cost'
            value={'-$' + fmt(result.spreadCost)}
            valueClass='text-zinc-400'
          />
          <ResultRow
            label='Pip Value'
            value={'$' + fmt(result.pipValue) + ' / pip'}
            valueClass='text-zinc-300'
          />
        </div>

        {/* Account impact */}
        <div className='card p-4 sm:p-5 space-y-3'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono'>
            Account Impact
          </h2>
          <ResultRow
            label='Balance'
            value={'$' + fmt(parseFloat(state.accountBalance) || 0)}
            valueClass='text-zinc-300'
          />
          <ResultRow
            label={`Risk @ ${state.riskPercent}%`}
            value={'$' + fmt(result.riskAmount)}
            valueClass='text-amber-400'
          />
          {result.potentialLoss > 0 && parseFloat(state.accountBalance) > 0 && (
            <ResultRow
              label='Actual Risk %'
              value={fmt((result.potentialLoss / parseFloat(state.accountBalance)) * 100, 2) + '%'}
              valueClass={
                (result.potentialLoss / parseFloat(state.accountBalance)) * 100
                  > parseFloat(state.riskPercent) ? 'text-red-400' : 'text-green-400'
              }
            />
          )}
          {result.potentialGain > 0 && parseFloat(state.accountBalance) > 0 && (
            <ResultRow
              label='Balance jika TP'
              value={'$' + fmt((parseFloat(state.accountBalance) || 0) + result.potentialGain - result.spreadCost)}
              valueClass='text-green-400'
            />
          )}
        </div>

        {/* Pair info */}
        <div className='card p-4 sm:p-5'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3'>
            {state.pair} Info
          </h2>
          <dl className='space-y-2 text-xs'>
            <div className='flex justify-between'>
              <dt className='text-zinc-500'>Category</dt>
              <dd className='text-zinc-300 capitalize'>{result.spec.category}</dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-zinc-500'>1 pip</dt>
              <dd className='text-zinc-300 mono'>
                {(1 / Math.pow(10, result.spec.pipDecimal)).toFixed(result.spec.pipDecimal)}
              </dd>
            </div>
            <div className='flex justify-between'>
              <dt className='text-zinc-500'>Pip value / 1.0 lot</dt>
              <dd className='text-zinc-300 mono'>${fmt(result.spec.pipValuePerLot)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

function PriceField({
  id, label, value, onChange, digits, icon,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  digits: number
  icon: 'entry' | 'sl' | 'tp'
}) {
  const colors = {
    entry: 'text-zinc-400',
    sl:    'text-red-400',
    tp:    'text-green-400',
  }
  return (
    <div>
      <label htmlFor={id} className={`flex items-center gap-1 text-xs font-medium mb-1.5 ${colors[icon]}`}>
        {label}
      </label>
      <input
        id={id}
        type='number'
        className='form-input mono'
        step={Math.pow(10, -digits).toFixed(digits)}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function ResultRow({
  icon, label, value, valueClass,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  valueClass: string
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <div className='flex items-center gap-2 min-w-0'>
        {icon}
        <dt className='text-xs text-zinc-500 truncate'>{label}</dt>
      </div>
      <dd className={cn('mono text-sm font-semibold shrink-0', valueClass)}>{value}</dd>
    </div>
  )
}

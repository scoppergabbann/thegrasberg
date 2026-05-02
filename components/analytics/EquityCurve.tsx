'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn, formatPnl } from '@/lib/utils'
import type { EquityPoint } from '@/lib/analytics'

interface Props {
  equityT: EquityPoint[]
  equityD: EquityPoint[]
  mode: 'trade' | 'day'
  onModeChange: (m: 'trade' | 'day') => void
  maxDrawdown: number
}

const HEIGHT = 220
const PADDING = { top: 16, right: 16, bottom: 28, left: 50 }

export default function EquityCurve({ equityT, equityD, mode, onModeChange, maxDrawdown }: Props) {
  const data = mode === 'trade' ? equityT : equityD
  if (data.length === 0) {
    return (
      <div className='card p-5'>
        <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-2'>Equity Curve</h2>
        <p className='text-xs text-zinc-600'>Belum ada data</p>
      </div>
    )
  }

  // Calculate viewBox
  const width = 800
  const innerW = width - PADDING.left - PADDING.right
  const innerH = HEIGHT - PADDING.top - PADDING.bottom
  const minY  = Math.min(0, ...data.map(d => d.cumulative))
  const maxY  = Math.max(0, ...data.map(d => d.cumulative))
  const rangeY = maxY - minY || 1

  const xStep  = data.length > 1 ? innerW / (data.length - 1) : 0
  const yScale = (v: number) => PADDING.top + innerH * (1 - (v - minY) / rangeY)

  // Build path
  const linePath  = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${PADDING.left + i * xStep} ${yScale(p.cumulative)}`).join(' ')
  const areaPath  = `${linePath} L ${PADDING.left + (data.length - 1) * xStep} ${yScale(0)} L ${PADDING.left} ${yScale(0)} Z`
  const zeroLineY = yScale(0)

  // Y axis ticks (5 ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => minY + rangeY * p)

  // X axis labels (every Nth point)
  const xLabelEvery = Math.max(1, Math.floor(data.length / 6))
  const xLabels = data.map((d, i) => ({ ...d, i })).filter((_, i) => i % xLabelEvery === 0 || i === data.length - 1)

  const final = data[data.length - 1].cumulative

  return (
    <div className='card p-3 sm:p-5'>
      <div className='flex items-start justify-between gap-3 mb-4 flex-wrap'>
        <div>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-1'>Equity Curve</h2>
          <div className='flex items-baseline gap-2'>
            <span className={cn('mono text-lg sm:text-xl font-bold', final >= 0 ? 'text-green-400' : 'text-red-400')}>
              {formatPnl(final)}
            </span>
            <span className='text-xs text-zinc-500'>cumulative</span>
            {maxDrawdown > 0 && (
              <span className='text-xs text-red-400 ml-2'>· max DD -${maxDrawdown.toFixed(0)}</span>
            )}
          </div>
        </div>

        <div className='flex gap-1.5' role='group' aria-label='Equity mode'>
          <button onClick={() => onModeChange('trade')} aria-pressed={mode === 'trade'}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              mode === 'trade' ? 'bg-zinc-700 border-zinc-500 text-zinc-100' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300')}>
            Per Trade
          </button>
          <button onClick={() => onModeChange('day')} aria-pressed={mode === 'day'}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              mode === 'day' ? 'bg-zinc-700 border-zinc-500 text-zinc-100' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300')}>
            Per Day
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <svg viewBox={`0 0 ${width} ${HEIGHT}`} className='w-full min-w-[400px]' role='img' aria-label='Equity curve chart'>
          {/* Y grid lines */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PADDING.left} x2={width - PADDING.right} y1={yScale(v)} y2={yScale(v)} stroke='#222' strokeDasharray='2 3' />
              <text x={PADDING.left - 6} y={yScale(v) + 3} fontSize='9' fill='#666' textAnchor='end' fontFamily='monospace'>
                ${v >= 0 ? '' : '-'}{Math.abs(v) >= 1000 ? (Math.abs(v) / 1000).toFixed(1) + 'k' : Math.abs(v).toFixed(0)}
              </text>
            </g>
          ))}

          {/* Zero line */}
          <line x1={PADDING.left} x2={width - PADDING.right} y1={zeroLineY} y2={zeroLineY} stroke='#444' strokeWidth='1' />

          {/* Area fill */}
          <path d={areaPath} fill={final >= 0 ? '#16a34a20' : '#dc262620'} />
          {/* Line */}
          <path d={linePath} fill='none' stroke={final >= 0 ? '#22c55e' : '#ef4444'} strokeWidth='2' strokeLinejoin='round' strokeLinecap='round' />

          {/* Data points */}
          {data.length <= 50 && data.map((p, i) => (
            <circle key={i} cx={PADDING.left + i * xStep} cy={yScale(p.cumulative)} r='2.5'
              fill={p.pnl >= 0 ? '#22c55e' : '#ef4444'}>
              <title>{`${p.date} · ${formatPnl(p.cumulative)}`}</title>
            </circle>
          ))}

          {/* X axis labels */}
          {xLabels.map(({ i, date }) => (
            <text key={i} x={PADDING.left + i * xStep} y={HEIGHT - 8} fontSize='9' fill='#666' textAnchor='middle' fontFamily='monospace'>
              {date.slice(5)}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend / hint */}
      <div className='flex flex-wrap gap-3 mt-3 text-xs text-zinc-600'>
        <span className='flex items-center gap-1.5'><TrendingUp className='w-3 h-3 text-green-400' aria-hidden='true' />Naik konsisten = sistem solid</span>
        <span className='flex items-center gap-1.5'><span className='w-3 h-px bg-zinc-500' aria-hidden='true' />Sideways = overtrading</span>
        <span className='flex items-center gap-1.5'><TrendingDown className='w-3 h-3 text-red-400' aria-hidden='true' />Drop tajam = revenge trading</span>
      </div>
    </div>
  )
}

import { Shield, AlertTriangle, Target, TrendingDown, RotateCw, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CoreMetrics } from '@/lib/analytics'
import type { RiskMetrics } from '@/lib/analytics-deep'

interface Props {
  metrics:     CoreMetrics
  riskMet:     RiskMetrics
  totalTrades: number
}

export default function RiskTab({ metrics, riskMet, totalTrades }: Props) {
  const m = riskMet
  const noRiskData = m.totalTradesWithRisk === 0

  return (
    <>
      {/* Top metrics row */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3'>
        <Card icon={<Shield className='w-3.5 h-3.5' />} label='Avg Risk per Trade'
          value={noRiskData ? '—' : `${m.avgRiskPct.toFixed(2)}%`}
          color={m.avgRiskPct <= 1 ? 'text-green-400' : m.avgRiskPct <= 2 ? 'text-amber-400' : 'text-red-400'}
          sub={noRiskData ? 'no data' : `${m.totalTradesWithRisk}/${totalTrades} trades tagged`} />

        <Card icon={<AlertTriangle className='w-3.5 h-3.5' />} label='Max Risk'
          value={noRiskData ? '—' : `${m.maxRiskPct.toFixed(2)}%`}
          color={m.maxRiskPct <= 2 ? 'text-zinc-300' : 'text-red-400'}
          sub={`${m.oversizedTrades} trades > 2%`} />

        <Card icon={<TrendingDown className='w-3.5 h-3.5' />} label='Max Drawdown'
          value={'-$' + metrics.maxDrawdown.toFixed(0)}
          color='text-red-400'
          sub={`${metrics.maxDrawdownPct.toFixed(1)}% from peak`}
          tooltip='Penurunan terdalam dari puncak balance' />

        <Card icon={<RotateCw className='w-3.5 h-3.5' />} label='Recovery Factor'
          value={isFinite(m.recoveryFactor) ? m.recoveryFactor.toFixed(2) : '∞'}
          color={m.recoveryFactor >= 3 ? 'text-green-400' : m.recoveryFactor >= 1 ? 'text-amber-400' : 'text-red-400'}
          sub='net profit ÷ max DD'
          tooltip='Seberapa cepat sistem recover dari drawdown' />
      </div>

      {/* RR planned vs actual */}
      <div className='card p-4 sm:p-5'>
        <h3 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-4 flex items-center gap-2'>
          <Target className='w-3.5 h-3.5' aria-hidden='true' />
          Risk : Reward — Planned vs Actual
        </h3>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='p-4 rounded-lg bg-blue-950/30 border border-blue-900'>
            <p className='text-xs text-blue-400 font-semibold mb-1'>Planned RR</p>
            <p className='mono text-2xl font-bold text-zinc-100 mb-1'>
              {m.riskRewardPlanned > 0 ? `1 : ${m.riskRewardPlanned.toFixed(2)}` : '—'}
            </p>
            <p className='text-xs text-zinc-500'>
              {m.totalTradesWithSlTp === 0
                ? 'Input SL & TP saat add trade untuk hitung'
                : `Dari ${m.totalTradesWithSlTp} trade dengan SL/TP`}
            </p>
          </div>

          <div className='p-4 rounded-lg bg-green-950/30 border border-green-900'>
            <p className='text-xs text-green-400 font-semibold mb-1'>Actual RR (realized)</p>
            <p className={cn('mono text-2xl font-bold mb-1',
              m.riskRewardActual >= 2 ? 'text-green-400'
              : m.riskRewardActual >= 1 ? 'text-amber-400'
              : 'text-red-400'
            )}>
              {m.riskRewardActual > 0 ? `1 : ${m.riskRewardActual.toFixed(2)}` : '—'}
            </p>
            <p className='text-xs text-zinc-500'>
              Dari avg win ÷ avg loss aktual
            </p>
          </div>
        </div>

        {/* Comparison insight */}
        {m.riskRewardPlanned > 0 && m.riskRewardActual > 0 && (
          <div className='mt-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800'>
            <div className='flex gap-2 items-start'>
              <Info className='w-4 h-4 text-zinc-400 shrink-0 mt-0.5' aria-hidden='true' />
              <p className='text-xs text-zinc-400 leading-relaxed'>
                {m.riskRewardActual >= m.riskRewardPlanned * 0.85
                  ? <>✅ <strong className='text-green-400'>Eksekusi sesuai plan</strong> — actual RR ({m.riskRewardActual.toFixed(2)}) hampir sama dengan planned ({m.riskRewardPlanned.toFixed(2)}).</>
                  : <>⚠️ <strong className='text-amber-400'>Gap antara plan dan eksekusi</strong> — kamu plan 1:{m.riskRewardPlanned.toFixed(2)} tapi realisasinya 1:{m.riskRewardActual.toFixed(2)}. Sering close TP terlalu cepat?</>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Drawdown analysis */}
      <div className='card p-4 sm:p-5'>
        <h3 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3'>
          Drawdown Analysis
        </h3>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <Stat label='Max DD ($)' value={`-$${metrics.maxDrawdown.toFixed(2)}`} color='text-red-400' />
          <Stat label='Max DD (%)' value={`${metrics.maxDrawdownPct.toFixed(2)}%`} color='text-red-400' />
          <Stat label='DD Duration' value={`${m.drawdownDuration} trades`} color='text-amber-400'
            sub='untuk recover ke peak' />
        </div>

        <div className='mt-4 p-3 rounded-lg bg-zinc-900 border border-zinc-800'>
          <p className='text-xs font-semibold text-zinc-300 mb-2'>Formula:</p>
          <code className='text-xs text-zinc-400 mono leading-relaxed block'>
            Drawdown = Peak Equity − Current Equity<br />
            Drawdown % = (Peak − Current) / Peak × 100
          </code>
        </div>

        {metrics.maxDrawdownPct > 20 && (
          <div className='mt-3 p-3 rounded-lg bg-red-950/40 border border-red-900 flex gap-2 items-start'>
            <AlertTriangle className='w-4 h-4 text-red-400 shrink-0 mt-0.5' aria-hidden='true' />
            <div>
              <p className='text-xs text-red-300 font-semibold'>Drawdown terlalu besar</p>
              <p className='text-xs text-red-300/80 mt-1'>
                {metrics.maxDrawdownPct.toFixed(0)}% dari peak — kurangi lot size atau evaluasi setup yang sering loss.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Risk tagging hint */}
      {noRiskData && (
        <div className='card p-4 sm:p-5 bg-blue-950/20 border-blue-900/50'>
          <div className='flex gap-2.5 items-start'>
            <Info className='w-5 h-5 text-blue-400 shrink-0 mt-0.5' aria-hidden='true' />
            <div>
              <p className='text-sm font-semibold text-blue-300'>Aktifkan Risk Tracking</p>
              <p className='text-xs text-zinc-400 mt-1 leading-relaxed'>
                Saat add trade, isi field <span className='mono text-blue-400'>Risk %</span> (atau biarkan auto-calculate dari SL price + lot size).
                Setelah ada beberapa trade, tab ini akan menampilkan analisa risk yang lengkap.
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

function Stat({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className='p-3 rounded-lg bg-zinc-900 border border-zinc-800'>
      <p className='text-xs text-zinc-500 mb-1'>{label}</p>
      <p className={cn('mono text-base font-bold', color)}>{value}</p>
      {sub && <p className='text-xs text-zinc-600 mt-0.5'>{sub}</p>}
    </div>
  )
}

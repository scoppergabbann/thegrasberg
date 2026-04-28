import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PsychResult, PsychVerdict } from '@/types'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatPnl(pnl: number): string {
  const abs = Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return pnl >= 0 ? `+$${abs}` : `-$${abs}`
}
export function pnlColor(pnl: number) { return pnl >= 0 ? 'text-green-400' : 'text-red-400' }

export function computePsychResult(
  scores: number[],
  maxScore: number
): Omit<PsychResult, 'id' | 'created_at' | 'result_date'> {
  const score = scores.reduce((a, b) => a + b, 0)
  const pct   = maxScore > 0 ? Math.round(score / maxScore * 100) : 0

  // Verdict berdasarkan persentase, bukan skor absolut — biar fleksibel sesuai jumlah pertanyaan
  let verdict: PsychVerdict, allowed: boolean, feedback: PsychResult['feedback']
  if (pct >= 80) {
    verdict = 'SIAP TRADING'; allowed = true
    feedback = [
      { type: 'good', text: 'Kondisi mental dan fisik sangat optimal.' },
      { type: 'good', text: 'Persiapan analisa matang, risk management terdefinisi.' },
    ]
  } else if (pct >= 55) {
    verdict = 'KONDISI CUKUP'; allowed = true
    feedback = [
      { type: 'warn', text: 'Kondisi cukup baik, ada area perlu diperhatikan.' },
      { type: 'warn', text: 'Pertimbangkan reduce lot size, hindari news event.' },
    ]
  } else if (pct >= 25) {
    verdict = 'WASPADA'; allowed = false
    feedback = [
      { type: 'bad',  text: 'Kondisi mental kurang optimal.' },
      { type: 'bad',  text: 'Disarankan hanya observe, jangan buka posisi.' },
      { type: 'warn', text: 'Jika memaksa, lot sangat kecil dan strict SL.' },
    ]
  } else {
    verdict = 'JANGAN TRADING'; allowed = false
    feedback = [
      { type: 'bad', text: 'Kondisi sangat tidak ideal untuk trading.' },
      { type: 'bad', text: 'Risiko kerugian psikologis sangat tinggi.' },
      { type: 'bad', text: 'Gunakan waktu untuk review chart atau istirahat.' },
    ]
  }
  return { score, max_score: maxScore, percentage: pct, verdict, allowed, feedback }
}

export function verdictStyle(verdict: PsychVerdict) {
  const m: Record<PsychVerdict, { ring: string; text: string; bg: string }> = {
    'SIAP TRADING':   { ring:'border-green-500',  text:'text-green-400',  bg:'bg-green-950'  },
    'KONDISI CUKUP':  { ring:'border-amber-500',  text:'text-amber-400',  bg:'bg-amber-950'  },
    'WASPADA':        { ring:'border-orange-500', text:'text-orange-400', bg:'bg-orange-950' },
    'JANGAN TRADING': { ring:'border-red-500',    text:'text-red-400',    bg:'bg-red-950'    },
  }
  return m[verdict]
}

import type { Mood } from '@/types'

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export const PAIRS = [
  // Forex majors
  'EURUSD','GBPUSD','USDJPY','USDCHF','AUDUSD','USDCAD','NZDUSD',
  // Forex crosses
  'EURGBP','EURJPY','GBPJPY','AUDJPY','EURAUD','GBPAUD',
  // Metals
  'XAUUSD','XAGUSD',
  // Indices
  'US30','NAS100','SPX500','GER40',
  // Crypto
  'BTCUSD','ETHUSD',
  // Energy
  'USOIL',
]

export const MISTAKE_TAGS = [
  'FOMO','Tidak follow plan','Lot size terlalu besar','Tidak set SL',
  'Move SL too early','Close TP terlalu cepat','Revenge trading',
  'Trading saat news','Overtrading','Counter-trend tanpa konfirmasi',
]

export const GOOD_TAGS = [
  'Follow plan','Disiplin SL','Patient entry','Patient exit',
  'A+ setup','Confluence kuat','Risk management OK','Skip bad setup',
]

export const MOOD_COLORS: Record<Mood, string> = {
  Focused:   'text-blue-400',
  Confident: 'text-green-400',
  Anxious:   'text-amber-400',
  FOMO:      'text-orange-400',
  Revenge:   'text-red-400',
}

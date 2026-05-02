export type Direction    = 'BUY' | 'SELL'
export type Session      = 'Asia' | 'London' | 'New York' | 'London/NY'
export type NewsImpact   = 'high' | 'medium' | 'low'
export type Mood         = 'Focused' | 'Confident' | 'Anxious' | 'FOMO' | 'Revenge'
export type TagType      = 'mistake' | 'good'
export type SetupType    = 'Breakout' | 'Pullback' | 'Reversal' | 'News' | 'Range' | 'Trend' | 'Other'
export type PsychVerdict = 'SIAP TRADING' | 'KONDISI CUKUP' | 'WASPADA' | 'JANGAN TRADING'
export type SourceType   = 'youtube' | 'book' | 'podcast' | 'article' | 'twitter' | 'course' | 'other'

export interface Highlight {
  text:       string
  timestamp?: string   // mis: '12:45' untuk video, atau 'p.234' untuk buku
}

export interface Lesson {
  id?:           string
  source_type:   SourceType
  source_name:   string
  source_url:    string | null
  title:         string
  summary:       string
  highlights:    Highlight[]
  my_notes:      string
  takeaway:      string
  tags:          string[]
  rating:        number      // 0-5
  is_favorite:   boolean
  date_consumed: string | null
  duration_min:  number | null
  created_at?:   string
  updated_at?:   string
}

export interface Trade {
  id:           string
  trade_date:   string
  trade_time:   string | null
  pair:         string
  direction:    Direction
  pnl:          number
  lot_size:     number | null
  session:      Session
  note:         string
  setup_type:   SetupType | null
  entry_price:  number | null
  sl_price:     number | null
  tp_price:     number | null
  risk_pct:     number | null
  custom_tags:  string[]
  created_at?:  string
}
export interface Tag      { type: TagType; value: string }
export interface DayNote  {
  id?:         string
  note_date:   string
  mood:        Mood | null
  analysis:    string
  execution:   string
  lesson:      string
  tags:        Tag[]
  updated_at?: string
}
export interface NewsEvent { time: string; currency: string; title: string; impact: NewsImpact; previous?: string; forecast?: string; description: string }
export interface PsychOption  { text: string; score: number; level: 'good' | 'warn' | 'bad' }
export interface PsychQuestion { id?: string; question: string; subtitle: string; options: PsychOption[]; sort_order?: number; is_active?: boolean; is_default?: boolean; created_at?: string; updated_at?: string }
export interface PsychResult { id?: string; result_date: string; score: number; max_score: number; percentage: number; verdict: PsychVerdict; allowed: boolean; feedback: Array<{ type: 'good' | 'warn' | 'bad'; text: string }>; created_at?: string }
export interface MonthData { trades: Record<string, Trade[]>; notes: Record<string, DayNote>; psychResults: Record<string, PsychResult> }
export interface GlobalStats { pnl: number; winRate: number; journalDays: number; totalTrades: number }

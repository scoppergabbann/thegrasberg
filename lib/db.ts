
import { supabase } from './supabase'
import type { Trade, DayNote, PsychResult, GlobalStats } from '@/types'

function monthRange(year: number, month: number) {
  const mm  = String(month + 1).padStart(2, '0')
  const last = new Date(year, month + 1, 0).getDate()
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${last}` }
}

// ── TRADES ───────────────────────────────────────────────────
export async function getMonthTrades(year: number, month: number): Promise<Trade[]> {
  const { from, to } = monthRange(year, month)
  const { data, error } = await supabase
    .from('trades').select('*')
    .gte('trade_date', from).lte('trade_date', to)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(r => ({ ...r, pnl: Number(r.pnl) })) as Trade[]
}

export async function getAllTrades(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('trades').select('*').order('trade_date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(r => ({ ...r, pnl: Number(r.pnl) })) as Trade[]
}

export async function addTrade(trade: Omit<Trade, 'id' | 'created_at'>): Promise<Trade> {
  const { data, error } = await supabase
    .from('trades').insert(trade).select().single()
  if (error) throw error
  return { ...data, pnl: Number(data.pnl) } as Trade
}

export async function deleteTrade(id: string): Promise<void> {
  const { error } = await supabase.from('trades').delete().eq('id', id)
  if (error) throw error
}

// ── NOTES ────────────────────────────────────────────────────
export async function getMonthNotes(year: number, month: number): Promise<DayNote[]> {
  const { from, to } = monthRange(year, month)
  const { data, error } = await supabase
    .from('day_notes').select('*')
    .gte('note_date', from).lte('note_date', to)
  if (error) throw error
  return (data ?? []) as DayNote[]
}

export async function getAllNotes(): Promise<DayNote[]> {
  const { data, error } = await supabase
    .from('day_notes').select('*').order('note_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as DayNote[]
}

export async function upsertNote(note: Omit<DayNote, 'id' | 'updated_at'>): Promise<DayNote> {
  const { data, error } = await supabase
    .from('day_notes')
    .upsert({ ...note, updated_at: new Date().toISOString() }, { onConflict: 'note_date' })
    .select().single()
  if (error) throw error
  return data as DayNote
}

// ── PSYCH ─────────────────────────────────────────────────────
export async function getMonthPsych(year: number, month: number): Promise<PsychResult[]> {
  const { from, to } = monthRange(year, month)
  const { data, error } = await supabase
    .from('psych_results').select('*')
    .gte('result_date', from).lte('result_date', to)
  if (error) throw error
  return (data ?? []) as PsychResult[]
}

export async function getAllPsych(): Promise<PsychResult[]> {
  const { data, error } = await supabase
    .from('psych_results').select('*').order('result_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as PsychResult[]
}

export async function upsertPsych(r: Omit<PsychResult, 'id' | 'created_at'>): Promise<PsychResult> {
  const { data, error } = await supabase
    .from('psych_results')
    .upsert(r, { onConflict: 'result_date' })
    .select().single()
  if (error) throw error
  return data as PsychResult
}

export async function deletePsych(result_date: string): Promise<void> {
  const { error } = await supabase.from('psych_results').delete().eq('result_date', result_date)
  if (error) throw error
}

// ── GLOBAL STATS (untuk header) ───────────────────────────────
export async function getGlobalStats(): Promise<GlobalStats> {
  const [{ data: trades }, { data: notes }] = await Promise.all([
    supabase.from('trades').select('pnl'),
    supabase.from('day_notes').select('note_date'),
  ])
  const pnl      = (trades ?? []).reduce((a, t) => a + Number(t.pnl), 0)
  const wins     = (trades ?? []).filter(t => Number(t.pnl) > 0).length
  const winRate  = trades?.length ? Math.round(wins / trades.length * 100) : 0
  return { pnl, winRate, journalDays: notes?.length ?? 0, totalTrades: trades?.length ?? 0 }
}

export async function getMonthStats(year: number, month: number) {
  const trades = await getMonthTrades(year, month)
  const notes  = await getMonthNotes(year, month)
  const psych  = await getMonthPsych(year, month)
  const totalPnl = trades.reduce((a, t) => a + Number(t.pnl), 0)
  const wins = trades.filter(t => Number(t.pnl) > 0).length
  const winRate = trades.length ? Math.round(wins / trades.length * 100) : 0
  return { totalPnl, totalTrades: trades.length, winRate, journalDays: notes.length, psychDays: psych.length }
}

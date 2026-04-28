'use server'

import { revalidatePath } from 'next/cache'
import {
  addTrade as dbAdd, deleteTrade as dbDel,
  upsertNote, upsertPsych, deletePsych as dbDeletePsych,
  createPsychQuestion as dbCreateQ,
  updatePsychQuestion as dbUpdateQ,
  deletePsychQuestion as dbDeleteQ,
  reorderPsychQuestions as dbReorderQ,
} from './db'
import { computePsychResult } from './utils'
import type { Trade, DayNote, PsychQuestion } from '@/types'

// ── TRADES ───────────────────────────────────────────────────
export async function actionAddTrade(trade: Omit<Trade, 'id' | 'created_at'>) {
  await dbAdd(trade)
  revalidatePath('/'); revalidatePath('/analytics'); revalidatePath('/all-trades')
}

export async function actionDeleteTrade(id: string) {
  await dbDel(id)
  revalidatePath('/'); revalidatePath('/analytics'); revalidatePath('/all-trades')
}

// ── JOURNAL NOTES ────────────────────────────────────────────
export async function actionSaveNote(note: Omit<DayNote, 'id' | 'updated_at'>) {
  await upsertNote(note)
  revalidatePath('/'); revalidatePath('/journal')
}

export async function actionDeleteNote(note_date: string) {
  const { supabase } = await import('./supabase')
  await supabase.from('day_notes').delete().eq('note_date', note_date)
  revalidatePath('/'); revalidatePath('/journal')
}

// ── PSYCH RESULTS ─────────────────────────────────────────────
export async function actionSavePsych(result_date: string, scores: number[], maxScore: number) {
  const result = computePsychResult(scores, maxScore)
  await upsertPsych({ ...result, result_date })
  revalidatePath('/'); revalidatePath('/psych-history'); revalidatePath('/psych-test')
}

export async function actionDeletePsychResult(result_date: string) {
  await dbDeletePsych(result_date)
  revalidatePath('/'); revalidatePath('/psych-history')
}

// ── PSYCH QUESTIONS (CRUD) ────────────────────────────────────
export async function actionCreatePsychQuestion(q: Omit<PsychQuestion, 'id' | 'created_at' | 'updated_at'>) {
  await dbCreateQ(q)
  revalidatePath('/psych-test'); revalidatePath('/psych-questions')
}

export async function actionUpdatePsychQuestion(id: string, q: Partial<PsychQuestion>) {
  await dbUpdateQ(id, q)
  revalidatePath('/psych-test'); revalidatePath('/psych-questions')
}

export async function actionDeletePsychQuestion(id: string) {
  await dbDeleteQ(id)
  revalidatePath('/psych-test'); revalidatePath('/psych-questions')
}

export async function actionReorderPsychQuestions(ids: string[]) {
  await dbReorderQ(ids)
  revalidatePath('/psych-test'); revalidatePath('/psych-questions')
}

export async function actionTogglePsychQuestion(id: string, is_active: boolean) {
  await dbUpdateQ(id, { is_active })
  revalidatePath('/psych-test'); revalidatePath('/psych-questions')
}

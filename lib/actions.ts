
'use server'

import { revalidatePath } from 'next/cache'
import { addTrade as dbAdd, deleteTrade as dbDel, upsertNote, upsertPsych, deletePsych } from './db'
import { computePsychResult } from './utils'
import type { Trade, DayNote } from '@/types'

// ── TRADES ───────────────────────────────────────────────────

export async function actionAddTrade(trade: Omit<Trade,'id'|'created_at'>) {
  await dbAdd(trade)
  revalidatePath('/')
  revalidatePath('/analytics')
  revalidatePath('/all-trades')
}

export async function actionDeleteTrade(id: string) {
  await dbDel(id)
  revalidatePath('/')
  revalidatePath('/analytics')
  revalidatePath('/all-trades')
}

// ── NOTES ────────────────────────────────────────────────────

export async function actionSaveNote(note: Omit<DayNote,'id'|'updated_at'>) {
  await upsertNote(note)
  revalidatePath('/')
  revalidatePath('/journal')
}

// ── PSYCH ─────────────────────────────────────────────────────

export async function actionSavePsych(result_date: string, scores: number[]) {
  const result = computePsychResult(scores)
  await upsertPsych({ ...result, result_date })
  revalidatePath('/')
  revalidatePath('/psych-history')
}

export async function actionDeletePsych(result_date: string) {
  await deletePsych(result_date)
  revalidatePath('/')
  revalidatePath('/psych-history')
}

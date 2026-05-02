/**
 * Lessons CRUD — append these to your existing lib/db.ts
 * (or import from this file directly)
 */

import { supabase } from './supabase'
import type { Lesson } from '@/types'

export async function getAllLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Lesson[]
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null  // not found
    throw error
  }
  return data as Lesson
}

export async function createLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({ ...lesson, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data as Lesson
}

export async function updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .update({ ...lesson, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Lesson
}

export async function deleteLesson(id: string): Promise<void> {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}

export async function toggleLessonFavorite(id: string, is_favorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('lessons')
    .update({ is_favorite, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

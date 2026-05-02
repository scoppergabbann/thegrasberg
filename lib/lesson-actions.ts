'use server'

import { revalidatePath } from 'next/cache'
import {
  createLesson, updateLesson, deleteLesson, toggleLessonFavorite,
} from './db-lessons'
import type { Lesson } from '@/types'

export async function actionCreateLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) {
  const created = await createLesson(lesson)
  revalidatePath('/lessons')
  return created
}

export async function actionUpdateLesson(id: string, lesson: Partial<Lesson>) {
  const updated = await updateLesson(id, lesson)
  revalidatePath('/lessons')
  return updated
}

export async function actionDeleteLesson(id: string) {
  await deleteLesson(id)
  revalidatePath('/lessons')
}

export async function actionToggleLessonFavorite(id: string, is_favorite: boolean) {
  await toggleLessonFavorite(id, is_favorite)
  revalidatePath('/lessons')
}

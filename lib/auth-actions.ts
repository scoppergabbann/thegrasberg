'use server'

import { redirect } from 'next/navigation'
import { createSessionToken, setSessionCookie, clearSessionCookie } from './auth'

export interface LoginState {
  error?: string
}

export async function actionLogin(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next     = String(formData.get('next') ?? '/')

  // Validate against env credentials
  const validUser = process.env.AUTH_USERNAME || 'admin'
  const validPass = process.env.AUTH_PASSWORD || 'g1ch1'

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi' }
  }
  if (username !== validUser || password !== validPass) {
    return { error: 'Username atau password salah' }
  }

  const token = await createSessionToken(username)
  await setSessionCookie(token)

  // Sanitize redirect target — only allow same-origin paths
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
  redirect(safeNext)
}

export async function actionLogout() {
  await clearSessionCookie()
  redirect('/login')
}

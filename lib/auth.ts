import { cookies } from 'next/headers'

const COOKIE_NAME = 'fxj_session'
const SESSION_DURATION = 60 * 60 * 24 * 7  // 7 days

// Use Web Crypto API (available in middleware Edge Runtime)
async function hmacSign(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createSessionToken(username: string): Promise<string> {
  const secret = process.env.AUTH_SECRET || 'fallback-dev-secret-please-set-AUTH_SECRET'
  const expiresAt = Date.now() + SESSION_DURATION * 1000
  const payload = `${username}|${expiresAt}`
  const sig = await hmacSign(payload, secret)
  // Base64 encode payload, append signature
  const b64 = btoa(payload)
  return `${b64}.${sig}`
}

export async function verifySessionToken(token: string | undefined): Promise<{ username: string } | null> {
  if (!token) return null
  const secret = process.env.AUTH_SECRET || 'fallback-dev-secret-please-set-AUTH_SECRET'
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [b64, sig] = parts
  let payload: string
  try { payload = atob(b64) } catch { return null }
  const [username, expiresAtStr] = payload.split('|')
  if (!username || !expiresAtStr) return null
  const expiresAt = parseInt(expiresAtStr)
  if (isNaN(expiresAt) || Date.now() > expiresAt) return null
  // Verify signature
  const expectedSig = await hmacSign(payload, secret)
  if (sig !== expectedSig) return null
  return { username }
}

// Server component / action helpers (NOT for middleware)
export async function getSession() {
  const c = cookies().get(COOKIE_NAME)
  return verifySessionToken(c?.value)
}

export async function setSessionCookie(token: string) {
  cookies().set({
    name:     COOKIE_NAME,
    value:    token,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   SESSION_DURATION,
  })
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE_NAME)
}

export const SESSION_COOKIE_NAME = COOKIE_NAME

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE_NAME = 'admin_session'

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie || !sessionCookie.value) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    redirect('/login?redirect=/dashboard')
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

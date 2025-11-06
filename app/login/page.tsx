import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>
}) {
  const params = await searchParams
  const authenticated = await isAuthenticated()

  if (authenticated) {
    redirect(params.redirect || '/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Enter your password to access the dashboard
          </p>
        </div>
        <LoginForm redirect={params.redirect} error={params.error} />
      </div>
    </div>
  )
}


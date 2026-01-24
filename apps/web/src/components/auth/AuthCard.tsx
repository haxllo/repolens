'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AuthCard() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleGitHubSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard'
      })
    } catch (error) {
      toast.error('GitHub sign in failed')
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        await authClient.signUp.email({
          email,
          password,
          name,
          username,
          callbackURL: '/dashboard',
        }, {
          onSuccess: () => {
            toast.success('Account created successfully!')
            router.push('/dashboard')
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Signup failed')
          }
        })
      } else {
        await authClient.signIn.email({
          email,
          password,
          rememberMe,
          callbackURL: '/dashboard',
        }, {
          onSuccess: () => {
            toast.success('Signed in successfully!')
            router.push('/dashboard')
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Sign in failed')
          }
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-white/50">
          {isSignUp 
            ? 'Enter your details to get started' 
            : 'Enter your credentials to access your dashboard'}
        </p>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {isSignUp && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp}
                className="bg-white/5 border-white/10"
              />
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/5 border-white/10"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignUp && (
              <Button variant="link" className="px-0 font-normal text-xs text-lime-400 h-auto">
                Forgot password?
              </Button>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {!isSignUp && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-lime-400 focus:ring-lime-400"
            />
            <Label htmlFor="remember" className="text-xs font-normal text-white/60 cursor-pointer">
              Remember me for 30 days
            </Label>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-lime-400 hover:bg-lime-500 text-black font-bold h-11"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            isSignUp ? 'Sign Up' : 'Sign In'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0a0a0a] px-2 text-white/30">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGitHubSignIn}
        className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white h-11"
      >
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button>

      <div className="text-center text-sm">
        <p className="text-white/50">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-lime-400 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  )
}

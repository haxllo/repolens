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
      toast.error('GitHub authentication failed')
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
            toast.success('Access granted. Redirecting...')
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
            toast.success('Identity verified.')
            router.push('/dashboard')
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Verification failed')
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
    <div className="w-full space-y-8">
      <div className="space-y-2 text-left">
        <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white">
          {isSignUp ? 'New Registration' : 'Verified Access'}
        </h1>
        <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">
          {isSignUp 
            ? 'Initialize user profile' 
            : 'Enter credentials for index access'}
        </p>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-6">
        {isSignUp && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[9px] uppercase font-black tracking-widest text-white/40 ml-1">Full Name</Label>
              <Input
                id="name"
                placeholder="Required"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                className="bg-black border-white/10 rounded-none h-12 text-xs placeholder:text-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[9px] uppercase font-black tracking-widest text-white/40 ml-1">Username</Label>
              <Input
                id="username"
                placeholder="ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp}
                className="bg-black border-white/10 rounded-none h-12 text-xs placeholder:text-white/10"
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[9px] uppercase font-black tracking-widest text-white/40 ml-1">Email Identifier</Label>
          <Input
            id="email"
            type="email"
            placeholder="node@archive.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-black border-white/10 rounded-none h-12 text-xs placeholder:text-white/10"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[9px] uppercase font-black tracking-widest text-white/40 ml-1">Secret Key</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black border-white/10 rounded-none h-12 text-xs pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white hover:bg-lime-400 text-black font-black uppercase text-[11px] tracking-[0.3em] h-14 rounded-none transition-all active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            isSignUp ? 'Execute Signup' : 'Authenticate'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]">
          <span className="bg-black px-4 text-white/20 tracking-[0.5em]">OR</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGitHubSignIn}
        className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white h-14 rounded-none text-[10px] font-black uppercase tracking-[0.3em] transition-all"
      >
        <Github className="mr-3 h-4 w-4" />
        External GitHub Auth
      </Button>

      <div className="text-center pt-4">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-lime-400 transition-colors"
        >
          {isSignUp ? 'Existing Identity? Login' : 'Request New Identity'}
        </button>
      </div>
    </div>
  )
}
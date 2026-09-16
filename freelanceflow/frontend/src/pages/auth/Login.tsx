import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  Star, 
  Zap,
  ShieldCheck
} from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('demo@freelanceflow.com')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { loginDemoUser } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Fast-path for demo credentials
    if (email.trim().toLowerCase() === 'demo@freelanceflow.com') {
      loginDemoUser('demo@freelanceflow.com', 'Demo Freelancer')
      navigate('/dashboard')
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Unable to reach authentication server. You can access the system via the 1-Click Demo.')
      setLoading(false)
    }
  }

  const handleQuickDemo = () => {
    loginDemoUser('demo@freelanceflow.com', 'Demo Freelancer')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen w-full flex bg-background selection:bg-primary/20 selection:text-primary">
      {/* Left Column: Visual Brand & Social Proof Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Ambient Glow / Graphic Elements */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
            <Sparkles size={20} />
          </div>
          <span className="text-2xl font-heading font-extrabold tracking-tight">FreelanceFlow CRM</span>
        </div>

        {/* Center Copy & Value Props */}
        <div className="space-y-6 z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold backdrop-blur-md">
            <Zap size={14} className="text-yellow-300" /> Powered by Groq AI & Resend
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold font-heading leading-tight">
            The workspace high-performing freelancers rely on.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Manage your pipeline, generate tailored AI proposals in seconds, and send professional PDF invoices—all in one seamless flow.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-2xl font-bold font-heading">$14M+</p>
              <p className="text-xs text-white/70">Invoices Tracked</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">&lt; 10s</p>
              <p className="text-xs text-white/70">Proposal Generation</p>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md z-10 space-y-3">
          <div className="flex text-amber-300">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </div>
          <p className="text-xs text-white/90 italic leading-relaxed">
            "FreelanceFlow transformed how I run my consulting practice. Proposal generation alone saves me 8 hours a week, and the client health score keeps me ahead of overdue accounts."
          </p>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-8 w-8 rounded-full bg-white text-slate-900 font-bold text-xs flex items-center justify-center shadow">
              SK
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Sarah Jenkins</p>
              <p className="text-[10px] text-white/70">Independent Product Designer & Consultant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-7">
          {/* Header */}
          <div className="text-left space-y-2">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-2 text-primary font-bold text-sm">
              <Sparkles size={16} /> FreelanceFlow CRM
            </Link>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-xs text-muted-foreground">
              Sign in to your FreelanceFlow account to access your pipeline.
            </p>
          </div>

          {/* Quick Demo Sandbox Access */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Demo Sandbox</span>
              </div>
              <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border">
                Pre-configured
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluate the live pipeline, Groq AI proposal generator, and Resend delivery instantly without signing up.
            </p>
            <Button
              type="button"
              onClick={handleQuickDemo}
              className="w-full h-9 font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 shadow-sm"
            >
              ⚡ Enter Demo Workspace with 1-Click <ArrowRight size={14} />
            </Button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-muted" />
            <span className="flex-shrink mx-4 text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-muted" />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail size={13} className="text-muted-foreground" /> Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock size={13} className="text-muted-foreground" /> Password
                </label>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>

          <div className="pt-2 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-green-600" />
            <span>Secure 256-bit encrypted authentication</span>
          </div>
        </div>
      </div>
    </div>
  )
}

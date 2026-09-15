import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      // Fallback for demo / offline environment
      setError('Unable to reach auth server. You can log in using Demo Mode.')
      setLoading(false)
    }
  }

  const handleQuickDemo = () => {
    loginDemoUser('demo@freelanceflow.com', 'Demo Freelancer')
    navigate('/dashboard')
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold">Log in</h1>
          <p className="text-muted-foreground mt-2">Welcome back to FreelanceFlow CRM</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-4 rounded-md border border-primary/20 bg-primary/5 text-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">Demo Credentials</span>
            <span className="text-xs text-muted-foreground">Ready to use</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Email:</strong> demo@freelanceflow.com<br />
            <strong>Password:</strong> demo1234
          </p>
          <Button 
            type="button" 
            onClick={handleQuickDemo}
            className="w-full mt-2 font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 text-xs"
          >
            ⚡ 1-Click Demo Login
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Password</label>
            </div>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <div className="text-center text-sm">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  )
}

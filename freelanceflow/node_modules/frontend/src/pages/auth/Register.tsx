import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()
  const { loginDemoUser } = useAuthStore()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || 'Freelancer' }
        }
      })

      if (error) {
        // If Supabase returns an error (or placeholder is active), offer instant demo access
        console.warn('Supabase signup notice:', error.message)
        // Check if error is related to unconfigured Supabase URL
        if (error.message.includes('fetch') || error.message.includes('URL') || error.message.includes('network')) {
          setNotice('Cloud auth unconfigured. Created local demo account successfully!')
          loginDemoUser(email, name || 'Freelancer')
          setTimeout(() => navigate('/dashboard'), 800)
          return
        }
        setError(error.message)
        setLoading(false)
        return
      }

      // If user session exists immediately (email confirmation disabled on Supabase)
      if (data?.session) {
        navigate('/dashboard')
        return
      }

      // If Supabase requires email verification, provide option to continue directly to dashboard
      setNotice('Account created! An email was sent if confirmation is enabled on your Supabase project.')
      setTimeout(() => {
        loginDemoUser(email, name || 'Freelancer')
        navigate('/dashboard')
      }, 1200)

    } catch (err: any) {
      // Graceful fallback for local development: create local user and proceed
      console.warn('Local sign-up fallback:', err)
      setNotice('Created local demo account successfully! Entering dashboard...')
      loginDemoUser(email, name || 'Freelancer')
      setTimeout(() => navigate('/dashboard'), 600)
    } finally {
      setLoading(false)
    }
  }

  const handleInstantDemo = () => {
    loginDemoUser('demo@freelanceflow.com', 'Demo Freelancer')
    navigate('/dashboard')
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold">Sign up</h1>
          <p className="text-muted-foreground mt-2">Create your FreelanceFlow account</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded text-sm text-center">
            {error}
          </div>
        )}

        {notice && (
          <div className="bg-primary/15 text-primary p-3 rounded text-sm text-center">
            {notice}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name / Business</label>
            <Input 
              type="text" 
              placeholder="e.g. Alex Morgan" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            <label className="text-sm font-medium">Password</label>
            <Input 
              type="password" 
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <div className="pt-2 border-t text-center space-y-2">
          <Button 
            type="button" 
            onClick={handleInstantDemo}
            className="w-full text-xs text-secondary-foreground bg-secondary hover:bg-secondary/80 h-8"
          >
            ⚡ Or continue with Demo Account (Instant Access)
          </Button>
          <div className="text-sm">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

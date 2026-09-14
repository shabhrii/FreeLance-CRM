import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
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

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-primary/15 text-primary p-3 rounded text-sm">
              Registration successful! Check your email to confirm your account.
            </div>
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
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
        )}
        
        <div className="text-center text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  )
}

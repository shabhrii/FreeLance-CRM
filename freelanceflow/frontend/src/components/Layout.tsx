import { Link, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function Layout() {
  const { signOut } = useAuthStore()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-heading font-bold text-primary">FreelanceFlow CRM</Link>
            <nav className="hidden md:flex gap-4">
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary">Pipeline</Link>
              <Link to="/projects" className="text-sm font-medium hover:text-primary">Projects</Link>
              <Link to="/invoices" className="text-sm font-medium hover:text-primary">Invoices</Link>
              <Link to="/proposals" className="text-sm font-medium hover:text-primary">Proposals</Link>
            </nav>
          </div>
          <Button onClick={signOut} className="flex items-center gap-2 border bg-transparent text-foreground hover:bg-muted">
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  LogOut, 
  Bell, 
  Check, 
  Layers, 
  Briefcase, 
  FileText, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react'

export default function Layout() {
  const { user, signOut } = useAuthStore()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchApi('/notifications'),
    refetchInterval: 15000,
  })

  const markAsRead = useMutation({
    mutationFn: (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  const navLinks = [
    { to: '/dashboard', label: 'Pipeline', icon: Layers },
    { to: '/projects', label: 'Projects', icon: Briefcase },
    { to: '/invoices', label: 'Invoices', icon: FileText },
    { to: '/proposals', label: 'AI Proposals', icon: Sparkles, badge: 'Groq AI' },
  ]

  const userName = (user as any)?.name || (user as any)?.user_metadata?.name || 'Freelancer'
  const userInitial = (userName || user?.email || 'U')[0].toUpperCase()


  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center text-white shadow-sm">
                <Sparkles size={16} />
              </div>
              <span className="text-lg font-heading font-extrabold tracking-tight">
                Freelance<span className="text-primary">Flow</span>
              </span>
            </Link>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to
                const Icon = link.icon
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{link.label}</span>
                    {link.badge && !isActive && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Header Controls: Notification Bell + User Profile */}
          <div className="flex items-center gap-3">
            {/* View Marketing Site Link */}
            <Link 
              to="/" 
              target="_blank" 
              className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
              title="Open Public Marketing Site"
            >
              <span>Site</span> <ExternalLink size={12} />
            </Link>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg border border-border bg-card/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border bg-card shadow-xl p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between border-b pb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">Auto-updates</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.slice(0, 8).map((n: any) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-lg border text-xs space-y-1 transition-colors ${
                            n.isRead ? 'bg-muted/20 border-transparent text-muted-foreground' : 'bg-primary/5 border-primary/20 text-foreground'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-xs leading-tight">{n.title}</p>
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => markAsRead.mutate(n.id)}
                                className="text-[10px] text-primary hover:underline shrink-0 flex items-center gap-0.5"
                                title="Mark as read"
                              >
                                <Check size={10} /> Read
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-90">{n.message}</p>
                          <p className="text-[9px] text-muted-foreground pt-0.5">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l">
              <div className="h-8 w-8 rounded-full gradient-brand text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                  {userName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  {user?.email || 'Pro Member'}
                </p>
              </div>

              <Button 
                onClick={signOut} 
                className="h-8 px-2.5 ml-1 border bg-transparent text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs flex items-center gap-1.5"
                title="Sign out"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b bg-card px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium ${
                    isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={15} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Main Page Outlet */}
      <main className="container mx-auto px-4 py-6 flex-1 max-w-7xl">
        <Outlet />
      </main>

      {/* App Sub-Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground bg-card/50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} FreelanceFlow CRM • Built for Independent High-Performers</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Systems Operational
            </span>
            <span>•</span>
            <span>Resend & Groq Connected</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

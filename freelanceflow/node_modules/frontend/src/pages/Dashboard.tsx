import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  Briefcase, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Trash2,
  UserPlus
} from 'lucide-react'
import ClientHealth from '@/components/ClientHealth'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Won', 'Lost']

export default function Dashboard() {
  const queryClient = useQueryClient()
  
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetchApi('/analytics')
  })

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchApi('/clients')
  })

  const createClient = useMutation({
    mutationFn: (newClient: any) => fetchApi('/clients', {
      method: 'POST',
      body: JSON.stringify(newClient)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setNewClientName('')
      setNewClientEmail('')
      setShowAddForm(false)
    }
  })

  const updateClientStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => fetchApi(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })

  const deleteClient = useMutation({
    mutationFn: (id: string) => fetchApi(`/clients/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName.trim()) return
    createClient.mutate({ name: newClientName.trim(), email: newClientEmail.trim() || undefined, status: 'New' })
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading flex items-center gap-2.5">
            <Layers className="text-primary" size={26} /> Client Pipeline & Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track leads across every milestone, monitor Groq AI account health, and trigger instant Resend proposals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 px-4 flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={15} />
            <span>{showAddForm ? 'Cancel' : '+ Add New Lead'}</span>
          </Button>
        </div>
      </div>

      {/* Expandable Add Lead Banner */}
      {showAddForm && (
        <div className="p-5 border rounded-xl bg-card shadow-md space-y-3 transition-all animate-in fade-in duration-200">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Plus size={16} className="text-primary" /> Create New Prospect / Client
          </h2>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1 w-full">
              <label className="text-xs font-semibold text-foreground">Client or Business Name *</label>
              <input 
                type="text" 
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Acme Corp or Jane Doe"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 space-y-1 w-full">
              <label className="text-xs font-semibold text-foreground">Primary Contact Email</label>
              <input 
                type="email" 
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="client@company.com"
                value={newClientEmail}
                onChange={e => setNewClientEmail(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={createClient.isPending} 
              className="h-9 px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              <Plus size={14} /> {createClient.isPending ? 'Saving...' : 'Add to Pipeline'}
            </Button>
          </form>
          {createClient.isError && (
            <p className="text-xs text-destructive font-medium">
              {(createClient.error as any)?.message || 'Failed to add client. Please try again.'}
            </p>
          )}
        </div>
      )}

      {/* Financial Overview & Attention Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-xl bg-card shadow-sm col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Financial Overview & Cash Flow
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-medium">
              Real-time DB Sync
            </span>
          </div>

          <div className="flex flex-wrap gap-8 pt-1">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">Realized Revenue</p>
              <p className="text-2xl font-bold font-heading text-foreground">
                ${(analytics?.metrics?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">Outstanding Invoices</p>
              <p className="text-2xl font-bold font-heading text-yellow-600 dark:text-yellow-400">
                ${(analytics?.metrics?.outstandingRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">Total Clients</p>
              <p className="text-2xl font-bold font-heading text-foreground">
                {clients.length}
              </p>
            </div>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--border)' }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                />
                <Bar dataKey="total" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Needs Attention AI Box */}
        <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 text-destructive">
              <AlertCircle size={18} /> Accounts Needing Attention
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Groq AI continuously tracks overdue bills and communication gaps.
            </p>

            <div className="space-y-2.5 mt-4">
              {analytics?.atRiskClients?.map((client: any) => (
                <div key={client.id} className="p-3 border border-destructive/20 rounded-lg bg-destructive/5 text-xs space-y-1">
                  <div className="font-semibold text-destructive flex justify-between items-center">
                    <span>{client.name}</span>
                    <span className="text-[10px] bg-destructive/10 px-1.5 py-0.5 rounded font-mono">
                      Score: {client.healthScore || 'N/A'}/100
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Requires follow-up on outstanding deliverables or invoice.
                  </p>
                </div>
              ))}
              {(!analytics?.atRiskClients || analytics?.atRiskClients?.length === 0) && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center space-y-1">
                  <CheckCircle2 size={20} className="text-green-600 mx-auto" />
                  <p className="text-xs font-semibold text-green-700 dark:text-green-300">All Accounts Healthy</p>
                  <p className="text-[11px] text-muted-foreground">No overdue invoices or stale leads detected.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t text-[11px] text-muted-foreground text-center">
            Scores evaluated via Groq AI Llama engine
          </div>
        </div>
      </div>

      {/* Kanban Pipeline Stage Boards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2">
            <span>Lead Stages</span>
            <span className="text-xs font-normal text-muted-foreground">
              ({clients.length} total across all columns)
            </span>
          </h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Update stages from dropdowns on each card
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading pipeline stages...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const stageClients = clients.filter((c: any) => c.status === stage)
              return (
                <div key={stage} className="flex-1 min-w-[290px] max-w-[340px] bg-muted/20 p-4 rounded-xl border space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-2">
                      <span>{stage}</span>
                    </h3>
                    <span className="bg-muted text-foreground text-xs font-bold py-0.5 px-2 rounded-full border">
                      {stageClients.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[140px]">
                    {stageClients.map((client: any) => (
                      <div key={client.id} className="bg-card p-4 rounded-xl border shadow-xs hover:shadow-md transition-all space-y-3 group">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-sm text-foreground">{client.name}</div>
                            {client.email && (
                              <div className="text-xs text-muted-foreground">{client.email}</div>
                            )}
                          </div>
                          <button 
                            type="button"
                            onClick={() => deleteClient.mutate(client.id)}
                            className="text-muted-foreground hover:text-destructive text-xs opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Delete Lead"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Stage Selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Stage</label>
                          <select 
                            className="w-full text-xs rounded-md bg-background px-2 py-1.5 border border-input focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                            value={client.status}
                            onChange={(e) => updateClientStatus.mutate({ id: client.id, status: e.target.value })}
                          >
                            {STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Health Score Component */}
                        <ClientHealth clientId={client.id} />

                        {/* Direct Action Links */}
                        <div className="pt-2 border-t flex items-center justify-between text-xs">
                          <Link 
                            to={`/invoices?clientId=${client.id}`} 
                            className="hover:text-primary flex items-center gap-1 font-semibold text-primary"
                            title="Create Invoice for Client"
                          >
                            <FileText size={12} /> Invoice
                          </Link>
                          <Link 
                            to="/projects" 
                            className="hover:text-foreground flex items-center gap-1 text-muted-foreground"
                            title="View Projects"
                          >
                            <Briefcase size={12} /> Project
                          </Link>
                          <Link 
                            to={`/proposals?clientId=${client.id}`} 
                            className="hover:text-purple-600 flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400"
                            title="Generate AI Proposal & Email"
                          >
                            <Sparkles size={12} /> Proposal
                          </Link>
                        </div>
                      </div>
                    ))}

                    {stageClients.length === 0 && (
                      <div className="p-4 border border-dashed rounded-lg text-center text-xs text-muted-foreground">
                        No clients in {stage}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

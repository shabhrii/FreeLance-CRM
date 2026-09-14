import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, AlertCircle } from 'lucide-react'
import ClientHealth from '@/components/ClientHealth'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Won', 'Lost']

export default function Dashboard() {
  const queryClient = useQueryClient()
  
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')

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
      setNewClientName('')
      setNewClientEmail('')
    }
  })

  const updateClientStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => fetchApi(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    }
  })

  const deleteClient = useMutation({
    mutationFn: (id: string) => fetchApi(`/clients/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName) return
    createClient.mutate({ name: newClientName, email: newClientEmail, status: 'New' })
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 border rounded-lg bg-card shadow-sm col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Financial Overview
          </h2>
          <div className="flex gap-8 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${(analytics?.metrics?.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-600">${(analytics?.metrics?.outstandingRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="total" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
            <AlertCircle size={20} /> Needs Attention
          </h2>
          <div className="space-y-4">
            {analytics?.atRiskClients?.map((client: any) => (
              <div key={client.id} className="p-3 border rounded bg-destructive/5 text-sm">
                <div className="font-medium text-destructive">{client.name}</div>
                <div className="text-muted-foreground">Health Score: {client.healthScore || 'N/A'}</div>
              </div>
            ))}
            {analytics?.atRiskClients?.length === 0 && (
              <p className="text-sm text-muted-foreground">All clients are healthy!</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add New Lead/Client</h2>
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input 
                type="text" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Client Name"
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input 
                type="email" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="client@example.com"
                value={newClientEmail}
                onChange={e => setNewClientEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={createClient.isPending} className="flex items-center gap-2">
              <Plus size={16} /> Add Lead
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div>Loading pipeline...</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => (
              <div key={stage} className="flex-1 min-w-[300px] bg-muted/30 p-4 rounded-lg border">
                <h3 className="font-semibold mb-4 flex items-center justify-between">
                  {stage}
                  <span className="bg-muted text-muted-foreground text-xs py-1 px-2 rounded-full">
                    {clients.filter((c: any) => c.status === stage).length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {clients.filter((c: any) => c.status === stage).map((client: any) => (
                    <div key={client.id} className="bg-card p-4 rounded-md border shadow-sm group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{client.name}</div>
                        <button 
                          onClick={() => deleteClient.mutate(client.id)}
                          className="text-muted-foreground hover:text-destructive text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                      {client.email && <div className="text-sm text-muted-foreground mb-3">{client.email}</div>}
                      
                      <div className="mt-3">
                        <select 
                          className="w-full text-sm border-input rounded-md bg-background px-2 py-1 border focus-visible:outline-none focus-visible:ring-1"
                          value={client.status}
                          onChange={(e) => updateClientStatus.mutate({ id: client.id, status: e.target.value })}
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      
                      <ClientHealth clientId={client.id} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  )
}

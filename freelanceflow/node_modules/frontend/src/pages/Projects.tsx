import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus, X } from 'lucide-react'

export default function Projects() {
  const queryClient = useQueryClient()
  
  const [clientId, setClientId] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('Not started')

  // Quick Client creation state
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [clientCreateError, setClientCreateError] = useState('')

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchApi('/clients')
  })

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/projects')
  })

  const createClientMutation = useMutation({
    mutationFn: (newClient: { name: string; email?: string }) => fetchApi('/clients', {
      method: 'POST',
      body: JSON.stringify(newClient)
    }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setClientId(created.id)
      setNewClientName('')
      setNewClientEmail('')
      setShowAddClient(false)
      setClientCreateError('')
    },
    onError: (err: any) => {
      setClientCreateError(err.message || 'Failed to create client')
    }
  })

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName.trim()) return
    createClientMutation.mutate({ name: newClientName.trim(), email: newClientEmail.trim() || undefined })
  }

  const createProject = useMutation({
    mutationFn: (newProject: any) => fetchApi('/projects', {
      method: 'POST',
      body: JSON.stringify(newProject)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setName('')
      setClientId('')
    }
  })

  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => fetchApi(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  const deleteProject = useMutation({
    mutationFn: (id: string) => fetchApi(`/projects/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !clientId) return
    createProject.mutate({ name, clientId, status })
  }

  return (
    <div>
      <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Project</h2>
          <Button
            type="button"
            onClick={() => setShowAddClient(!showAddClient)}
            className="text-xs flex items-center gap-1.5 h-8 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {showAddClient ? <X size={14} /> : <UserPlus size={14} />}
            {showAddClient ? 'Cancel New Client' : '+ New Client'}
          </Button>
        </div>

        {/* Inline Quick Add Client Box */}
        {showAddClient && (
          <div className="p-3 border border-primary/20 bg-primary/5 rounded-md text-sm space-y-2 animate-in fade-in">
            <p className="font-semibold text-primary text-xs">Quick Add Client</p>
            {clientCreateError && (
              <p className="text-xs text-destructive">{clientCreateError}</p>
            )}
            <div className="flex gap-2 flex-wrap items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-muted-foreground block mb-1">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                  required
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-muted-foreground block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="contact@acme.com"
                  value={newClientEmail}
                  onChange={e => setNewClientEmail(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm"
                />
              </div>
              <Button
                type="button"
                onClick={handleQuickAddClient}
                disabled={createClientMutation.isPending || !newClientName.trim()}
                className="h-8 text-xs px-3"
              >
                {createClientMutation.isPending ? 'Saving...' : 'Save & Select Client'}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-2 min-w-[200px]">
            <label className="text-sm font-medium">Project Name</label>
            <input 
              type="text" 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 min-w-[200px]">
            <label className="text-sm font-medium">Client</label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              required
            >
              <option value="">
                {clients.length === 0 ? 'No clients yet (click + New Client)' : 'Select a client...'}
              </option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 min-w-[150px]">
            <label className="text-sm font-medium">Status</label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="Not started">Not started</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <Button type="submit" disabled={createProject.isPending || !clientId} className="flex items-center gap-2">
            <Plus size={16} /> Add Project
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div>Loading projects...</div>
      ) : (
        <div className="space-y-4">
          {projects.map((project: any) => (
            <div key={project.id} className="p-4 border rounded-lg bg-card shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <p className="text-sm text-muted-foreground">Client: {project.client?.name || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
                  value={project.status}
                  onChange={(e) => updateProject.mutate({ id: project.id, data: { status: e.target.value } })}
                >
                  <option value="Not started">Not started</option>
                  <option value="In progress">In progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button 
                  onClick={() => deleteProject.mutate(project.id)}
                  className="text-sm text-muted-foreground hover:text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
              No projects found. Create one above!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

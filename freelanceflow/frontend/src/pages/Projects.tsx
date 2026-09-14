import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function Projects() {
  const queryClient = useQueryClient()
  
  const [clientId, setClientId] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('Not started')

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchApi('/clients')
  })

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/projects')
  })

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
      <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Project</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-2 min-w-[200px]">
            <label className="text-sm font-medium">Project Name</label>
            <input 
              type="text" 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
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
              <option value="">Select a client...</option>
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
          <Button type="submit" disabled={createProject.isPending} className="flex items-center gap-2">
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
                <p className="text-sm text-muted-foreground">Client: {project.client.name}</p>
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

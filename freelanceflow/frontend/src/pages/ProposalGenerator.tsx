import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function ProposalGenerator() {
  const [clientId, setClientId] = useState('')
  const [projectScope, setProjectScope] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchApi('/clients')
  })

  const generateProposal = useMutation({
    mutationFn: (data: any) => fetchApi('/ai/proposal', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !projectScope || !budget || !timeline) return
    generateProposal.mutate({ clientId, projectScope, budget, timeline })
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="p-6 border rounded-lg bg-card shadow-sm h-fit">
        <h2 className="text-xl font-semibold mb-6">AI Proposal Generator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Client</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Scope / Requirements</label>
            <textarea 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              placeholder="Describe what needs to be done..."
              value={projectScope}
              onChange={e => setProjectScope(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Budget ($)</label>
            <input 
              type="number"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              placeholder="e.g. 5000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expected Timeline</label>
            <input 
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              placeholder="e.g. 4 weeks, starting next Monday"
              value={timeline}
              onChange={e => setTimeline(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={generateProposal.isPending} className="w-full">
            {generateProposal.isPending ? 'Generating...' : 'Generate Proposal'}
          </Button>
        </form>
      </div>

      <div className="p-6 border rounded-lg bg-card shadow-sm h-full min-h-[500px] flex flex-col">
        <h2 className="text-xl font-semibold mb-6">Generated Proposal</h2>
        {generateProposal.isError && (
          <div className="bg-destructive/15 text-destructive p-4 rounded text-sm mb-4">
            {generateProposal.error.message || 'Failed to generate proposal. Make sure GROQ_API_KEY is set.'}
          </div>
        )}
        <div className="flex-1 border rounded bg-muted/30 p-4 font-mono text-sm whitespace-pre-wrap overflow-y-auto">
          {generateProposal.data?.proposal || 'Fill out the form and generate to see the proposal drafted by AI.'}
        </div>
      </div>
    </div>
  )
}

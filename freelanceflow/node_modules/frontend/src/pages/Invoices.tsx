import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus, X } from 'lucide-react'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  section: { margin: 10, padding: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1 solid #EEE', paddingBottom: 5, marginBottom: 5 },
  bold: { fontWeight: 'bold' }
})

const InvoicePDF = ({ invoice }: { invoice: any }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.header}>INVOICE #{invoice.id.substring(0, 8)}</Text>
      
      <View style={{ marginBottom: 20 }}>
        <Text>Client: {invoice.project?.client?.name}</Text>
        <Text>Project: {invoice.project?.name}</Text>
        <Text>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
        <Text>Status: {invoice.status}</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.bold}>Description</Text>
          <Text style={pdfStyles.bold}>Amount</Text>
        </View>
        
        {invoice.lineItems?.map((item: any, i: number) => (
          <View key={i} style={pdfStyles.row}>
            <Text>{item.description} (x{item.quantity})</Text>
            <Text>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View style={[pdfStyles.row, { marginTop: 20, borderTop: '2 solid #000', paddingTop: 10 }]}>
          <Text style={pdfStyles.bold}>Total</Text>
          <Text style={pdfStyles.bold}>${invoice.amount.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
)

export default function Invoices() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  
  const [selectedClientId, setSelectedClientId] = useState(searchParams.get('clientId') || '')
  const [projectId, setProjectId] = useState('')
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    const urlClientId = searchParams.get('clientId')
    if (urlClientId) {
      setSelectedClientId(urlClientId)
    }
  }, [searchParams])
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Quick Client creation state
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchApi('/clients')
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/projects')
  })

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => fetchApi('/invoices')
  })

  // Filter projects belonging to selected client
  const clientProjects = selectedClientId 
    ? projects.filter((p: any) => p.clientId === selectedClientId || p.client?.id === selectedClientId)
    : projects

  const createClientMutation = useMutation({
    mutationFn: (newClient: { name: string; email?: string }) => fetchApi('/clients', {
      method: 'POST',
      body: JSON.stringify(newClient)
    }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      setSelectedClientId(created.id)
      setProjectId('')
      setNewClientName('')
      setNewClientEmail('')
      setShowAddClient(false)
    }
  })

  const createInvoice = useMutation({
    mutationFn: (newInvoice: any) => fetchApi('/invoices', {
      method: 'POST',
      body: JSON.stringify(newInvoice)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setSelectedClientId('')
      setProjectId('')
      setProjectName('')
      setAmount('')
      setDueDate('')
      setErrorMsg('')
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create invoice')
    }
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => fetchApi(`/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })

  const deleteInvoice = useMutation({
    mutationFn: (id: string) => fetchApi(`/invoices/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })

  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName.trim()) return
    createClientMutation.mutate({ name: newClientName.trim(), email: newClientEmail.trim() || undefined })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!selectedClientId && !projectId) {
      setErrorMsg('Please select a client or project.')
      return
    }

    if (!amount || !dueDate) {
      setErrorMsg('Please specify both amount and due date.')
      return
    }

    createInvoice.mutate({ 
      clientId: selectedClientId || undefined,
      projectId: projectId || undefined,
      projectName: projectName.trim() || undefined,
      amount: parseFloat(amount), 
      dueDate,
      lineItems: [
        { description: 'Professional Services', quantity: 1, price: parseFloat(amount) }
      ]
    })
  }

  return (
    <div>
      <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create New Invoice</h2>
          <Button
            type="button"
            onClick={() => setShowAddClient(!showAddClient)}
            className="text-xs flex items-center gap-1.5 h-8 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {showAddClient ? <X size={14} /> : <UserPlus size={14} />}
            {showAddClient ? 'Cancel New Client' : '+ New Client'}
          </Button>
        </div>

        {/* Quick Add Client Box */}
        {showAddClient && (
          <div className="p-3 border border-primary/20 bg-primary/5 rounded-md text-sm space-y-2 animate-in fade-in">
            <p className="font-semibold text-primary text-xs">Quick Add Client</p>
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

        {errorMsg && (
          <div className="p-2 text-xs rounded bg-destructive/15 text-destructive">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
          {/* Client Selector */}
          <div className="space-y-2 min-w-[180px]">
            <label className="text-sm font-medium">Client</label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={selectedClientId}
              onChange={e => {
                setSelectedClientId(e.target.value)
                setProjectId('')
              }}
            >
              <option value="">
                {clients.length === 0 ? 'No clients yet' : 'Select a client...'}
              </option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Project Selector or Project Name */}
          <div className="space-y-2 min-w-[200px]">
            <label className="text-sm font-medium">
              Project {selectedClientId && clientProjects.length === 0 ? '(Auto-Created)' : ''}
            </label>
            {selectedClientId && clientProjects.length === 0 ? (
              <input
                type="text"
                placeholder="e.g. General Consulting"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              />
            ) : (
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
              >
                <option value="">
                  {clientProjects.length === 0 
                    ? (selectedClientId ? 'Will create project automatically' : 'Select a project...') 
                    : 'Choose existing project...'}
                </option>
                {clientProjects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {!selectedClientId && p.client ? `(${p.client.name})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2 min-w-[130px]">
            <label className="text-sm font-medium">Amount ($)</label>
            <input 
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 min-w-[140px]">
            <label className="text-sm font-medium">Due Date</label>
            <input 
              type="date"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={createInvoice.isPending || (!selectedClientId && !projectId)} 
            className="flex items-center gap-2"
          >
            <Plus size={16} /> {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div>Loading invoices...</div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice: any) => (
            <div key={invoice.id} className="p-4 border rounded-lg bg-card shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  ${invoice.amount.toFixed(2)}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoice.status}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Client: <strong className="text-foreground">{invoice.project?.client?.name || 'N/A'}</strong> | Project: {invoice.project?.name || 'N/A'} | Due: {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
                  value={invoice.status}
                  onChange={(e) => updateStatus.mutate({ id: invoice.id, status: e.target.value })}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
                
                <PDFDownloadLink 
                  document={<InvoicePDF invoice={invoice} />} 
                  fileName={`invoice-${invoice.id.substring(0, 8)}.pdf`}
                  className="text-sm text-primary hover:underline"
                >
                  {({ loading }) => (loading ? 'Loading...' : 'Download PDF')}
                </PDFDownloadLink>

                <button 
                  onClick={() => deleteInvoice.mutate(invoice.id)}
                  className="text-sm text-muted-foreground hover:text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
              No invoices found. Create one above!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

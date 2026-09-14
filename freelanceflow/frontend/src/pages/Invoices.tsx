import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
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
  
  const [projectId, setProjectId] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/projects')
  })

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => fetchApi('/invoices')
  })

  const createInvoice = useMutation({
    mutationFn: (newInvoice: any) => fetchApi('/invoices', {
      method: 'POST',
      body: JSON.stringify(newInvoice)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setProjectId('')
      setAmount('')
      setDueDate('')
    }
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => fetchApi(`/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })

  const deleteInvoice = useMutation({
    mutationFn: (id: string) => fetchApi(`/invoices/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !amount || !dueDate) return
    createInvoice.mutate({ 
      projectId, 
      amount: parseFloat(amount), 
      dueDate,
      lineItems: [
        { description: 'Consulting Services', quantity: 1, price: parseFloat(amount) }
      ]
    })
  }

  return (
    <div>
      <div className="mb-8 p-4 border rounded-lg bg-card shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create New Invoice</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-2 min-w-[200px]">
            <label className="text-sm font-medium">Project</label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              required
            >
              <option value="">Select a project...</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.client.name})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 min-w-[150px]">
            <label className="text-sm font-medium">Amount ($)</label>
            <input 
              type="number"
              min="0"
              step="0.01"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 min-w-[150px]">
            <label className="text-sm font-medium">Due Date</label>
            <input 
              type="date"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={createInvoice.isPending} className="flex items-center gap-2">
            <Plus size={16} /> Create Invoice
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div>Loading invoices...</div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice: any) => (
            <div key={invoice.id} className="p-4 border rounded-lg bg-card shadow-sm flex items-center justify-between">
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
                  Project: {invoice.project.name} | Due: {new Date(invoice.dueDate).toLocaleDateString()}
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
                  fileName={`invoice-${invoice.id}.pdf`}
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

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Eye, 
  ArrowRight,
  Mail,
  User,
  DollarSign,
  Clock,
  RotateCcw
} from 'lucide-react'

export default function ProposalGenerator() {
  const [searchParams] = useSearchParams()
  const queryClientId = searchParams.get('clientId')
  const queryClient = useQueryClient()

  const [clientId, setClientId] = useState(queryClientId || '')
  const [projectScope, setProjectScope] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [tone, setTone] = useState('Professional & Persuasive')

  // Proposal & Email Dispatch State
  const [proposalContent, setProposalContent] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [copied, setCopied] = useState(false)
  const [sendSuccess, setSendSuccess] = useState<{ emailId?: string; recipient: string } | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchApi('/clients')
  })

  // Auto-select client if URL query parameter was provided
  useEffect(() => {
    if (queryClientId && clients.length > 0) {
      setClientId(queryClientId)
    }
  }, [queryClientId, clients])

  // Update recipient email whenever selected client changes
  useEffect(() => {
    if (clientId && clients.length > 0) {
      const selected = clients.find((c: any) => c.id === clientId)
      if (selected?.email) {
        setRecipientEmail(selected.email)
      }
    }
  }, [clientId, clients])

  const selectedClient = clients.find((c: any) => c.id === clientId)

  // AI Generation Mutation
  const generateProposal = useMutation({
    mutationFn: (data: any) => fetchApi('/ai/proposal', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: (data: any) => {
      const text = data?.proposal || ''
      setProposalContent(text)
      const cleanScope = projectScope.trim()
      const scopeTitle = cleanScope.length > 35 ? `${cleanScope.slice(0, 35)}...` : cleanScope
      const subject = `Business Proposal: ${scopeTitle || 'Project Engagement'} - FreelanceFlow`
      setEmailSubject(subject)
      setSendSuccess(null)
      setSendError(null)
    }
  })

  // Send Email via Resend Mutation
  const sendEmailMutation = useMutation({
    mutationFn: (payload: any) => fetchApi('/ai/send-proposal', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    onSuccess: (data: any) => {
      setSendSuccess({ emailId: data.emailId, recipient: recipientEmail })
      setSendError(null)
      // Refresh clients and analytics so pipeline reflects 'Proposal Sent'
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (err: any) => {
      setSendError(err?.message || 'Failed to dispatch email via Resend. Check your configuration.')
    }
  })

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !projectScope || !budget || !timeline) return
    generateProposal.mutate({
      clientId,
      projectScope: `${projectScope} (Preferred Tone: ${tone})`,
      budget,
      timeline
    })
  }

  const handleSendEmail = () => {
    if (!clientId || !recipientEmail || !emailSubject || !proposalContent) {
      setSendError('Please ensure client, recipient email, subject, and proposal content are filled out.')
      return
    }
    setSendError(null)
    sendEmailMutation.mutate({
      clientId,
      recipientEmail,
      subject: emailSubject,
      proposalContent
    })
  }

  const handleCopy = () => {
    if (!proposalContent) return
    navigator.clipboard.writeText(proposalContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} /> AI Proposal Generator & Email Dispatch
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate custom AI proposals tailored to your client, edit the email copy, and dispatch directly via Resend.
          </p>
        </div>
        {selectedClient && (
          <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-lg border text-sm">
            <User size={16} className="text-muted-foreground" />
            <span className="font-medium">{selectedClient.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {selectedClient.status}
            </span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generator Form (5 Cols) */}
        <div className="lg:col-span-5 p-6 border rounded-xl bg-card shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Proposal Parameters
            </h2>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
              Powered by Groq
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Client Select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <User size={14} className="text-muted-foreground" /> Select Client
              </label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                required
                disabled={clientsLoading}
              >
                <option value="">Choose a client from pipeline...</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.email ? `(${c.email})` : ''} - [{c.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Scope / Requirements */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Project Scope & Deliverables</label>
              <textarea 
                className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Redesign corporate marketing website with high conversion landing page, mobile responsiveness, and CRM integration..."
                value={projectScope}
                onChange={e => setProjectScope(e.target.value)}
                required
              />
            </div>

            {/* Budget & Timeline in 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <DollarSign size={14} className="text-muted-foreground" /> Budget ($)
                </label>
                <input 
                  type="number"
                  min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="5000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Clock size={14} className="text-muted-foreground" /> Timeline
                </label>
                <input 
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="4 weeks"
                  value={timeline}
                  onChange={e => setTimeline(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Proposal Tone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Drafting Tone</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={tone}
                onChange={e => setTone(e.target.value)}
              >
                <option value="Professional & Persuasive">Professional & Persuasive (Recommended)</option>
                <option value="Direct & Concise">Direct & Concise</option>
                <option value="Friendly & Consultative">Friendly & Consultative</option>
                <option value="Technical & Detailed">Technical & Detailed</option>
              </select>
            </div>

            <Button 
              type="submit" 
              disabled={generateProposal.isPending || !clientId} 
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5"
            >
              {generateProposal.isPending ? (
                <>
                  <RotateCcw className="animate-spin" size={16} /> Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Proposal Draft
                </>
              )}
            </Button>
          </form>

          {generateProposal.isError && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{generateProposal.error?.message || 'Failed to generate proposal. Please ensure Groq is active.'}</span>
            </div>
          )}

          {/* Quick instructions box */}
          <div className="p-3.5 rounded-lg bg-muted/40 border text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">💡 How email dispatch works:</p>
            <p>1. Generate an AI draft or paste your proposal directly.</p>
            <p>2. Edit and personalize the text and subject line.</p>
            <p>3. Dispatch directly via Resend. The client status will automatically move to <strong>Proposal Sent</strong>.</p>
          </div>
        </div>

        {/* Right Column: Editable Proposal & Resend Dispatch Interface (7 Cols) */}
        <div className="lg:col-span-7 p-6 border rounded-xl bg-card shadow-sm flex flex-col space-y-5 min-h-[620px]">
          {/* Top Dispatch Controls */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Mail size={18} className="text-primary" /> Proposal Email Workspace
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review and customize the email before dispatching through Resend.
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex items-center bg-muted p-1 rounded-lg border text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'edit'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Edit3 size={13} /> Edit Draft
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium ${
                  activeTab === 'preview'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye size={13} /> Email Preview
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {sendSuccess && (
            <div className="p-4 bg-green-500/15 border border-green-500/30 text-green-700 dark:text-green-300 rounded-lg space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 shrink-0" />
                <span>Proposal Email Delivered via Resend!</span>
              </div>
              <p className="text-xs text-green-600/90 dark:text-green-300/90">
                Dispatched to <strong>{sendSuccess.recipient}</strong>
                {sendSuccess.emailId && ` (Resend ID: ${sendSuccess.emailId})`}. 
                The client's pipeline status has been automatically updated to <strong>Proposal Sent</strong>.
              </p>
              <div className="pt-1 flex gap-3 text-xs">
                <Link 
                  to="/dashboard" 
                  className="font-semibold text-green-700 dark:text-green-300 hover:underline flex items-center gap-1"
                >
                  View in Pipeline <ArrowRight size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSendSuccess(null)}
                  className="text-muted-foreground hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {sendError && (
            <div className="p-3.5 bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-lg flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Failed to send proposal email</p>
                  <p className="text-xs mt-0.5 opacity-90">{sendError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSendError(null)}
                className="text-xs font-semibold hover:underline shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          {/* Email Headers Form */}
          <div className="p-4 rounded-lg bg-muted/30 border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  From (Resend Sender)
                </label>
                <div className="text-xs font-mono bg-background border px-3 py-2 rounded text-muted-foreground">
                  FreelanceFlow &lt;onboarding@resend.dev&gt;
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>To (Recipient Email)</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Editable</span>
                </label>
                <input 
                  type="email"
                  className="flex h-8 w-full rounded border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="client@company.com"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Email Subject</span>
                <span className="text-[10px] text-muted-foreground font-normal">Editable</span>
              </label>
              <input 
                type="text"
                className="flex h-8 w-full rounded border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Business Proposal: Website Redesign - FreelanceFlow"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Content Area: Edit vs Preview */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            {activeTab === 'edit' ? (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Proposal Body (Markdown / Plain Text)</span>
                  <div className="flex items-center gap-3">
                    <span>{proposalContent.length} characters</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!proposalContent}
                      className="hover:text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <textarea
                  className="flex-1 w-full min-h-[280px] p-4 rounded-lg border border-input bg-background font-mono text-sm leading-relaxed shadow-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  placeholder="Your generated proposal will appear here. You can also directly type, polish, and edit whatever you want to mail to the client..."
                  value={proposalContent}
                  onChange={e => setProposalContent(e.target.value)}
                />
              </div>
            ) : (
              /* Live Email Preview */
              <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Email Window Header */}
                <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white">FreelanceFlow Proposal</h3>
                    <p className="text-xs text-slate-400">
                      Prepared exclusively for {selectedClient?.name || 'Valued Client'}
                    </p>
                  </div>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Live Preview
                  </span>
                </div>

                {/* Email Body */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
                  <div className="border-b pb-3 mb-2">
                    <p className="text-xs text-muted-foreground">
                      <strong>Subject:</strong> {emailSubject || 'Proposal'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>To:</strong> {recipientEmail || 'client@example.com'}
                    </p>
                  </div>

                  {proposalContent ? (
                    proposalContent.split('\n\n').map((para, i) => (
                      <p key={i} className="leading-relaxed whitespace-pre-wrap">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">
                      No proposal content drafted yet. Use the generator on the left or type directly in the "Edit Draft" tab.
                    </p>
                  )}
                </div>

                {/* Email Footer */}
                <div className="bg-slate-100 dark:bg-slate-950 p-3 text-center border-t text-xs text-slate-500">
                  Sent via <strong>FreelanceFlow CRM</strong> • Delivered by Resend
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-2 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              {proposalContent ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                  <Check size={14} /> Proposal ready for mailing
                </span>
              ) : (
                <span>Generate or write proposal to send</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handleCopy}
                disabled={!proposalContent}
                className="border bg-transparent text-foreground hover:bg-muted text-xs h-9 px-3 flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Text'}
              </Button>

              <Button
                type="button"
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending || !proposalContent || !recipientEmail || !clientId}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 px-5 flex items-center gap-2 w-full sm:w-auto justify-center shadow"
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <RotateCcw className="animate-spin" size={14} /> Sending via Resend...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Proposal via Resend
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

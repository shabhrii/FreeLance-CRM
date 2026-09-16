import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  Send,
  FileText,
  TrendingUp,
  Star,
  Layers,
  ChevronDown,
  Cpu,
  Lock
} from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuthStore()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What is FreelanceFlow CRM?',
      a: 'FreelanceFlow CRM is an all-in-one client relationship management platform tailored for independent freelancers, consultants, and boutique agencies. It combines visual Kanban pipeline tracking, Groq AI proposal drafting, direct Resend email dispatch, and automated client health monitoring.'
    },
    {
      q: 'How does the AI Proposal Generator work?',
      a: 'Powered by Groq AI, you simply input the client, project scope, budget, and timeline. Within seconds, FreelanceFlow crafts a structured, persuasive business proposal ready to be edited, previewed, and mailed directly via Resend.'
    },
    {
      q: 'Can I send proposals directly from the app?',
      a: 'Yes! FreelanceFlow integrates natively with the Resend transactional email API. You can review the email preview, polish the text, and dispatch it to your client with one click. The client status will automatically update to "Proposal Sent" in your pipeline.'
    },
    {
      q: 'How does AI Client Health scoring work?',
      a: 'The system continuously analyzes contact frequency, project deadlines, and unpaid invoices to assign a 0–100 health score with plain-English summaries so you never lose a client to poor follow-up.'
    },
    {
      q: 'Can this be deployed to AWS Cloud?',
      a: 'Absolutely. FreelanceFlow is fully containerized with multi-stage Dockerfiles for both frontend and backend, with complete support for AWS ECS Fargate, App Runner, S3 + CloudFront, and RDS PostgreSQL.'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-heading font-extrabold tracking-tight">
              Freelance<span className="text-primary">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#ai-engine" className="hover:text-foreground transition-colors">AI Engine</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold flex items-center gap-2 px-4 shadow-sm">
                  Go to Dashboard <ArrowRight size={15} />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors">
                  Log in
                </Link>
                <Link to="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold flex items-center gap-1.5 px-4 shadow-sm">
                    Get Started Free <ArrowRight size={14} />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto px-4 max-w-5xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Next-Gen Freelancer Operating System • Groq AI + Resend Integrated</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
            Close Deals Faster. <br />
            <span className="gradient-text">Manage Clients with AI Precision.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-normal leading-relaxed">
            The all-in-one CRM crafted for independent contractors and agencies. Track client pipelines, draft persuasive proposals in seconds with Groq AI, dispatch directly via Resend, and stay ahead with real-time client health scores.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                Start Free Trial <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-8 border border-input bg-card/80 hover:bg-muted text-foreground font-semibold text-base flex items-center justify-center gap-2">
                ⚡ Interactive Live Demo
              </Button>
            </Link>
          </div>

          {/* Trust Metrics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-green-500" />
              <span>1-Click demo sandbox</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-green-500" />
              <span>AWS Cloud ready</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" />
                ))}
              </div>
              <span className="font-medium text-foreground ml-1">4.9/5</span>
              <span>(850+ reviews)</span>
            </div>
          </div>

          {/* Interactive UI Mockup Showcase */}
          <div className="pt-12">
            <div className="relative mx-auto rounded-2xl border bg-card/80 shadow-2xl shadow-primary/10 overflow-hidden p-2 backdrop-blur-xl">
              <div className="rounded-xl border bg-card overflow-hidden">
                {/* Browser bar */}
                <div className="h-10 bg-muted/50 border-b flex items-center px-4 justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="font-mono bg-background border px-3 py-1 rounded text-[11px] text-muted-foreground flex items-center gap-2">
                    <Lock size={10} className="text-green-600" /> app.freelanceflow.com/dashboard
                  </div>
                  <div className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Live System Preview
                  </div>
                </div>

                {/* Dashboard Mock Content */}
                <div className="p-6 text-left space-y-6 bg-background/50">
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border bg-card shadow-sm">
                      <p className="text-xs text-muted-foreground font-medium">Total Invoiced</p>
                      <p className="text-2xl font-bold font-heading text-foreground mt-1">$38,500</p>
                      <p className="text-[11px] text-green-600 font-medium mt-1">↑ +24% this month</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card shadow-sm">
                      <p className="text-xs text-muted-foreground font-medium">Outstanding Balance</p>
                      <p className="text-2xl font-bold font-heading text-yellow-600 mt-1">$4,200</p>
                      <p className="text-[11px] text-muted-foreground mt-1">2 invoices due soon</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card shadow-sm">
                      <p className="text-xs text-muted-foreground font-medium">Proposal Win Rate</p>
                      <p className="text-2xl font-bold font-heading text-primary mt-1">82%</p>
                      <p className="text-[11px] text-primary font-medium mt-1">Powered by Groq AI</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card shadow-sm">
                      <p className="text-xs text-muted-foreground font-medium">Client Health Index</p>
                      <p className="text-2xl font-bold font-heading text-green-600 mt-1">98/100</p>
                      <p className="text-[11px] text-green-600 font-medium mt-1">All accounts healthy</p>
                    </div>
                  </div>

                  {/* Pipeline Preview */}
                  <div className="border rounded-xl p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Layers size={16} className="text-primary" /> Active Pipeline Kanban
                      </h4>
                      <span className="text-xs text-muted-foreground">Real-time sync</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-card rounded-lg border shadow-xs">
                        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-2">
                          <span>New Lead (2)</span>
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="p-2.5 rounded bg-muted/40 text-xs space-y-1">
                          <p className="font-semibold text-foreground">Apex Fintech</p>
                          <p className="text-muted-foreground text-[11px]">Brand & Web App</p>
                        </div>
                      </div>

                      <div className="p-3 bg-card rounded-lg border shadow-xs">
                        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-2">
                          <span>Proposal Sent (3)</span>
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                        </div>
                        <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-purple-900 dark:text-purple-200">Stark Media</p>
                            <span className="text-[9px] bg-purple-500 text-white px-1 rounded">Mailed</span>
                          </div>
                          <p className="text-purple-700 dark:text-purple-300 text-[11px]">$7,500 • Resend Verified</p>
                        </div>
                      </div>

                      <div className="p-3 bg-card rounded-lg border shadow-xs">
                        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-2">
                          <span>Active Projects (2)</span>
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                        </div>
                        <div className="p-2.5 rounded bg-muted/40 text-xs space-y-1">
                          <p className="font-semibold text-foreground">Nova Labs</p>
                          <p className="text-muted-foreground text-[11px]">Milestone 2 of 3</p>
                        </div>
                      </div>

                      <div className="p-3 bg-card rounded-lg border shadow-xs">
                        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-2">
                          <span>Won & Paid (5)</span>
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                        </div>
                        <div className="p-2.5 rounded bg-green-500/10 border border-green-500/20 text-xs space-y-1">
                          <p className="font-semibold text-green-900 dark:text-green-200">HyperScale AI</p>
                          <p className="text-green-700 dark:text-green-300 text-[11px]">$12,000 Paid via PDF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-heading text-primary">$14M+</p>
              <p className="text-sm text-muted-foreground mt-1">Invoices Managed</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-heading text-purple-600">99.8%</p>
              <p className="text-sm text-muted-foreground mt-1">Resend Email Delivery</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">&lt; 10s</p>
              <p className="text-sm text-muted-foreground mt-1">AI Proposal Generation</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-heading text-green-600">8.5 hrs</p>
              <p className="text-sm text-muted-foreground mt-1">Saved Per Week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 max-w-6xl space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest">Built for Independence</h2>
            <p className="text-3xl sm:text-4xl font-bold font-heading">
              Everything you need to run your freelance business like an enterprise
            </p>
            <p className="text-muted-foreground text-sm">
              Replace messy spreadsheets, disconnected proposal templates, and invoice headaches with one unified workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold">Visual Kanban Pipeline</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Organize every prospective lead from "New" and "Contacted" to "Proposal Sent" and "Won". Never let a profitable client slip through the cracks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold">Groq AI Proposal Generator</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Feed your project requirements, estimated budget, and timeline to our Groq AI engine. Receive a comprehensive, persuasive proposal in seconds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
                <Send size={20} />
              </div>
              <h3 className="text-lg font-bold">Resend Email Dispatch</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Review and edit your proposal, check live email previews, and send directly using Resend's world-class transactional email infrastructure.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                <Cpu size={20} />
              </div>
              <h3 className="text-lg font-bold">Client Health Intelligence</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatic 0–100 health scoring flags overdue invoices and stale communication with plain-English summaries so you can act before relationships sour.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-bold">PDF Invoicing & Direct Billing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create polished, professional invoices directly linked to clients or projects. Dynamic client-side PDF rendering ensures instant downloads.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-lg font-bold">Financial Cash Flow Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Interactive charts and real-time revenue breakdowns give you clarity over realized income, pending invoices, and future project pipelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Workflow Journey */}
      <section id="how-it-works" className="py-20 bg-muted/20 border-y">
        <div className="container mx-auto px-4 max-w-5xl space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest">Workflow</h2>
            <p className="text-3xl sm:text-4xl font-bold font-heading">
              From Lead to Paid in 4 Simple Steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="p-5 rounded-xl bg-card border shadow-xs space-y-3 relative">
              <span className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-base">Capture Lead</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add prospects into your pipeline with 1 click. Track contact details and expectations effortlessly.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border shadow-xs space-y-3 relative">
              <span className="h-7 w-7 rounded-full bg-purple-500/10 text-purple-600 font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-base">Generate with AI</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click "Proposal", input scope & budget, and let Groq AI produce an authoritative business proposal.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border shadow-xs space-y-3 relative">
              <span className="h-7 w-7 rounded-full bg-pink-500/10 text-pink-600 font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-base">Dispatch via Resend</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review live email preview, polish the copy, and mail it directly. The lead automatically moves to "Proposal Sent".
              </p>
            </div>

            <div className="p-5 rounded-xl bg-card border shadow-xs space-y-3 relative">
              <span className="h-7 w-7 rounded-full bg-green-500/10 text-green-600 font-bold text-xs flex items-center justify-center">4</span>
              <h4 className="font-bold text-base">Invoice & Track</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Issue clean PDF invoices, track payments, monitor client health, and watch your monthly revenue climb.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine Deep Dive */}
      <section id="ai-engine" className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-3xl border bg-gradient-to-br from-card via-card to-primary/5 p-8 md:p-14 shadow-xl space-y-8">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold">
                  <Sparkles size={14} /> Groq LPU™ Ultra-Fast Inference
                </div>
                <h3 className="text-3xl font-extrabold font-heading">
                  AI that feels like a full-time business partner
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Traditional proposal generation takes hours of staring at a blank document. With FreelanceFlow's Groq integration, tailored proposals that highlight return on investment and structured scope are created in sub-second inference times.
                </p>
                <div className="space-y-2 pt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-600" />
                    <span>Customizable tones (Professional, Concise, Consultative)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-600" />
                    <span>Calculates client health & churn risks automatically</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-purple-600" />
                    <span>Continuous context from activity logs & invoice statuses</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border bg-background/80 shadow-md font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-muted-foreground border-b pb-2">
                  <span>Groq AI Prompt Stream</span>
                  <span className="text-green-500">Latency: 420ms</span>
                </div>
                <p className="text-muted-foreground">
                  Drafting scope for: <span className="text-foreground font-semibold">Nexus Robotics</span>
                </p>
                <div className="p-3 bg-muted/40 rounded border space-y-1.5 text-foreground leading-relaxed">
                  <p className="font-semibold text-primary">Executive Summary:</p>
                  <p className="text-muted-foreground text-[11px]">
                    We propose a 4-week sprint to deliver a high-converting customer portal with responsive UI and authenticated backend APIs...
                  </p>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px] text-muted-foreground">
                  <span>Investment: $6,500</span>
                  <span className="text-purple-600 font-semibold">Ready to Send via Resend →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="py-20 bg-muted/20 border-y">
        <div className="container mx-auto px-4 max-w-5xl space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest">Transparent Pricing</h2>
            <p className="text-3xl sm:text-4xl font-bold font-heading">
              Simple plans for ambitious independents
            </p>
            <p className="text-muted-foreground text-sm">
              Start free today and upgrade as your client roster expands.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="p-8 rounded-2xl border bg-card shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Starter</h3>
                <p className="text-xs text-muted-foreground">Ideal for solo freelancers getting started.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-heading">$0</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-4 border-t">
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> Up to 10 Active Clients</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> Kanban Lead Pipeline</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> 15 AI Proposals / month</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> Resend Email Delivery</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> PDF Invoices</li>
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full border bg-transparent text-foreground hover:bg-muted font-medium text-xs h-10">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Pro - Featured */}
            <div className="p-8 rounded-2xl border-2 border-primary bg-card shadow-lg shadow-primary/10 space-y-6 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Professional</h3>
                <p className="text-xs text-muted-foreground">For active consultants scaling their practice.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-heading">$19</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-4 border-t">
                  <li className="flex items-center gap-2"><Check size={14} className="text-primary font-bold" /> Unlimited Active Clients</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-primary font-bold" /> Unlimited AI Proposals (Groq)</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-primary font-bold" /> Live AI Client Health Scoring</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-primary font-bold" /> Custom Resend Domain Support</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-primary font-bold" /> Automated Overdue Alerts</li>
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 shadow">
                  Start 14-Day Trial
                </Button>
              </Link>
            </div>

            {/* Agency */}
            <div className="p-8 rounded-2xl border bg-card shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Agency</h3>
                <p className="text-xs text-muted-foreground">For boutique studios and contractor teams.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-heading">$49</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-4 border-t">
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> Multi-Seat Team Access</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> AWS Dedicated Cloud Deploy</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> Custom Invoicing Branding</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-green-600" /> 24/7 Priority Support</li>
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full border bg-transparent text-foreground hover:bg-muted font-medium text-xs h-10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4 max-w-3xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-widest">Got Questions?</h2>
            <p className="text-3xl font-bold font-heading">Frequently Asked Questions</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border rounded-xl bg-card overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-sm flex items-center justify-between hover:bg-muted/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-muted/50 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-3xl gradient-brand p-10 md:p-16 text-center text-white space-y-6 shadow-2xl shadow-primary/20">
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading">
              Ready to Upgrade Your Freelance Practice?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Join hundreds of independent experts closing higher-value contracts with automated proposals, real-time client health scores, and painless invoicing.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-md">
                  Create Your Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button className="h-12 px-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm">
                  ⚡ Open Demo Sandbox
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card text-xs text-muted-foreground mt-auto">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg gradient-brand flex items-center justify-center text-white">
              <Sparkles size={12} />
            </div>
            <span className="font-heading font-bold text-sm text-foreground">FreelanceFlow CRM</span>
            <span className="text-[11px] ml-2 px-2 py-0.5 rounded bg-muted">AWS Cloud Ready</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>

          <p>© {new Date().getFullYear()} FreelanceFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

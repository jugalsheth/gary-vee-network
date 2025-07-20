'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ContactCard } from '@/components/ContactCard'
import { AIChatLoading } from '@/components/AIChatLoading'
import type { Contact } from '@/lib/types'
import { Sparkles, Send, Bot, User, Lightbulb, TrendingUp } from 'lucide-react'

const SUGGESTIONS = [
  'Show me all tier 1 contacts',
  'Find contacts with kids',
  'Who is married in tier 2?',
  'Show me contacts in New York',
]

const INSIGHT_PROMPTS = [
  'Analyze my network and suggest follow-ups',
  'What are my strongest business relationships?',
  'Suggest content ideas based on my contacts',
  'Who should I reach out to this week?',
]

type Message = {
  role: 'user' | 'ai',
  content: string,
  contacts?: Contact[]
}

export function AIChat({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [messages, setMessages] = React.useState<Message[]>([{
    role: 'ai',
    content: 'Hi! I\'m your AI relationship assistant. Ask me anything about your contacts or get proactive insights about your network.',
  }])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSend = async (query?: string) => {
    const userInput = (query ?? input).trim()
    if (!userInput) return
    setMessages(msgs => [...msgs, { role: 'user', content: userInput }])
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userInput, contacts }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.details || data.error || 'AI chat failed')
      }
      setMessages(msgs => [...msgs, { role: 'ai', content: data.response, contacts: data.matchedContacts }])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI chat failed'
      setMessages(msgs => [...msgs, { role: 'ai', content: `Sorry, there was an error: ${errorMessage}` }])
      setError(errorMessage)
      console.error('AI Chat error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetInsights = async () => {
    const insightsQuery = 'Analyze my contact network and provide proactive insights. Include: 1) Follow-up suggestions for contacts I haven\'t reached out to recently, 2) Relationship strength analysis, 3) Content/outreach recommendations based on interests, 4) Network balance and growth opportunities, 5) Specific action items for this week.'
    await handleSend(insightsQuery)
  }

  const handleProactiveAnalysis = async () => {
    const analysisQuery = 'Be proactive and suggest: 1) Who I should follow up with this week, 2) Content ideas based on my contacts\' interests, 3) Potential partnership opportunities, 4) Network gaps I should fill, 5) Specific outreach strategies for different tiers.'
    await handleSend(analysisQuery)
  }

  return (
    <>
      <button
        className="fixed bottom-8 left-8 z-20 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-full shadow-lg dark:shadow-gray-900/50 p-4 flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        aria-label="Open AI Chat"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline font-semibold">AI Chat</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100 transition-colors duration-300"><Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />AI Contact Chat</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm shadow transition-colors duration-300 ${msg.role === 'user' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-gray-900 dark:text-gray-100' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'} flex items-center gap-2`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-yellow-500 dark:text-yellow-400" /> : <Bot className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                  <span>{msg.content}</span>
                </div>
                {msg.contacts && msg.contacts.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 w-full max-w-xs">
                    {msg.contacts.map(c => (
                      <ContactCard key={c.id} contact={c} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* AI Loading State */}
            {loading && <AIChatLoading />}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-2 transition-colors duration-300">
            {/* Proactive Insights Buttons */}
            <div className="flex gap-2 mb-2">
              <Button 
                onClick={handleGetInsights} 
                disabled={loading} 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-700 transition-colors duration-300"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                Get Insights
              </Button>
              <Button 
                onClick={handleProactiveAnalysis} 
                disabled={loading} 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 border-green-200 dark:border-green-700 transition-colors duration-300"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Proactive
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                placeholder="Ask about your contacts…"
                className="flex-1"
                disabled={loading}
                aria-label="Chat input"
              />
              <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white transition-colors duration-300"><Send className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {SUGGESTIONS.map(s => (
                <Button key={s} variant="secondary" size="sm" className="text-xs transition-colors duration-300" onClick={() => handleSend(s)} disabled={loading}>{s}</Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 
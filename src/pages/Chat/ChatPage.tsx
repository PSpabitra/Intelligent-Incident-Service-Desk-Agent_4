import React, { useState, useEffect } from 'react'
import { MessageSquare, Send, Bot, User, Sparkles, Paperclip, Mic, Search, ChevronDown, Loader2 } from 'lucide-react'
import api from '../../services/api'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am the SLA Wisdom assistant. Select an incident from the list to start a contextual chat.',
      time: 'Just now'
    }
  ])
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/incidents/', {
          params: { page: 1, per_page: 20 }
        })
        setIncidents(res.data.incidents)
      } catch (err) {
        console.error('Failed to load incidents:', err)
      } finally {
        setLoading(false)
      }
    }
    loadIncidents()
  }, [])

  const handleSend = () => {
    if (!input.trim() || !selectedIncident) return
    setMessages([
      ...messages,
      { role: 'user', content: input, time: 'Just now' }
    ])
    setInput('')

    // Mock response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Analyzing incident **${selectedIncident.title}**... Based on the execution logs, the failure occurred at step 3 due to a timeout. I recommend checking the database connection pool.`,
          time: 'Just now'
        }
      ])
    }, 1000)
  }

  const handleSelectIncident = (inc: any) => {
    setSelectedIncident(inc)
    setMessages([
      {
        role: 'assistant',
        content: `I am now focused on **${inc.title}** (${inc.pipeline}). How can I help you resolve this incident?`,
        time: 'Just now'
      }
    ])
  }

  return (
    <div className="h-full flex overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8fafc' }}>
      {/* Left Sidebar - Incident List */}
      <div className="w-[380px] bg-white border-r border-slate-100 flex flex-col">
        {/* Filters */}
        <div className="p-6 border-bottom border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Incidents</h2>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {['OPEN', 'ALL', 'CLOSED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none border border-slate-200 focus:border-blue-500/50 transition-all bg-slate-50"
            />
          </div>

          <div className="text-[10px] font-black text-slate-400 uppercase mt-4 tracking-widest">
            {incidents.length} Incidents
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Stream...</p>
            </div>
          ) : (
            incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => {
                  if (selectedIncident?.id === inc.id) {
                    setSelectedIncident(null);
                    setMessages([{ role: 'assistant', content: 'Hello! I am the SLA Wisdom assistant. Select an incident from the list to start a contextual chat.', time: 'Just now' }]);
                  } else {
                    handleSelectIncident(inc);
                  }
                }}
                className={`p-5 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative ${selectedIncident?.id === inc.id ? 'bg-blue-50/50' : ''
                  }`}
              >
                {selectedIncident?.id === inc.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                )}
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-xs font-bold text-slate-500">{inc.source}</p>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{inc.title}</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-50 text-red-500 border border-red-100">
                    {inc.risk_level}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Risk Score: {inc.risk_score}</p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-slate-200/50 text-slate-600">
                    {inc.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Area - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Top Section - Incident Details */}
        <div className="bg-white p-6 border-b border-slate-100">
          {selectedIncident ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-extrabold text-slate-900">{selectedIncident.title}</h2>
                {/* <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-xs font-black uppercase text-slate-700">Model: SLA-Expert-v1</span>
                </div> */}
              </div>
              <p className="text-sm text-slate-600 font-medium mb-4">
                {selectedIncident.summary || 'Summary not available for this incident. AI is analyzing the logs to generate a summary.'}
              </p>
              {/* <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                  Status: {selectedIncident.status}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-red-50 text-red-500">
                  Risk Level: {selectedIncident.risk_level}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-blue-50 text-blue-600">
                  Risk Score: {selectedIncident.risk_score}
                </span>
              </div> */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-slate-400">
              <Sparkles size={24} className="mb-2 text-slate-300" />
              <h2 className="text-sm font-bold">Select an incident to start</h2>
              <p className="text-xs font-medium">AI will answer based on incident context</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}

              <div className={`max-w-[70%] p-5 rounded-3xl text-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                }`}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                <div className={`text-[10px] mt-2 font-medium ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                  {msg.time}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className={`relative flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-4 shadow-sm focus-within:border-blue-500/50 transition-all ${!selectedIncident ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
            <input
              type="text"
              placeholder={selectedIncident ? "Ask anything about this incident..." : "Please select an incident first"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 text-sm font-medium outline-none text-slate-700 bg-transparent"
              disabled={!selectedIncident}
            />

            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600" disabled={!selectedIncident}>
                <Paperclip size={18} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600" disabled={!selectedIncident}>
                <Mic size={18} />
              </button>
              <button
                onClick={handleSend}
                disabled={!selectedIncident}
                className={`p-2.5 rounded-xl transition-colors shadow-lg ${selectedIncident ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' : 'bg-slate-300 text-slate-500'
                  }`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
            AI can make mistakes. Verify critical information.
          </p>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { AlertTriangle, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import api from '../../services/api'
import type { Incident, RiskLevel } from '../../types'
import RiskBadge from '../../components/ui/RiskBadge'

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e'
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage] = useState(20)
  const [loading, setLoading] = useState(false)
  const [riskFilter, setRiskFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [selected, setSelected] = useState<Incident | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/incidents/', {
        params: {
          page, per_page: perPage,
          risk_level: riskFilter,
          source: sourceFilter,
        }
      })
      setIncidents(res.data.incidents)
      setTotal(res.data.total)
    } catch (e) {
      console.error('API fetch failed.', e)
      setIncidents([])
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [page, riskFilter, sourceFilter])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen" style={{ background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 sticky top-0 bg-[#f8fafc] z-10 -mx-8 px-8 py-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Incident <span style={{ color: '#3b82f6' }}>Intelligence</span>
          </h1>
          <div className="flex items-center gap-4" style={{ color: '#94a3b8' }}>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <AlertTriangle size={14} style={{ color: '#ef4444' }} />
              Active Monitoring
            </div>
            <span className="text-xs">{total} total records detected</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Search incidents..."
              className="pl-12 pr-6 py-3 rounded-2xl text-sm outline-none transition-all border border-slate-200 bg-slate-100/40 w-64 focus:w-80"
              style={{ color: 'var(--text-primary)' }} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-6 rounded-[32px] border mb-8 flex flex-wrap gap-4 items-center"
        style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderColor: 'rgba(0, 0, 0, 0.05)' }}>
        <div className="flex items-center gap-2 mr-4">
          <Filter size={18} style={{ color: '#3b82f6' }} />
          <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Segment</span>
        </div>

        <select
          value={riskFilter}
          onChange={(e) => { setRiskFilter(e.target.value); setPage(1) }}
          className="px-6 py-3 rounded-2xl text-sm font-bold outline-none cursor-pointer border border-slate-200"
          style={{ background: '#020623', color: '#f8fafc' }}>
          <option value="">All Risk Levels</option>
          <option value="HIGH">HIGH RISK</option>
          <option value="MEDIUM">MEDIUM RISK</option>
          <option value="LOW">LOW RISK</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
          className="px-6 py-3 rounded-2xl text-sm font-bold outline-none cursor-pointer border border-slate-200"
          style={{ background: '#020623', color: '#f8fafc' }}>
          <option value="">All Sources</option>
          <option value="jira">Jira Sync</option>
          <option value="servicenow">ServiceNow Sync</option>
        </select>

        {(riskFilter || sourceFilter) && (
          <button onClick={() => { setRiskFilter(''); setSourceFilter(''); setPage(1) }}
            className="text-xs font-black uppercase px-4 py-2 rounded-xl transition-all hover:bg-red-500/10"
            style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Table View */}
        <div className="xl:col-span-3 transition-all duration-500">
          <div className="rounded-[40px] border shadow-2xl overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(40px)', borderColor: 'rgba(0, 0, 0, 0.05)' }}>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>Refreshing Stream...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ background: 'rgba(241, 245, 249, 0.5)' }}>
                      {['Title', 'Status', 'Source', 'Risk Level', 'Risk Score', 'Priority', 'Created At'].map(h => (
                        <th key={h} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                    {incidents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-24 text-center text-slate-500 font-medium">
                          No active incidents match current segment filters.
                        </td>
                      </tr>
                    ) : incidents.map((inc) => (
                      <tr
                        key={inc.id}
                        onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
                        className="cursor-pointer transition-all duration-300 hover:bg-slate-50"
                        style={{
                          background: selected?.id === inc.id ? 'rgba(59,130,246,0.08)' : undefined
                        }}>
                        <td className="px-4 py-4 text-sm font-bold text-slate-900 truncate max-w-[200px]">{inc.title}</td>
                        <td className="px-4 py-4 text-xs font-bold text-slate-600 capitalize">{inc.status}</td>
                        <td className="px-4 py-4 text-[10px] font-bold uppercase text-slate-600">{inc.source}</td>
                        <td className="px-4 py-4">
                          <RiskBadge level={inc.risk_level} size="sm" />
                        </td>
                        <td className="px-4 py-4 text-lg font-black" style={{ 
                          color: inc.risk_score && inc.risk_score >= 70 ? '#ef4444' : inc.risk_score && inc.risk_score >= 40 ? '#f59e0b' : '#22c55e' 
                        }}>
                          {inc.risk_score?.toFixed(0)}%
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-black uppercase px-3 py-1.5 rounded-xl"
                            style={{ 
                              background: `${PRIORITY_COLOR[inc.priority] || '#94a3b8'}15`,
                              color: PRIORITY_COLOR[inc.priority] || '#94a3b8',
                              border: `1px solid ${PRIORITY_COLOR[inc.priority] || '#94a3b8'}30`
                            }}>
                            {inc.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-slate-700">
                          {inc.created_at ? new Date(inc.created_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop */}
        {selected && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
        )}

        {/* Detail Drawer */}
        <div className={`fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-500 overflow-y-auto ${selected ? 'translate-x-0' : 'translate-x-full'}`}>
          {selected && (
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <AlertTriangle size={20} />
                  </span>
                  <span className="font-mono text-lg font-black text-slate-900">{selected.ticket_id}</span>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <span className="text-slate-500 text-sm">✕</span>
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">{selected.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{selected.description}</p>
              </div>

              {/* Grid (8 items) */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Assignee</p>
                  <p className="text-sm font-bold text-slate-900">{selected.assignee}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Reporter</p>
                  <p className="text-sm font-bold text-slate-900">{selected.reporter || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Status</p>
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-slate-200/50 text-slate-600 inline-block w-fit mt-1">
                    {selected.status}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Priority</p>
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg inline-block w-fit mt-1"
                    style={{ 
                      background: `${PRIORITY_COLOR[selected.priority] || '#94a3b8'}15`,
                      color: PRIORITY_COLOR[selected.priority] || '#94a3b8',
                      border: `1px solid ${PRIORITY_COLOR[selected.priority] || '#94a3b8'}30`
                    }}>
                    {selected.priority}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Risk Score</p>
                  <p className="text-lg font-black" style={{ 
                    color: selected.risk_score && selected.risk_score >= 70 ? '#ef4444' : selected.risk_score && selected.risk_score >= 40 ? '#f59e0b' : '#22c55e' 
                  }}>
                    {selected.risk_score?.toFixed(0)}%
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Breach Prob.</p>
                  <p className="text-lg font-black text-red-400">{selected.breach_probability ? `${Number(selected.breach_probability).toFixed(1)}%` : 'N/A'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Created At</p>
                  <p className="text-xs font-bold text-slate-700">{selected.created_at ? new Date(selected.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">SLA Deadline</p>
                  <p className="text-xs font-bold text-red-400">{selected.sla_due_at ? new Date(selected.sla_due_at).toLocaleString() : 'N/A'}</p>
                </div>
              </div>

              {/* Reasons & Actions */}
              <div className="space-y-8 mb-8">
                {selected.reasons && selected.reasons.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-4 rounded-full bg-red-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-red-500">Risk Vectors</p>
                    </div>
                    <ul className="space-y-3">
                      {selected.reasons.map((r, i) => (
                        <li key={i} className="p-4 rounded-2xl text-xs font-bold bg-red-500/5 border border-red-500/10 text-slate-700">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.recommended_actions && selected.recommended_actions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-4 rounded-full bg-green-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-green-500">Resolution Plan</p>
                    </div>
                    <ul className="space-y-3">
                      {selected.recommended_actions.map((a, i) => (
                        <li key={i} className="p-4 rounded-2xl text-xs font-bold bg-green-500/5 border border-green-500/10 text-slate-700">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                <button className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-900/20">
                  Execute Mitigation Suite
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

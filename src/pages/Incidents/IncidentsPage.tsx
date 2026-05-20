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
  const [perPage] = useState(5)
  const [loading, setLoading] = useState(false)
  const [riskFilter, setRiskFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Incident | null>(null)
  const [refreshCountdown, setRefreshCountdown] = useState(30)

  const reasons: string[] = selected ? (typeof selected.reasons === 'string' ? JSON.parse(selected.reasons) : (selected.reasons || [])) : [];
  const actions: string[] = selected ? (typeof selected.recommended_actions === 'string' ? JSON.parse(selected.recommended_actions) : (selected.recommended_actions || [])) : [];

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/incidents/', {
        params: {
          page: page,
          per_page: perPage,
          sort_by: 'created_at',
          sort_order: sortOrder,
        },
      })
      setIncidents(res.data.incidents)
      setTotal(res.data.total || res.data.incidents.length)
    } catch (e) {
      console.error('API fetch failed.', e)
      setIncidents([])
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => { 
    load()
    setRefreshCountdown(30)
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      // Create a silent load that doesn't trigger the loading spinner state
      const silentLoad = async () => {
        try {
          const res = await api.get('/api/incidents/', {
            params: {
              page: page,
              per_page: perPage,
              sort_by: 'created_at',
              sort_order: sortOrder,
            },
          });
          setIncidents(res.data.incidents)
          setTotal(res.data.total || res.data.incidents.length)
          setRefreshCountdown(30) // Reset countdown on successful refresh
        } catch (e) {
          console.error('Silent API fetch failed.', e)
        }
      }
      silentLoad()
    }, 30000) // 30 seconds

    // Countdown timer
    const countdownIntervalId = setInterval(() => {
      setRefreshCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    
    return () => {
      clearInterval(intervalId)
      clearInterval(countdownIntervalId)
    }
  }, [page, perPage, sortOrder]);

  const filteredIncidents = incidents.filter(inc => {
    const matchesRisk = !riskFilter || inc.risk_level === riskFilter;
    const matchesSource = !sourceFilter || inc.source === sourceFilter;
    return matchesRisk && matchesSource;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(total / perPage);
  const paginatedIncidents = filteredIncidents;

  return (
    <div className="p-8 max-w-[1600px] mx-auto" style={{ background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 sticky top-0 bg-[#f8fafc] z-10 -mx-8 px-8 py-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Incident <span style={{ color: '#3b82f6' }}>Intelligence</span>
          </h1>
          <div className="flex items-center gap-4" style={{ color: '#94a3b8' }}>
            <span className="text-xs">{filteredIncidents.length} total records detected</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
            style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
            <Loader2 size={12} className="animate-spin" />
            Refreshing in {refreshCountdown}s
          </div>
          {/* <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Search incidents..."
              className="pl-12 pr-6 py-3 rounded-2xl text-sm outline-none transition-all border border-slate-200 bg-slate-100/40 w-64 focus:w-80"
              style={{ color: 'var(--text-primary)' }} />
          </div> */}
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
          <div className="rounded-[40px] border overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(40px)', borderColor: 'rgba(0, 0, 0, 0.05)' }}>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>Refreshing Stream...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ background: 'rgba(241, 245, 249, 0.5)' }}>
                      {['Title', 'Status', 'Source', 'Risk Level', 'Risk Score', 'Priority'].map(h => (
                        <th key={h} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>{h}</th>
                      ))}
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors"
                        style={{ color: '#64748b' }}
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        <div className="flex items-center gap-1">
                          Created At
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
                    {paginatedIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-24 text-center text-slate-500 font-medium">
                          No active incidents match current segment filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedIncidents.map((inc) => (
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
                          color: inc.ai_risk_score && inc.ai_risk_score >= 70 ? '#ef4444' : inc.ai_risk_score && inc.ai_risk_score >= 40 ? '#f59e0b' : '#22c55e'
                        }}>
                          {inc.ai_risk_score?.toFixed(0)}%
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
                    )))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white mt-4 rounded-xl shadow-sm">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${page === 1 || loading ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                Prev
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {page} of {Math.max(1, Math.ceil(total / 5))}
              </span>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={page * 5 >= total || loading}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${page * 5 >= total || loading ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                Next
              </button>
            </div>
              </>
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
                  <span className="font-mono text-lg font-black text-slate-900">{selected.title}</span>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <span className="text-slate-500 text-sm">✕</span>
                </button>
              </div>

              {/* Summary */}
              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase">Summary</p>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{(selected as any).summary || selected.title}</h3>
              </div>

              {/* Solution */}
              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase">Solution</p>
                <p className="text-sm text-slate-700 leading-relaxed">{(selected as any).solution || selected.description}</p>
              </div>

              {/* Grid for Risk Score and Resolution Time */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[12px] font-black text-slate-500 uppercase mb-1">Risk Score</p>
                  <p className="text-lg font-black" style={{
                    color: (selected as any).ai_risk_score && (selected as any).ai_risk_score >= 70 ? '#ef4444' : (selected as any).ai_risk_score && (selected as any).ai_risk_score >= 40 ? '#f59e0b' : '#22c55e'
                  }}>
                    {(selected as any).ai_risk_score ? `${Number((selected as any).ai_risk_score).toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[12px] font-black text-slate-500 uppercase mb-1">Est. Resolution Time</p>
                  <p className="text-[15px] font-bold text-slate-900">{(selected as any).estimated_resolution_time || 'N/A'}</p>
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="mb-8 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Score Breakdown</p>
                
                {/* Impact Score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Impact Score</span>
                    <span className="text-xs font-black" style={{ color: '#14d134ff' }}>{(selected as any).impact_score?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${(selected as any).impact_score || 0}%` }} />
                  </div>
                </div>

                {/* Urgency Score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Urgency Score</span>
                    <span className="text-xs font-black" style={{ color: '#f97316' }}>{(selected as any).urgency_score?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{ width: `${(selected as any).urgency_score || 0}%` }} />
                  </div>
                </div>

                {/* Complexity Score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Complexity Score</span>
                    <span className="text-xs font-black" style={{ color: '#8b5cf6' }}>{(selected as any).complexity_score?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${(selected as any).complexity_score || 0}%` }} />
                  </div>
                </div>

                {/* SLA Breach Score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">SLA Breach Score</span>
                    <span className="text-xs font-black" style={{ color: '#f43f5e' }}>{(selected as any).sla_breach_score?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${(selected as any).sla_breach_score|| 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {/* <div>
                <button className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-900/20">
                  Execute Mitigation Suite
                </button>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

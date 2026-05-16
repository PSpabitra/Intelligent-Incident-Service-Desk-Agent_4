import React, { useEffect, useState } from 'react'
import { AlertTriangle, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { incidentApi } from '../../services/api/endpoints'
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
      const res = await incidentApi.list({
        page, per_page: perPage,
        risk_level: riskFilter,
        source: sourceFilter,
      })
      setIncidents(res.data.incidents)
      setTotal(res.data.total)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [page, riskFilter, sourceFilter])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Incidents</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{total} total incidents</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-40">
          <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Filters:</span>
        </div>

        <select
          value={riskFilter}
          onChange={(e) => { setRiskFilter(e.target.value); setPage(1) }}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">All Risk Levels</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">All Sources</option>
          <option value="jira">Jira</option>
          <option value="servicenow">ServiceNow</option>
        </select>

        {(riskFilter || sourceFilter) && (
          <button onClick={() => { setRiskFilter(''); setSourceFilter(''); setPage(1) }}
            className="text-xs px-2 py-1 rounded-lg"
            style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={28} className="animate-spin" style={{ color: '#3b82f6' }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  {['Ticket ID', 'Title', 'Source', 'Priority', 'Status', 'Assignee', 'Risk Score', 'Risk Level', 'Breach %'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      No incidents found. Connect a data source to start syncing.
                    </td>
                  </tr>
                ) : incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
                    className="cursor-pointer hover:bg-white/3 transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: selected?.id === inc.id ? 'rgba(59,130,246,0.06)' : undefined
                    }}>
                    <td className="py-2.5 px-4 font-mono text-xs" style={{ color: '#60a5fa' }}>{inc.ticket_id}</td>
                    <td className="py-2.5 px-4 max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>{inc.title || '—'}</td>
                    <td className="py-2.5 px-4 capitalize" style={{ color: 'var(--text-secondary)' }}>{inc.source}</td>
                    <td className="py-2.5 px-4 capitalize font-medium" style={{ color: PRIORITY_COLOR[inc.priority] || '#94a3b8' }}>{inc.priority}</td>
                    <td className="py-2.5 px-4 capitalize" style={{ color: 'var(--text-secondary)' }}>{inc.status}</td>
                    <td className="py-2.5 px-4 truncate max-w-28" style={{ color: 'var(--text-secondary)' }}>{inc.assignee || '—'}</td>
                    <td className="py-2.5 px-4 font-mono font-bold" style={{ color: inc.risk_score && inc.risk_score >= 70 ? '#f87171' : inc.risk_score && inc.risk_score >= 40 ? '#fbbf24' : '#4ade80' }}>
                      {inc.risk_score?.toFixed(1) ?? '—'}
                    </td>
                    <td className="py-2.5 px-4"><RiskBadge level={inc.risk_level} size="sm" /></td>
                    <td className="py-2.5 px-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{inc.breach_probability ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="mt-4 card" style={{ border: '1px solid rgba(59,130,246,0.25)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold" style={{ color: '#60a5fa' }}>{selected.ticket_id}</span>
              <RiskBadge level={selected.risk_level} />
            </div>
            <button onClick={() => setSelected(null)} className="text-xs" style={{ color: 'var(--text-secondary)' }}>✕ Close</button>
          </div>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{selected.title}</h3>

          {selected.reasons && selected.reasons.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>⚠ Risk Reasons</p>
              <ul className="space-y-1">
                {selected.reasons.map((r, i) => (
                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#f87171' }}>•</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selected.recommended_actions && selected.recommended_actions.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#4ade80' }}>✓ Recommended Actions</p>
              <ul className="space-y-1">
                {selected.recommended_actions.map((a, i) => (
                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#4ade80' }}>→</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

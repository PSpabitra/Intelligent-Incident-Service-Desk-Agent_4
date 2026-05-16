import React, { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Activity, TrendingUp, RefreshCw, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { incidentApi } from '../../services/api/endpoints'
import type { DashboardStats, Incident } from '../../types'
import RiskBadge from '../../components/ui/RiskBadge'
import StatCard from '../../components/ui/StatCard'

const PIE_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' }
const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [bySource, setBySource] = useState<any[]>([])
  const [byPriority, setByPriority] = useState<any[]>([])
  const [topRisk, setTopRisk] = useState<Partial<Incident>[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const load = async () => {
    setLoading(true)
    try {
      const res = await incidentApi.dashboard()
      setStats(res.data.stats)
      setBySource(res.data.by_source)
      setByPriority(res.data.by_priority)
      setTopRisk(res.data.top_risk_incidents)
      setLastRefresh(new Date())
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const pieData = stats ? [
    { name: 'HIGH',   value: stats.high_risk   || 0 },
    { name: 'MEDIUM', value: stats.medium_risk  || 0 },
    { name: 'LOW',    value: stats.low_risk     || 0 },
  ] : []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Live Risk Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin" style={{ color: '#3b82f6' }} />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Open"    value={stats?.total_incidents ?? 0} icon={Activity}      color="#3b82f6" />
            <StatCard label="High Risk"     value={stats?.high_risk ?? 0}       icon={AlertTriangle}  color="#ef4444" sub="Requires immediate action" />
            <StatCard label="Medium Risk"   value={stats?.medium_risk ?? 0}     icon={TrendingUp}     color="#f59e0b" />
            <StatCard label="Avg Risk Score" value={stats?.avg_risk_score ? stats.avg_risk_score.toFixed(1) : '0'} icon={CheckCircle} color="#22c55e" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Risk distribution pie */}
            <div className="card">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false} fontSize={11}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* By source */}
            <div className="card">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>By Source</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={bySource} barSize={32}>
                  <XAxis dataKey="source" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* By priority */}
            <div className="card">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>By Priority</h3>
              <div className="space-y-3">
                {byPriority.map((p) => {
                  const color = PRIORITY_COLOR[p.priority] || '#94a3b8'
                  const total = byPriority.reduce((s: number, x: any) => s + x.count, 0)
                  const pct = total > 0 ? Math.round((p.count / total) * 100) : 0
                  return (
                    <div key={p.priority}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize font-medium" style={{ color: 'var(--text-primary)' }}>{p.priority}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{p.count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Top Risk Incidents */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔴 Top 5 High Risk Incidents
            </h3>
            {topRisk.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                No high-risk incidents detected. System is healthy.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Ticket ID', 'Title', 'Source', 'Priority', 'Risk Score', 'Risk Level', 'Breach Prob.'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topRisk.map((inc) => (
                      <tr key={inc.ticket_id} className="hover:bg-white/3 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="py-2.5 px-3 font-mono text-xs" style={{ color: '#60a5fa' }}>{inc.ticket_id}</td>
                        <td className="py-2.5 px-3 max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>{inc.title}</td>
                        <td className="py-2.5 px-3 capitalize" style={{ color: 'var(--text-secondary)' }}>{inc.source}</td>
                        <td className="py-2.5 px-3 capitalize" style={{ color: PRIORITY_COLOR[inc.priority || ''] || '#94a3b8' }}>{inc.priority}</td>
                        <td className="py-2.5 px-3 font-mono font-bold" style={{ color: '#f87171' }}>{inc.risk_score?.toFixed(1)}</td>
                        <td className="py-2.5 px-3"><RiskBadge level={inc.risk_level} size="sm" /></td>
                        <td className="py-2.5 px-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{inc.breach_probability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

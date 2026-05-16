import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plug, CheckCircle2, XCircle, Loader2, RefreshCw, Trash2, ExternalLink } from 'lucide-react'
import { connectorApi } from '../../services/api/endpoints'
import type { Connector } from '../../types'

interface ConnectForm {
  connector_type: 'jira' | 'servicenow'
  base_url: string
  username: string
  api_token: string
}

const CONNECTOR_META = {
  jira: {
    label: 'Jira',
    color: '#0052cc',
    placeholder_url: 'https://yourcompany.atlassian.net',
    placeholder_user: 'your@email.com',
    token_label: 'API Token',
    docs: 'https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/',
  },
  servicenow: {
    label: 'ServiceNow',
    color: '#62d84e',
    placeholder_url: 'https://yourinstance.service-now.com',
    placeholder_user: 'admin',
    token_label: 'Password',
    docs: 'https://docs.servicenow.com/bundle/washingtondc-api-reference/page/integrate/inbound-rest/concept/c_RESTAPI.html',
  },
}

function ConnectorCard({ connector, onDisconnect }: {
  connector: Connector
  onDisconnect: (id: number) => void
}) {
  const meta = CONNECTOR_META[connector.connector_type]
  return (
    <div className="card flex items-start justify-between gap-4"
      style={{ border: connector.is_active ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)' }}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}>
          <Plug size={18} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{meta.label}</span>
            {connector.is_active ? (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                <CheckCircle2 size={11} /> Active
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.25)' }}>
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>{connector.base_url}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            User: {connector.username}
          </p>
          {connector.last_synced_at && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Last sync: {new Date(connector.last_synced_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDisconnect(connector.id)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
        style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
        <Trash2 size={13} /> Disconnect
      </button>
    </div>
  )
}

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState<'jira' | 'servicenow'>('jira')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ConnectForm>({
    defaultValues: { connector_type: 'jira' }
  })

  const loadConnectors = async () => {
    setLoading(true)
    try {
      const res = await connectorApi.list()
      setConnectors(res.data.connectors)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadConnectors() }, [])

  const onSubmit = async (data: ConnectForm) => {
    setConnecting(true)
    setError('')
    setSuccess('')
    try {
      await connectorApi.connect({ ...data, connector_type: activeTab })
      setSuccess(`${CONNECTOR_META[activeTab].label} connected successfully! Background sync started.`)
      reset()
      loadConnectors()
    } catch (e: any) {
      setError(e.response?.data?.error || 'Connection failed. Check your credentials and URL.')
    }
    setConnecting(false)
  }

  const handleDisconnect = async (id: number) => {
    try {
      await connectorApi.disconnect(id)
      loadConnectors()
    } catch (e) { console.error(e) }
  }

  const meta = CONNECTOR_META[activeTab]
  const alreadyConnected = connectors.find(c => c.connector_type === activeTab && c.is_active)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Connectors</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Connect your ITSM systems. Once connected, sync runs automatically.
          </p>
        </div>
        <button onClick={loadConnectors} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        </button>
      </div>

      {/* Existing connectors */}
      {connectors.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>ACTIVE CONNECTIONS</h2>
          <div className="space-y-3">
            {connectors.map(c => (
              <ConnectorCard key={c.id} connector={c} onDisconnect={handleDisconnect} />
            ))}
          </div>
        </div>
      )}

      {/* Connect form */}
      <div className="card">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>ADD NEW CONNECTION</h2>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: 'var(--bg-primary)' }}>
          {(['jira', 'servicenow'] as const).map(t => (
            <button key={t}
              onClick={() => { setActiveTab(t); setError(''); setSuccess('') }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === t ? 'var(--bg-card)' : 'transparent',
                color: activeTab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: activeTab === t ? '1px solid var(--border)' : '1px solid transparent',
              }}>
              {CONNECTOR_META[t].label}
            </button>
          ))}
        </div>

        {/* Already connected note */}
        {alreadyConnected && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
            style={{ background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle2 size={14} />
            {meta.label} is already connected. Submitting this form will update the credentials.
          </div>
        )}

        {/* Messages */}
        {success && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            ✕ {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {meta.label} URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              placeholder={meta.placeholder_url}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              {...register('base_url', { required: 'URL is required' })}
            />
            {errors.base_url && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.base_url.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'jira' ? 'Email' : 'Username'}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              placeholder={meta.placeholder_user}
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              {...register('username', { required: 'Username is required' })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {meta.token_label}
              </label>
              <a href={meta.docs} target="_blank" rel="noopener noreferrer"
                className="text-xs flex items-center gap-1 hover:underline"
                style={{ color: '#60a5fa' }}>
                How to get token <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono"
              placeholder="••••••••••••••"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              {...register('api_token', { required: `${meta.token_label} is required` })}
            />
          </div>

          <button
            type="submit"
            disabled={connecting}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: connecting ? 'rgba(59,130,246,0.5)' : `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
            }}>
            {connecting ? (
              <><Loader2 size={15} className="animate-spin" /> Validating &amp; Connecting…</>
            ) : (
              <><Plug size={15} /> Connect to {meta.label}</>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-4 pt-4 space-y-1.5" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>After connecting:</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            ✓ Credentials are stored securely in the database
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            ✓ New &amp; updated tickets sync every 60 seconds (configurable)
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            ✓ Risk scoring runs every 2 minutes automatically
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            ✓ You will NOT need to reconnect after backend restart
          </p>
        </div>
      </div>
    </div>
  )
}

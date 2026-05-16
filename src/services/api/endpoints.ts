import api from './client'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// ── Connectors ────────────────────────────────────────────────────────────────
export const connectorApi = {
  list: () => api.get('/connectors/'),
  connect: (data: {
    connector_type: string
    base_url: string
    username: string
    api_token: string
  }) => api.post('/connectors/connect', data),
  disconnect: (id: number) => api.delete(`/connectors/${id}`),
}

// ── Incidents ────────────────────────────────────────────────────────────────
export const incidentApi = {
  list: (params?: {
    page?: number
    per_page?: number
    risk_level?: string
    source?: string
  }) => api.get('/incidents/', { params }),
  get: (id: number) => api.get(`/incidents/${id}`),
  dashboard: () => api.get('/incidents/dashboard'),
}

// ── Scheduler ─────────────────────────────────────────────────────────────────
export const schedulerApi = {
  status: () => api.get('/scheduler/status'),
}

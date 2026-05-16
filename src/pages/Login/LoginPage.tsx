import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ShieldAlert, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '../services/api/endpoints'
import { useAuthStore } from '../store/authStore'

interface FormData { email: string; password: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await authApi.login(data.email, data.password)
      setAuth(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Login failed. Check your credentials.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.12) 0%, transparent 60%), var(--bg-primary)'
      }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
            <ShieldAlert size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>SLA Risk Engine</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Predictive SLA &amp; Service Management
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Sign in</h2>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-primary)',
                  border: errors.email ? '1px solid #f87171' : '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
                placeholder="alice@company.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--bg-primary)',
                    border: errors.password ? '1px solid #f87171' : '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-secondary)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: isSubmitting
                  ? 'rgba(59,130,246,0.5)'
                  : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              }}
            >
              {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-4 text-xs space-y-1" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <p className="font-medium mb-2">Demo credentials:</p>
            <p>Admin: alice@company.com / Admin@123</p>
            <p>Engineer: bob@company.com / Engineer@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

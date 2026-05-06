'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative orbs */}
      <div className="auth-bg-decoration" style={{ width: '400px', height: '400px', background: 'rgba(99,102,241,0.08)', top: '-100px', right: '-100px', position: 'absolute' }} />
      <div className="auth-bg-decoration" style={{ width: '350px', height: '350px', background: 'rgba(139,92,246,0.06)', bottom: '-80px', left: '-80px', position: 'absolute' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }} className="scale-fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            className="logo-float"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%)',
              boxShadow: '0 12px 40px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              marginBottom: '16px',
              fontSize: '2rem',
            }}
          >
            🌤️
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' }} className="gradient-text">
            WeatherBoard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>
            Sign in to your dashboard
          </p>
        </div>

        {/* Card */}
        <div className="glass-card-auth" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: 'block', marginBottom: '8px', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', opacity: 0.6, pointerEvents: 'none', zIndex: 1 }}>✉️</span>
                <input
                  id="login-email"
                  type="email"
                  className="input-glass"
                  style={{ paddingLeft: '40px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" style={{ display: 'block', marginBottom: '8px', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', opacity: 0.6, pointerEvents: 'none', zIndex: 1 }}>🔒</span>
                <input
                  id="login-password"
                  type="password"
                  className="input-glass"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="error-banner">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button id="login-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span className="spinner spinner-sm" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '24px 0 20px' }}>or</div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--accent-purple)', fontWeight: 600, textDecoration: 'none' }}>
              Create one →
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Secure · Real-time weather · Multi-city tracking
        </p>
      </div>
    </div>
  );
}

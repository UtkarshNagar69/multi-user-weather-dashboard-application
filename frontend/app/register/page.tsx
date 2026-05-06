'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const data = await authApi.register(email, password);
      setUser(data.user);
      toast.success('Account created! Welcome to WeatherBoard 🎉');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (password.length < 10) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (/(?=.*[A-Z])(?=.*\d)/.test(password)) return { label: 'Strong', color: '#10b981', width: '100%' };
    return { label: 'Good', color: '#3b82f6', width: '75%' };
  };
  const strength = getStrength();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div className="auth-bg-decoration" style={{ width: '400px', height: '400px', background: 'rgba(139,92,246,0.08)', top: '-120px', left: '-100px', position: 'absolute' }} />
      <div className="auth-bg-decoration" style={{ width: '300px', height: '300px', background: 'rgba(99,102,241,0.06)', bottom: '-60px', right: '-60px', position: 'absolute' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }} className="scale-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="logo-float" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '22px',
            background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%)',
            boxShadow: '0 12px 40px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            marginBottom: '16px', fontSize: '2rem',
          }}>🌤️</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' }} className="gradient-text">WeatherBoard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your free account</p>
        </div>

        <div className="glass-card-auth" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="reg-email" style={{ display: 'block', marginBottom: '8px', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', opacity: 0.4, pointerEvents: 'none', zIndex: 1 }}>✉️</span>
                <input id="reg-email" type="email" className="input-glass" style={{ paddingLeft: '40px' }} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" style={{ display: 'block', marginBottom: '8px', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', opacity: 0.4, pointerEvents: 'none', zIndex: 1 }}>🔒</span>
                <input id="reg-password" type="password" className="input-glass" style={{ paddingLeft: '40px' }} placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '10px', transition: 'all 0.4s ease' }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: strength.color, marginTop: '5px', fontWeight: 500 }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" style={{ display: 'block', marginBottom: '8px', fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', opacity: 0.4, pointerEvents: 'none', zIndex: 1 }}>
                  {confirm.length > 0 && confirm === password ? '✅' : '🔒'}
                </span>
                <input id="reg-confirm" type="password" className="input-glass" style={{
                  paddingLeft: '40px',
                  ...(confirm.length > 0 && confirm === password ? { borderColor: '#10b981' } : confirm.length > 0 ? { borderColor: '#ef4444' } : {}),
                }} placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
              </div>
            </div>

            {error && (
              <div className="error-banner">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button id="register-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span className="spinner spinner-sm" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '24px 0 20px' }}>or</div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Secure · Real-time weather · Multi-city tracking
        </p>
      </div>
    </div>
  );
}

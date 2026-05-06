'use client';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { SmartInsights as InsightsType } from '@/types';

export default function SmartInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ['smart-insights'],
    queryFn: async () => {
      const res = await aiApi.getInsights();
      return res.insights;
    },
    staleTime: 1000 * 60 * 5, // refresh every 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Don't render anything if no insights available
  if (!data && !isLoading) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fade-in-up stagger-2" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03))',
        border: '1px solid rgba(99,102,241,0.12)',
        borderRadius: 'var(--radius-xl)', padding: '20px 24px',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ fontSize: '1rem' }}>🧠</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            AI Insights
          </span>
          <div className="spinner spinner-sm" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366f1', width: '14px', height: '14px' }} />
        </div>
        <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '75%', height: '16px' }} />
      </div>
    );
  }

  if (!data) return null;

  const insights = data as InsightsType;

  return (
    <div className="fade-in-up stagger-2" style={{
      background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03))',
      border: '1px solid rgba(99,102,241,0.12)',
      borderRadius: 'var(--radius-xl)', padding: '20px 24px',
      marginBottom: '28px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.4), transparent)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
        }}>🧠</div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Smart Insights
        </span>
        <span style={{
          fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent-indigo)',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '10px', padding: '2px 8px', letterSpacing: '0.03em',
        }}>
          AI
        </span>
      </div>

      {/* Insight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {insights.bestCity && (
          <InsightCard icon="🏆" label="Best for outdoors" value={insights.bestCity} />
        )}
        {insights.outfit && (
          <InsightCard icon="👔" label="What to wear" value={insights.outfit} />
        )}
        {insights.tip && (
          <InsightCard icon="💡" label="Pro tip" value={insights.tip} />
        )}
      </div>

      {/* Alerts */}
      {insights.alerts && insights.alerts.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {insights.alerts.map((alert, i) => (
            <div key={i} style={{
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              borderRadius: '10px', padding: '8px 14px', fontSize: '0.8rem',
              color: '#fbbf24', display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '12px', padding: '12px 14px',
      transition: 'all 0.25s ease', cursor: 'default',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.85rem' }}>{icon}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
        {value}
      </p>
    </div>
  );
}

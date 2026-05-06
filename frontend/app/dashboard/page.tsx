'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { dashboardApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import CityCard from '@/components/CityCard';
import CityCardSkeleton from '@/components/CityCardSkeleton';
import AIChatPanel from '@/components/AIChatPanel';
import SmartInsights from '@/components/SmartInsights';
import { CityWeatherData } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const { data, isLoading: dataLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
    enabled: !!user,
    refetchInterval: 1000 * 60 * 10,
  });

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const cities: CityWeatherData[] = data?.cities ?? [];
  const favoriteCount = cities.filter((c) => c.isFavorite).length;
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '36px 28px 60px' }}>
        {/* Page Header */}
        <div className="slide-in-left" style={{ marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
            {greeting} 👋
          </p>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>
            My Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {dataLoading
              ? 'Fetching weather data…'
              : cities.length === 0
                ? 'No cities tracked yet'
                : `${cities.length} ${cities.length === 1 ? 'city' : 'cities'} tracked${favoriteCount > 0 ? ` · ${favoriteCount} favourite${favoriteCount > 1 ? 's' : ''}` : ''}`}
          </p>
        </div>

        {/* Search Section */}
        <div
          className="fade-in-up stagger-1"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 28px',
            marginBottom: '36px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ flex: 1, minWidth: '260px' }}>
            <p style={{
              fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '10px',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Add a city to your dashboard
            </p>
            <SearchBar />
          </div>
          <button
            id="refresh-btn"
            onClick={() => refetch()}
            className="btn-secondary"
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.3s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(180deg)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(0deg)')}
            >🔄</span>
            Refresh
          </button>
        </div>

        {/* AI Smart Insights — shown when cities exist */}
        {!dataLoading && cities.length > 0 && <SmartInsights />}

        {/* Error */}
        {isError && (
          <div className="error-banner fade-in-up" style={{ marginBottom: '28px', padding: '16px 20px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Failed to load dashboard</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                {error instanceof Error ? error.message : 'Please try again.'}
              </p>
            </div>
          </div>
        )}

        {/* Skeleton grid */}
        {dataLoading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <CityCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* City grid */}
        {!dataLoading && cities.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {cities.map((city, index) => (
              <CityCard
                key={`${city.cityName}-${city.countryCode}`}
                city={city}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!dataLoading && !isError && cities.length === 0 && (
          <div className="scale-fade-in" style={{
            textAlign: 'center',
            padding: '80px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '96px', height: '96px', borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
              border: '1px solid rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.8rem', marginBottom: '8px',
              boxShadow: '0 0 40px rgba(99,102,241,0.08)',
            }}>
              🌍
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Your dashboard is empty
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Search for a city above to get started. Track real-time weather for any location around the world.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['🇬🇧 London', '🇯🇵 Tokyo', '🇺🇸 New York', '🇦🇺 Sydney', '🇮🇳 Mumbai'].map((city) => (
                <span key={city} style={{
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: '20px',
                  padding: '7px 16px',
                  fontSize: '0.8rem',
                  color: 'var(--accent-purple)',
                  cursor: 'default',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AI Chat Panel — floating */}
      <AIChatPanel />
    </>
  );
}

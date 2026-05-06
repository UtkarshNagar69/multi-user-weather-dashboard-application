'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CityWeatherData } from '@/types';
import WeatherIcon, { getWeatherGradient } from './WeatherIcon';
import { dashboardApi } from '@/lib/api';

interface CityCardProps {
  city: CityWeatherData;
  index?: number;
}

const getWindDirection = (deg: number): string => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

const getTempColor = (temp: number): string => {
  if (temp <= 0) return '#93c5fd';
  if (temp <= 10) return '#7dd3fc';
  if (temp <= 20) return '#a5f3fc';
  if (temp <= 30) return '#fcd34d';
  if (temp <= 40) return '#fb923c';
  return '#f87171';
};

export default function CityCard({ city, index = 0 }: CityCardProps) {
  const qc = useQueryClient();

  const favMutation = useMutation({
    mutationFn: () => dashboardApi.toggleFavorite(city.cityName),
    onSuccess: (data) => {
      toast.success(data.message);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: () => dashboardApi.removeCity(city.cityName),
    onSuccess: () => {
      toast.success(`${city.cityName} removed.`);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const w = city.weather;
  const gradient = w ? getWeatherGradient(w.weatherCode, w.isDay) : '';
  const staggerClass = `stagger-${Math.min(index + 1, 8)}`;

  return (
    <div
      className={`glass-card scale-fade-in ${staggerClass} ${city.isFavorite ? 'favorite' : ''}`}
      style={{ background: gradient || undefined, position: 'relative', padding: '24px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              {city.cityName}
            </h2>
            {city.isFavorite && <span className="badge-favorite">★ Favorite</span>}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {city.countryCode}
          </p>
        </div>

        {/* Action buttons — using SVG icons instead of emoji */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          {/* Favorite toggle */}
          <button
            id={`fav-${city.cityName.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => favMutation.mutate()}
            disabled={favMutation.isPending}
            aria-label={city.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: '36px', height: '36px', borderRadius: '8px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2) rotate(-8deg)';
              e.currentTarget.style.background = city.isFavorite ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0)';
              e.currentTarget.style.background = 'none';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={city.isFavorite ? '#fbbf24' : 'none'} stroke={city.isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.25)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: city.isFavorite ? 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' : 'none', transition: 'all 0.3s ease' }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            id={`del-${city.cityName.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => removeMutation.mutate()}
            disabled={removeMutation.isPending}
            aria-label={`Remove ${city.cityName}`}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: '36px', height: '36px', borderRadius: '8px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.transform = 'scale(1.1)';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.transform = 'scale(1)';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = 'rgba(255,255,255,0.15)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.25s ease' }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weather unavailable */}
      {city.weatherUnavailable || !w ? (
        <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', marginBottom: '12px',
          }}>📡</div>
          <p style={{ fontWeight: 500 }}>Weather data unavailable</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Data will appear when the API responds</p>
        </div>
      ) : (
        <>
          {/* Main weather display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 20px' }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '18px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <WeatherIcon code={w.weatherCode} isDay={w.isDay} size="lg" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{
                  fontSize: '3rem', fontWeight: 800, lineHeight: 1,
                  letterSpacing: '-0.04em',
                  color: getTempColor(w.temperature),
                }}>
                  {Math.round(w.temperature)}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 300, color: 'var(--text-muted)' }}>°C</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>
                {w.condition}
              </div>
            </div>
          </div>

          {/* Stats row — pill chips */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px',
            display: 'flex', gap: '8px', flexWrap: 'wrap',
          }}>
            {w.feelsLike !== undefined && w.feelsLike !== null && (
              <StatChip icon="🌡" label="Feels" value={`${Math.round(w.feelsLike)}°`} />
            )}
            {w.humidity !== undefined && w.humidity !== null && (
              <StatChip icon="💧" label="" value={`${w.humidity}%`} />
            )}
            <StatChip icon="💨" label="" value={`${Math.round(w.windspeed)} km/h ${getWindDirection(w.winddirection)}`} />
          </div>
        </>
      )}
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px', padding: '5px 12px',
      fontSize: '0.78rem', color: 'var(--text-secondary)',
      transition: 'all 0.25s ease', whiteSpace: 'nowrap',
      cursor: 'default',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      <span style={{ fontSize: '0.75rem' }}>{icon}</span>
      {label && <span style={{ color: 'var(--text-dim)' }}>{label}</span>}
      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </span>
  );
}

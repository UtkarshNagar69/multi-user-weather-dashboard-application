'use client';

// Maps WMO weather codes to emoji icons
const getWeatherEmoji = (code: number, isDay: number): string => {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '🌤️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '❄️';
  if (code === 77) return '🌨️';
  if (code <= 82) return '🌩️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
};

const getWeatherGradient = (code: number, isDay: number): string => {
  if (code === 0 && isDay)
    return 'linear-gradient(145deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.04) 60%, transparent 100%)';
  if (code === 0 && !isDay)
    return 'linear-gradient(145deg, rgba(99,102,241,0.1) 0%, rgba(79,70,229,0.04) 60%, transparent 100%)';
  if (code <= 2)
    return 'linear-gradient(145deg, rgba(125,211,252,0.08) 0%, rgba(99,102,241,0.04) 100%)';
  if (code <= 48)
    return 'linear-gradient(145deg, rgba(148,163,184,0.08) 0%, rgba(100,116,139,0.03) 100%)';
  if (code <= 67)
    return 'linear-gradient(145deg, rgba(96,165,250,0.1) 0%, rgba(59,130,246,0.04) 100%)';
  if (code <= 77)
    return 'linear-gradient(145deg, rgba(186,230,253,0.1) 0%, rgba(125,211,252,0.04) 100%)';
  if (code >= 95)
    return 'linear-gradient(145deg, rgba(167,139,250,0.1) 0%, rgba(99,102,241,0.04) 100%)';
  return 'linear-gradient(145deg, rgba(99,102,241,0.06) 0%, transparent 100%)';
};

interface WeatherIconProps {
  code: number;
  isDay: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function WeatherIcon({ code, isDay, size = 'md' }: WeatherIconProps) {
  const emoji = getWeatherEmoji(code, isDay);
  const sizeMap = { sm: '1.6rem', md: '2.4rem', lg: '3.2rem', xl: '4rem' };
  const isNight = !isDay;

  return (
    <span
      className={isDay && code <= 2 ? 'icon-day' : isNight ? 'icon-night' : ''}
      style={{
        fontSize: sizeMap[size],
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s ease',
      }}
      aria-label="Weather icon"
    >
      {emoji}
    </span>
  );
}

export { getWeatherGradient };

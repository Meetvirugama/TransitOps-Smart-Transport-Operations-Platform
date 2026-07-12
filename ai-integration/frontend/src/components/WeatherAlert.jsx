import React, { useState, useEffect, useRef } from 'react';
import api from '../config/api';

// Weather condition codes from Open-Meteo WMO standard
const getWeatherInfo = (code) => {
  if (code === 0) return { label: 'Clear Sky', severity: 'clear', icon: '☀️' };
  if (code <= 3) return { label: 'Partly Cloudy', severity: 'clear', icon: '⛅' };
  if (code <= 48) return { label: 'Foggy Conditions', severity: 'warning', icon: '🌫️' };
  if (code <= 67) return { label: 'Rain / Drizzle', severity: 'warning', icon: '🌧️' };
  if (code <= 77) return { label: 'Snow Conditions', severity: 'danger', icon: '❄️' };
  if (code <= 82) return { label: 'Rain Showers', severity: 'warning', icon: '🌦️' };
  if (code <= 86) return { label: 'Snow Showers', severity: 'danger', icon: '🌨️' };
  if (code <= 99) return { label: 'Thunderstorm', severity: 'danger', icon: '⛈️' };
  return { label: 'Unknown', severity: 'clear', icon: '🌡️' };
};

// Default to Mumbai, India (lat: 19.076, lon: 72.877)
const DEFAULT_LAT = 19.076;
const DEFAULT_LON = 72.877;
const DEFAULT_CITY = 'Mumbai';

export default function WeatherAlert() {
  const [weather, setWeather] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LON}&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`
      );
      const data = await res.json();
      const current = data.current;
      const info = getWeatherInfo(current.weather_code);
      setWeather({
        temp: Math.round(current.temperature_2m),
        wind: Math.round(current.wind_speed_10m),
        code: current.weather_code,
        ...info,
      });
    } catch (err) {
      console.error('[WeatherAlert] Failed to fetch weather:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only show alerts for warning/danger conditions
  if (loading || !weather || weather.severity === 'clear' || dismissed) return null;

  const isDanger = weather.severity === 'danger';
  const bannerBg = isDanger
    ? 'bg-red-500/10 border-red-500/30'
    : 'bg-amber-500/10 border-amber-500/30';
  const textColor = isDanger ? 'text-red-400' : 'text-amber-400';
  const dotColor = isDanger ? 'bg-red-500' : 'bg-amber-500';

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border ${bannerBg} mb-2 animate-fadeIn`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {/* Pulsing dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`}></span>
        </span>
        <span className="text-lg" role="img" aria-label={weather.label}>{weather.icon}</span>
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${textColor} font-mono`}>
            Weather Alert — {DEFAULT_CITY}
          </span>
          <p className="text-xs text-dark-text mt-0.5">
            <span className="font-semibold">{weather.label}</span> detected —{' '}
            {weather.temp}°C, Wind {weather.wind} km/h.{' '}
            {isDanger
              ? 'Consider delaying or rerouting active trips for driver safety.'
              : 'Drivers on active trips should exercise caution.'}
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss weather alert"
        className="text-dark-muted hover:text-dark-text transition-colors shrink-0 text-lg leading-none cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WeatherData, WidgetSettings } from '../types';
import { WeatherIcon } from './WeatherIcon';
import {
  X,
  RefreshCw,
  MapPin,
  Navigation,
  Wind,
  Droplets,
  Sun,
  ShieldAlert,
  Gauge,
  Sunrise,
  Sunset,
  CloudRain,
  Compass,
  Sliders,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { POPULAR_LOCATIONS, searchCities, WeatherLocationPreset } from '../services/weatherService';

interface MotoWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData;
  settings: WidgetSettings;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  onSelectLocation: (preset: { name: string; lat: number; lon: number }) => void;
  onToggleTempUnit: () => void;
  onUpdateCustomWeather?: (temp: number, condition: string) => void;
  onToggleCustomOverride?: (enabled: boolean) => void;
}

export const MotoWeatherModal: React.FC<MotoWeatherModalProps> = ({
  isOpen,
  onClose,
  weather,
  settings,
  onRefresh,
  isLoading,
  onSelectLocation,
  onToggleTempUnit,
  onUpdateCustomWeather,
  onToggleCustomOverride,
}) => {
  const [activeTab, setActiveTab] = useState<'glance' | 'locations' | 'simulator'>('glance');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WeatherLocationPreset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Local simulation inputs
  const [simTemp, setSimTemp] = useState<number>(weather.temp);
  const [simCondition, setSimCondition] = useState<string>(weather.condition);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseGps = () => {
    if (settings.hapticsEnabled) soundManager.playClick();
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        if (settings.hapticsEnabled) soundManager.playSuccess();
        onSelectLocation({
          name: 'Current Location',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setActiveTab('glance');
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('Could not detect location. Please search manually.');
        console.warn('GPS error:', err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const getAqiBadgeColor = (category: string) => {
    switch (category) {
      case 'Good':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
      case 'Sensitive':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/40';
      case 'Unhealthy':
      case 'Hazardous':
        return 'bg-rose-500/20 text-rose-300 border-rose-400/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
    }
  };

  const isF = weather.tempUnit === 'F';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[36px] bg-slate-950/90 border border-white/20 p-5 sm:p-6 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col gap-4">
        {/* Ambient Atmospheric Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Modal Top Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <WeatherIcon weatherCode={weather.weatherCode} condition={weather.condition} isDay={weather.isDay} className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-['Outfit'] font-black text-base text-white tracking-tight">
                  Moto Glance Weather
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {weather.isLive ? 'LIVE RADAR' : 'SIMULATED'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Motorola Edge+ • Open-Meteo Real-Time Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Unit Toggle Button */}
            <button
              onClick={() => {
                if (settings.hapticsEnabled) soundManager.playClick();
                onToggleTempUnit();
              }}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-cyan-300 transition-transform active:scale-95 cursor-pointer"
              title="Switch between Fahrenheit and Celsius"
            >
              °{weather.tempUnit}
            </button>

            {/* Refresh Button */}
            <button
              onClick={async () => {
                if (settings.hapticsEnabled) soundManager.playClick();
                await onRefresh();
              }}
              disabled={isLoading}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh live weather feed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                if (settings.hapticsEnabled) soundManager.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 border border-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs: Glance | City & GPS | Simulator */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('glance')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'glance'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Glance & Forecast
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'locations'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Locations</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'simulator'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Customise</span>
          </button>
        </div>

        {/* TAB 1: GLANCE & FORECAST */}
        {activeTab === 'glance' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            {/* Hero Weather Card */}
            <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/40 border border-white/15 shadow-inner">
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => setActiveTab('locations')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:underline cursor-pointer group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{weather.city}</span>
                    {weather.region && <span className="opacity-70">, {weather.region}</span>}
                  </button>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-['Outfit'] font-black text-5xl sm:text-6xl text-white tracking-tighter">
                      {weather.temp}°
                    </span>
                    <span className="text-xl font-bold text-cyan-400">{weather.tempUnit}</span>
                  </div>

                  <div className="text-sm font-semibold text-slate-200 mt-1 flex items-center gap-2">
                    <span>{weather.condition}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      • Feels like {weather.feelsLike}°
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-300">
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono">
                      H: {weather.tempHigh}°
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono">
                      L: {weather.tempLow}°
                    </span>
                    {weather.precipitationProbability > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1 font-semibold">
                        <CloudRain className="w-3 h-3" />
                        <span>{weather.precipitationProbability}% Rain</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Big Dynamic Weather Icon */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                  <WeatherIcon
                    weatherCode={weather.weatherCode}
                    condition={weather.condition}
                    isDay={weather.isDay}
                    className="w-16 h-16"
                  />
                </div>
              </div>
            </div>

            {/* 24-Hour Glance Carousel */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>Hourly Glance (24h)</span>
                <span className="text-[10px] text-cyan-300">Local Time</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {weather.hourly.map((hour, idx) => (
                  <div
                    key={idx}
                    className={`shrink-0 w-16 p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      idx === 0
                        ? 'bg-cyan-500/20 border-cyan-400/40 text-white font-bold ring-1 ring-cyan-400/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-slate-400">{hour.time}</span>
                    <WeatherIcon
                      weatherCode={hour.weatherCode}
                      condition={hour.condition}
                      isDay={hour.isDay}
                      className="w-5 h-5 my-0.5"
                    />
                    <span className="text-xs font-extrabold font-mono text-white">
                      {hour.temp}°
                    </span>
                    {hour.pop > 15 ? (
                      <span className="text-[9px] font-bold text-sky-300 flex items-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5" />
                        <span>{hour.pop}%</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-transparent select-none">-</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-3.5 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300 mb-1">7-Day Outlook</span>
              <div className="flex flex-col gap-2">
                {weather.daily.map((day, idx) => {
                  // Compute bar percentage
                  const minOverall = Math.min(...weather.daily.map((d) => d.minTemp));
                  const maxOverall = Math.max(...weather.daily.map((d) => d.maxTemp));
                  const range = maxOverall - minOverall || 1;
                  const leftPct = ((day.minTemp - minOverall) / range) * 100;
                  const widthPct = Math.max(15, ((day.maxTemp - day.minTemp) / range) * 100);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <span className="w-14 font-semibold text-slate-300">{day.dayName}</span>

                      <div className="flex items-center gap-1.5 w-24">
                        <WeatherIcon
                          weatherCode={day.weatherCode}
                          condition={day.condition}
                          className="w-4 h-4"
                        />
                        <span className="text-[11px] text-slate-400 truncate">{day.condition}</span>
                      </div>

                      {/* Temperature Range Bar */}
                      <div className="flex-1 max-w-[120px] mx-2 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 w-6 text-right">
                          {day.minTemp}°
                        </span>
                        <div className="relative flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-white font-bold w-6">
                          {day.maxTemp}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Moto Glance In-Depth Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Humidity */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Humidity</span>
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="font-['Outfit'] font-black text-xl text-white">
                  {weather.humidity}%
                </div>
                <div className="text-[10px] text-slate-400">
                  Dew point ~{Math.round(weather.temp - (100 - weather.humidity) / 5)}°
                </div>
              </div>

              {/* Wind */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Wind</span>
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="font-['Outfit'] font-black text-xl text-white">
                  {weather.windSpeed} <span className="text-xs font-normal text-slate-300">{isF ? 'mph' : 'km/h'}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-cyan-400" style={{ transform: `rotate(${weather.windDirection}deg)` }} />
                  <span>Direction {weather.windDirection}°</span>
                </div>
              </div>

              {/* UV Index */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>UV Index</span>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="font-['Outfit'] font-black text-xl text-white">
                  {weather.uvIndex} <span className="text-xs font-normal text-slate-300">/ 11</span>
                </div>
                <div className="text-[10px] text-amber-300 font-semibold">
                  {weather.uvIndex <= 2 ? 'Low' : weather.uvIndex <= 5 ? 'Moderate' : weather.uvIndex <= 7 ? 'High' : 'Very High'}
                </div>
              </div>

              {/* Air Quality AQI */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Air Quality</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-['Outfit'] font-black text-xl text-white">
                  {weather.aqi}
                </div>
                <div className={`text-[10px] px-1.5 py-0.2 rounded-md border w-fit font-bold ${getAqiBadgeColor(weather.aqiCategory)}`}>
                  {weather.aqiCategory}
                </div>
              </div>

              {/* Sunrise / Sunset */}
              <div className="col-span-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sunrise className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Sunrise</div>
                    <div className="font-semibold text-white">{weather.sunrise}</div>
                  </div>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <Sunset className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Sunset</div>
                    <div className="font-semibold text-white">{weather.sunset}</div>
                  </div>
                </div>
              </div>

              {/* Pressure & Precipitation */}
              <div className="col-span-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Pressure</div>
                    <div className="font-semibold text-white">{weather.pressure} hPa</div>
                  </div>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Rain Prob.</div>
                    <div className="font-semibold text-white">{weather.precipitationProbability}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCATIONS & GPS SEARCH */}
        {activeTab === 'locations' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            {/* Auto GPS Button */}
            <button
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/40 text-cyan-300 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-md"
            >
              <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Acquiring GPS Signal...' : 'Use My Current Location (GPS)'}</span>
            </button>
            {gpsError && <p className="text-xs text-rose-400 text-center">{gpsError}</p>}

            {/* City Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search any global city (e.g. Chicago, Tokyo, London)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 pl-9"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 px-2">Search Results:</span>
                {searchResults.map((city, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (settings.hapticsEnabled) soundManager.playClick();
                      onSelectLocation({ name: city.name, lat: city.lat, lon: city.lon });
                      setActiveTab('glance');
                    }}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-left flex items-center justify-between text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{city.name}</span>
                      <span className="text-slate-400 text-[10px]">({city.region}, {city.country})</span>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono">Select</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Moto Locations */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">Popular Cities & Motorola HQ</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POPULAR_LOCATIONS.map((loc) => {
                  const isCurrent = weather.city.toLowerCase() === loc.name.toLowerCase();
                  return (
                    <button
                      key={loc.name}
                      onClick={() => {
                        if (settings.hapticsEnabled) soundManager.playClick();
                        onSelectLocation({ name: loc.name, lat: loc.lat, lon: loc.lon });
                        setActiveTab('glance');
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/40'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-3.5 h-3.5 ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-semibold">{loc.name}</div>
                          <div className="text-[10px] text-slate-400">{loc.region}</div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMISE & LOCAL SIMULATION */}
        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-slate-300">
              <span className="font-bold text-white flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Local Weather Simulation Controls</span>
              </span>
              <span>
                Want to test rain drops, thunderstorm ambient edge glow, or a specific temperature for your home screen?
                Adjust the settings below to override live data locally.
              </span>
            </div>

            {/* Custom Override Toggle */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
              <div>
                <div className="font-semibold text-xs text-white">Enable Manual Override</div>
                <div className="text-[10px] text-slate-400">Bypasses API feed and uses custom local options</div>
              </div>
              <input
                type="checkbox"
                checked={settings.weatherCustomOverride ?? false}
                onChange={(e) => {
                  if (settings.hapticsEnabled) soundManager.playClick();
                  if (onToggleCustomOverride) onToggleCustomOverride(e.target.checked);
                }}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
            </label>

            {/* Simulated Temperature Slider */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Simulated Temperature</span>
                <span className="font-mono text-cyan-300 font-bold text-sm">
                  {simTemp}°{weather.tempUnit}
                </span>
              </div>
              <input
                type="range"
                min={isF ? 0 : -15}
                max={isF ? 115 : 45}
                value={simTemp}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSimTemp(val);
                  if (onUpdateCustomWeather) onUpdateCustomWeather(val, simCondition);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{isF ? '0°F (Freezing)' : '-15°C'}</span>
                <span>{isF ? '72°F (Mild)' : '22°C'}</span>
                <span>{isF ? '115°F (Scorching)' : '45°C'}</span>
              </div>
            </div>

            {/* Simulated Condition Selector */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <span className="font-semibold text-xs text-white">Weather Condition Style</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { name: 'Sunny', code: 0, day: true },
                  { name: 'Partly Cloudy', code: 2, day: true },
                  { name: 'Clear Night', code: 0, day: false },
                  { name: 'Rain Showers', code: 61, day: true },
                  { name: 'Thunderstorm', code: 95, day: true },
                  { name: 'Snowfall', code: 71, day: true },
                  { name: 'Misty Fog', code: 45, day: true },
                  { name: 'Overcast', code: 3, day: true },
                ].map((cond) => {
                  const isSelected = simCondition === cond.name;
                  return (
                    <button
                      key={cond.name}
                      onClick={() => {
                        if (settings.hapticsEnabled) soundManager.playClick();
                        setSimCondition(cond.name);
                        if (onUpdateCustomWeather) onUpdateCustomWeather(simTemp, cond.name);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/40'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <WeatherIcon weatherCode={cond.code} condition={cond.name} isDay={cond.day} className="w-4 h-4" />
                      <span className="text-xs truncate">{cond.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset to live data */}
            <button
              onClick={async () => {
                if (settings.hapticsEnabled) soundManager.playSuccess();
                if (onToggleCustomOverride) onToggleCustomOverride(false);
                await onRefresh();
                setActiveTab('glance');
              }}
              className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              Reset & Return to Live Real-Time Feed
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Last updated: {new Date(weather.lastUpdated).toLocaleTimeString()}</span>
          <button
            onClick={() => {
              if (settings.hapticsEnabled) soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

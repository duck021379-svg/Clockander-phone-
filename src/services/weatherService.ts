/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherData, WeatherHourlyItem, WeatherDailyItem } from '../types';

export interface WeatherLocationPreset {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}

export const POPULAR_LOCATIONS: WeatherLocationPreset[] = [
  { name: 'Chicago', region: 'Illinois (Moto HQ)', country: 'USA', lat: 41.8781, lon: -87.6298 },
  { name: 'New York', region: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  { name: 'San Francisco', region: 'California', country: 'USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Austin', region: 'Texas', country: 'USA', lat: 30.2672, lon: -97.7431 },
  { name: 'Miami', region: 'Florida', country: 'USA', lat: 25.7617, lon: -80.1918 },
  { name: 'Seattle', region: 'Washington', country: 'USA', lat: 47.6062, lon: -122.3321 },
  { name: 'London', region: 'England', country: 'UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', region: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
];

export function mapWmoCodeToCondition(code: number, isDay: boolean = true): {
  condition: string;
  category: 'clear' | 'clouds' | 'rain' | 'snow' | 'thunder' | 'fog';
  iconName: 'Sun' | 'Moon' | 'CloudSun' | 'CloudMoon' | 'Cloud' | 'CloudRain' | 'CloudLightning' | 'CloudSnow' | 'CloudFog' | 'CloudDrizzle';
} {
  switch (code) {
    case 0:
      return {
        condition: isDay ? 'Clear Sky' : 'Clear Night',
        category: 'clear',
        iconName: isDay ? 'Sun' : 'Moon',
      };
    case 1:
      return {
        condition: isDay ? 'Mainly Sunny' : 'Mainly Clear',
        category: 'clear',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
      };
    case 2:
      return {
        condition: 'Partly Cloudy',
        category: 'clouds',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
      };
    case 3:
      return {
        condition: 'Overcast',
        category: 'clouds',
        iconName: 'Cloud',
      };
    case 45:
    case 48:
      return {
        condition: 'Misty Fog',
        category: 'fog',
        iconName: 'CloudFog',
      };
    case 51:
    case 53:
    case 55:
      return {
        condition: 'Light Drizzle',
        category: 'rain',
        iconName: 'CloudDrizzle',
      };
    case 56:
    case 57:
      return {
        condition: 'Freezing Drizzle',
        category: 'snow',
        iconName: 'CloudSnow',
      };
    case 61:
    case 63:
      return {
        condition: 'Rain Showers',
        category: 'rain',
        iconName: 'CloudRain',
      };
    case 65:
      return {
        condition: 'Heavy Rain',
        category: 'rain',
        iconName: 'CloudRain',
      };
    case 66:
    case 67:
      return {
        condition: 'Freezing Rain',
        category: 'snow',
        iconName: 'CloudSnow',
      };
    case 71:
    case 73:
      return {
        condition: 'Light Snow',
        category: 'snow',
        iconName: 'CloudSnow',
      };
    case 75:
    case 77:
      return {
        condition: 'Heavy Snow',
        category: 'snow',
        iconName: 'CloudSnow',
      };
    case 80:
    case 81:
    case 82:
      return {
        condition: 'Scattered Showers',
        category: 'rain',
        iconName: 'CloudRain',
      };
    case 85:
    case 86:
      return {
        condition: 'Snow Flurries',
        category: 'snow',
        iconName: 'CloudSnow',
      };
    case 95:
      return {
        condition: 'Thunderstorm',
        category: 'thunder',
        iconName: 'CloudLightning',
      };
    case 96:
    case 99:
      return {
        condition: 'Severe Thunderstorm',
        category: 'thunder',
        iconName: 'CloudLightning',
      };
    default:
      return {
        condition: 'Partly Cloudy',
        category: 'clouds',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
      };
  }
}

export function getAqiCategory(aqi: number): 'Good' | 'Moderate' | 'Sensitive' | 'Unhealthy' | 'Hazardous' {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  return 'Hazardous';
}

/**
 * Creates realistic mock weather data for fallbacks or offline simulation
 */
export function generateMockWeatherData(
  cityName: string = 'Chicago',
  tempUnit: 'F' | 'C' = 'F',
  customTemp?: number,
  customCondition?: string
): WeatherData {
  const isF = tempUnit === 'F';
  const baseTemp = customTemp !== undefined ? customTemp : (isF ? 72 : 22);
  const now = new Date();
  const currentHour = now.getHours();
  const isDay = currentHour >= 6 && currentHour <= 19;

  const hourly: WeatherHourlyItem[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now);
    d.setHours(currentHour + i);
    const hourLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const hourIsDay = d.getHours() >= 6 && d.getHours() <= 19;
    // Temperature curve variation through day
    const hourOffset = Math.sin(((d.getHours() - 4) / 24) * Math.PI * 2) * (isF ? 8 : 4.5);
    const tempVal = Math.round(baseTemp + hourOffset);
    const pop = i % 4 === 0 ? 30 : i % 3 === 0 ? 15 : 5;

    hourly.push({
      time: i === 0 ? 'Now' : hourLabel,
      temp: tempVal,
      weatherCode: 2,
      condition: customCondition || (hourIsDay ? 'Partly Cloudy' : 'Clear Night'),
      pop,
      isDay: hourIsDay,
    });
  }

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daily: WeatherDailyItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayName = i === 0 ? 'Today' : weekdayNames[d.getDay()];
    const max = Math.round(baseTemp + (isF ? 5 : 3) + (i % 2 === 0 ? 2 : -1));
    const min = Math.round(baseTemp - (isF ? 10 : 5) + (i % 2 === 0 ? -1 : 1));

    daily.push({
      date: d.toISOString().split('T')[0],
      dayName,
      maxTemp: max,
      minTemp: min,
      weatherCode: i === 2 ? 61 : i === 4 ? 0 : 2,
      condition: i === 2 ? 'Passing Showers' : i === 4 ? 'Sunny' : 'Partly Cloudy',
      pop: i === 2 ? 65 : 10,
    });
  }

  return {
    city: cityName,
    region: 'IL (Moto HQ)',
    country: 'USA',
    lat: 41.8781,
    lon: -87.6298,
    temp: baseTemp,
    tempUnit,
    feelsLike: Math.round(baseTemp + (isF ? 1 : 0.5)),
    tempHigh: isF ? baseTemp + 6 : baseTemp + 3,
    tempLow: isF ? baseTemp - 11 : baseTemp - 6,
    weatherCode: 2,
    condition: customCondition || (isDay ? 'Partly Cloudy' : 'Clear Night'),
    isDay,
    humidity: 58,
    windSpeed: isF ? 9 : 14,
    windDirection: 210,
    uvIndex: isDay ? 5 : 0,
    precipitation: 0.0,
    precipitationProbability: 15,
    pressure: 30.04,
    aqi: 34,
    aqiCategory: 'Good',
    sunrise: '6:48 AM',
    sunset: '6:32 PM',
    hourly,
    daily,
    lastUpdated: Date.now(),
    isLive: false,
  };
}

/**
 * Fetches live real-time weather from Open-Meteo
 */
export async function fetchLiveWeather(params: {
  lat: number;
  lon: number;
  cityName?: string;
  tempUnit?: 'F' | 'C';
}): Promise<WeatherData> {
  const { lat, lon, cityName = 'Chicago', tempUnit = 'F' } = params;
  const isMetric = tempUnit === 'C';

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&temperature_unit=${isMetric ? 'celsius' : 'fahrenheit'}&wind_speed_unit=${isMetric ? 'kmh' : 'mph'}&precipitation_unit=inch&timezone=auto`;

  // Fetch forecast and air quality in parallel
  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl),
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`),
  ]);

  if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
    throw new Error('Failed to retrieve forecast data from Open-Meteo');
  }

  const data = await weatherRes.value.json();

  let aqi = 42;
  if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
    try {
      const aqiData = await aqiRes.value.json();
      if (aqiData.current?.us_aqi !== undefined) {
        aqi = Math.round(aqiData.current.us_aqi);
      }
    } catch {
      // ignore
    }
  }

  const current = data.current || {};
  const dailyData = data.daily || {};
  const hourlyData = data.hourly || {};

  const weatherCode = current.weather_code ?? 0;
  const isDay = current.is_day === 1;
  const { condition } = mapWmoCodeToCondition(weatherCode, isDay);

  // Parse Hourly Forecast (Next 24 hours)
  const now = new Date();
  const hourlyList: WeatherHourlyItem[] = [];
  const hourlyTimes: string[] = hourlyData.time || [];
  const hourlyTemps: number[] = hourlyData.temperature_2m || [];
  const hourlyCodes: number[] = hourlyData.weather_code || [];
  const hourlyPops: number[] = hourlyData.precipitation_probability || [];
  const hourlyIsDay: number[] = hourlyData.is_day || [];

  // Find index closest to now
  const nowIsoPrefix = now.toISOString().slice(0, 13);
  let startIdx = hourlyTimes.findIndex((t) => t.startsWith(nowIsoPrefix));
  if (startIdx === -1) startIdx = 0;

  for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i++) {
    const rawTime = hourlyTimes[i];
    const hourDate = new Date(rawTime);
    const hourLabel = i === startIdx ? 'Now' : hourDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const hCode = hourlyCodes[i] ?? 0;
    const hDay = (hourlyIsDay[i] ?? 1) === 1;

    hourlyList.push({
      time: hourLabel,
      temp: Math.round(hourlyTemps[i] ?? current.temperature_2m ?? 70),
      weatherCode: hCode,
      condition: mapWmoCodeToCondition(hCode, hDay).condition,
      pop: hourlyPops[i] ?? 0,
      isDay: hDay,
    });
  }

  // Parse 7-day forecast
  const dailyList: WeatherDailyItem[] = [];
  const dailyDates: string[] = dailyData.time || [];
  const dailyMax: number[] = dailyData.temperature_2m_max || [];
  const dailyMin: number[] = dailyData.temperature_2m_min || [];
  const dailyCodes: number[] = dailyData.weather_code || [];
  const dailyPops: number[] = dailyData.precipitation_probability_max || [];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < Math.min(7, dailyDates.length); i++) {
    const dStr = dailyDates[i];
    const dObj = new Date(dStr + 'T12:00:00');
    const dayName = i === 0 ? 'Today' : weekdayNames[dObj.getDay()];
    const dCode = dailyCodes[i] ?? 0;

    dailyList.push({
      date: dStr,
      dayName,
      maxTemp: Math.round(dailyMax[i] ?? 75),
      minTemp: Math.round(dailyMin[i] ?? 60),
      weatherCode: dCode,
      condition: mapWmoCodeToCondition(dCode, true).condition,
      pop: dailyPops[i] ?? 0,
    });
  }

  const formatSunTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  const weatherResult: WeatherData = {
    city: cityName,
    lat,
    lon,
    temp: Math.round(current.temperature_2m ?? 72),
    tempUnit,
    feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 72),
    tempHigh: Math.round(dailyMax[0] ?? current.temperature_2m ?? 75),
    tempLow: Math.round(dailyMin[0] ?? current.temperature_2m ?? 60),
    weatherCode,
    condition,
    isDay,
    humidity: Math.round(current.relative_humidity_2m ?? 50),
    windSpeed: Math.round(current.wind_speed_10m ?? 8),
    windDirection: Math.round(current.wind_direction_10m ?? 180),
    uvIndex: Math.round(dailyData.uv_index_max?.[0] ?? 4),
    precipitation: current.precipitation ?? 0,
    precipitationProbability: dailyPops[0] ?? 10,
    pressure: Math.round((current.surface_pressure ?? 1013) * 10) / 10,
    aqi,
    aqiCategory: getAqiCategory(aqi),
    sunrise: formatSunTime(dailyData.sunrise?.[0]),
    sunset: formatSunTime(dailyData.sunset?.[0]),
    hourly: hourlyList,
    daily: dailyList,
    lastUpdated: Date.now(),
    isLive: true,
  };

  // Cache to localStorage
  try {
    localStorage.setItem('clockander_cached_weather', JSON.stringify(weatherResult));
  } catch {
    // ignore
  }

  return weatherResult;
}

/**
 * Search city coordinates using Open-Meteo Geocoding
 */
export async function searchCities(query: string): Promise<WeatherLocationPreset[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.results || !Array.isArray(json.results)) return [];

    return json.results.map((item: any) => ({
      name: item.name,
      region: item.admin1 || item.country || '',
      country: item.country_code || item.country || '',
      lat: item.latitude,
      lon: item.longitude,
    }));
  } catch (err) {
    console.error('Error searching cities:', err);
    return [];
  }
}

/**
 * Get cached weather or realistic default
 */
export function getInitialWeather(tempUnit: 'F' | 'C' = 'F'): WeatherData {
  try {
    const cached = localStorage.getItem('clockander_cached_weather');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.temp !== undefined) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return generateMockWeatherData('Chicago', tempUnit);
}

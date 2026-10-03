export type ClockStyle = 'orbit' | 'digital' | 'analog' | 'material' | 'text-glance';
export type GlassTint = 'obsidian' | 'frost' | 'moto-blue' | 'emerald' | 'amber' | 'amethyst';
export type EdgeLightingColor = 'cyan' | 'moto-blue' | 'purple' | 'emerald' | 'gold' | 'off';
export type WallpaperTheme = 'cyan-nebula' | 'obsidian' | 'aurora' | 'cyber-sunset' | 'frost-crystal' | 'custom';
export type LayoutPreset = 'simple' | 'unified' | 'calendar-focus' | 'keep-focus';
export type FontFamilyOption = 'sketch-serif' | 'outfit' | 'jakarta' | 'mono' | 'serif' | 'display';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: 'work' | 'personal' | 'meeting' | 'fitness' | 'reminder' | 'google';
  description?: string;
  isGoogleEvent?: boolean;
  googleEventId?: string;
  color?: string;
  isStarred?: boolean;
}

export interface KeepTaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface KeepNote {
  id: string;
  title: string;
  content?: string;
  items: KeepTaskItem[];
  color: 'yellow' | 'coral' | 'teal' | 'lavender' | 'mint' | 'dark';
  tags: string[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  googleTaskId?: string;
}

export interface WeatherHourlyItem {
  time: string; // "3 PM" or "15:00"
  temp: number;
  weatherCode: number;
  condition: string;
  pop: number; // precipitation probability %
  isDay: boolean;
}

export interface WeatherDailyItem {
  date: string;
  dayName: string; // "Tue", "Wed"
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  condition: string;
  pop: number;
}

export interface WeatherData {
  city: string;
  region?: string;
  country?: string;
  lat: number;
  lon: number;
  temp: number;
  tempUnit: 'F' | 'C';
  feelsLike: number;
  tempHigh: number;
  tempLow: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  precipitation: number;
  precipitationProbability: number;
  pressure: number;
  aqi: number;
  aqiCategory: 'Good' | 'Moderate' | 'Sensitive' | 'Unhealthy' | 'Hazardous';
  sunrise: string;
  sunset: string;
  hourly: WeatherHourlyItem[];
  daily: WeatherDailyItem[];
  lastUpdated: number;
  isLive: boolean;
}

export interface WidgetSettings {
  clockStyle: ClockStyle;
  is24Hour: boolean;
  showSeconds: boolean;
  startOnMonday: boolean;
  glassOpacity: number; // 0.1 to 0.95
  glassBlur: number; // 4 to 32
  glassTint: GlassTint;
  edgeLighting: EdgeLightingColor;
  hapticsEnabled: boolean;
  viewMode: 'phone' | 'desktop' | 'fullscreen';
  isLocked: boolean; // desktop drag lock state
  weatherTemp: number;
  weatherCondition: string;
  tempUnit?: 'F' | 'C';
  weatherCity?: string;
  weatherLat?: number;
  weatherLon?: number;
  showWeatherInGlance?: boolean;
  weatherUseGps?: boolean;
  weatherCustomOverride?: boolean;
  batteryLevel: number;
  wallpaper: WallpaperTheme;
  customWallpaperUrl?: string;
  layoutPreset: LayoutPreset;
  textOpacity: number; // 0.2 to 1.0 (translucent text)
  textColor: string; // hex color for text
  fontFamily: FontFamilyOption;
  textScale: number; // 0.75 to 1.5
  transparentBgOnly: boolean; // true = background transparent, only text shows
  widgetPosition: { x: number; y: number }; // BeWidgets draggable positioning
  showHomeDock: boolean; // Motorola home screen dock
  showDate: boolean; // BeWidgets show date toggle
}

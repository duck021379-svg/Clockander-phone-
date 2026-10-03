/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
} from 'lucide-react';
import { mapWmoCodeToCondition } from '../services/weatherService';

interface WeatherIconProps {
  weatherCode?: number;
  condition?: string;
  isDay?: boolean;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  weatherCode = 2,
  condition,
  isDay = true,
  className = 'w-5 h-5',
}) => {
  const { iconName, category } = mapWmoCodeToCondition(weatherCode, isDay);

  // If a condition text is explicitly given (e.g. from manual simulation)
  let resolvedIcon = iconName;
  let colorClass = 'text-amber-400';

  if (condition) {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || c.includes('storm')) {
      resolvedIcon = 'CloudLightning';
      colorClass = 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]';
    } else if (c.includes('snow') || c.includes('flurr') || c.includes('ice') || c.includes('freez')) {
      resolvedIcon = 'CloudSnow';
      colorClass = 'text-cyan-200 drop-shadow-[0_0_8px_rgba(186,230,253,0.5)]';
    } else if (c.includes('drizzle')) {
      resolvedIcon = 'CloudDrizzle';
      colorClass = 'text-sky-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]';
    } else if (c.includes('rain') || c.includes('shower')) {
      resolvedIcon = 'CloudRain';
      colorClass = 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]';
    } else if (c.includes('fog') || c.includes('mist')) {
      resolvedIcon = 'CloudFog';
      colorClass = 'text-slate-300';
    } else if (c.includes('overcast') || c.includes('cloudy')) {
      if (c.includes('partly')) {
        resolvedIcon = isDay ? 'CloudSun' : 'CloudMoon';
        colorClass = isDay ? 'text-amber-300' : 'text-indigo-300';
      } else {
        resolvedIcon = 'Cloud';
        colorClass = 'text-slate-300';
      }
    } else if (c.includes('clear') || c.includes('sunny')) {
      resolvedIcon = isDay ? 'Sun' : 'Moon';
      colorClass = isDay ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-indigo-200 drop-shadow-[0_0_8px_rgba(199,210,254,0.5)]';
    }
  } else {
    // Rely on WMO category
    switch (category) {
      case 'clear':
        colorClass = isDay
          ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
          : 'text-indigo-200 drop-shadow-[0_0_8px_rgba(199,210,254,0.5)]';
        break;
      case 'clouds':
        colorClass = isDay ? 'text-cyan-300' : 'text-slate-300';
        break;
      case 'rain':
        colorClass = 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]';
        break;
      case 'snow':
        colorClass = 'text-cyan-200 drop-shadow-[0_0_8px_rgba(186,230,253,0.5)]';
        break;
      case 'thunder':
        colorClass = 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]';
        break;
      case 'fog':
        colorClass = 'text-slate-400';
        break;
    }
  }

  const combinedClass = `${className} ${colorClass} shrink-0 transition-all`;

  switch (resolvedIcon) {
    case 'Sun':
      return <Sun className={combinedClass} />;
    case 'Moon':
      return <Moon className={combinedClass} />;
    case 'CloudSun':
      return <CloudSun className={combinedClass} />;
    case 'CloudMoon':
      return <CloudMoon className={combinedClass} />;
    case 'Cloud':
      return <Cloud className={combinedClass} />;
    case 'CloudRain':
      return <CloudRain className={combinedClass} />;
    case 'CloudLightning':
      return <CloudLightning className={combinedClass} />;
    case 'CloudSnow':
      return <CloudSnow className={combinedClass} />;
    case 'CloudFog':
      return <CloudFog className={combinedClass} />;
    case 'CloudDrizzle':
    default:
      return <CloudDrizzle className={combinedClass} />;
  }
};

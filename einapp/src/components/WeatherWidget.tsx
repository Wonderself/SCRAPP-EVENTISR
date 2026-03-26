"use client";

import { useEffect, useState } from "react";
import { Droplets, Wind, Sun, CloudRain } from "lucide-react";

interface Weather {
  temp: number;
  description: string;
  windSpeed: number;
  humidity: number;
  rainToday: boolean;
  rainUpcoming: boolean;
  rainDays: string[];
  forecast: { dayName: string; tempMin: number; tempMax: number; rain: boolean }[];
}

interface Props {
  isDay: boolean;
}

export default function WeatherWidget({ isDay }: Props) {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : null))
      .then(setWeather)
      .catch(() => null);
  }, []);

  if (!weather) return null;

  const WeatherIcon = weather.rainToday ? CloudRain : Sun;

  return (
    <div className={`overflow-hidden rounded-2xl lg:rounded-3xl ${
      isDay
        ? "bg-white border-2 border-sky-100 shadow-sm"
        : "bg-white/[0.06] backdrop-blur-sm border-2 border-white/10"
    }`}>
      {/* Main row */}
      <div className="p-3 lg:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 lg:gap-4">
          <div
            className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center ${
              isDay
                ? "bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg shadow-amber-300/25"
                : "bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-lg shadow-fuchsia-500/25"
            }`}
          >
            <WeatherIcon size={18} className="text-white lg:hidden" />
            <WeatherIcon size={24} className="text-white hidden lg:block" />
          </div>
          <div>
            <span className={`text-2xl lg:text-4xl font-black ${isDay ? "text-sky-800" : "text-white"}`}>
              {weather.temp}°
            </span>
            <p className={`text-[10px] lg:text-sm font-bold ${isDay ? "text-sky-500" : "text-fuchsia-300"}`}>
              {weather.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex gap-3 text-[10px] lg:text-sm font-bold ${isDay ? "text-sky-400" : "text-white/50"}`}>
            <span className="flex items-center gap-1">
              <Wind size={12} /> {weather.windSpeed}
            </span>
            <span className="flex items-center gap-1">
              <Droplets size={12} /> {weather.humidity}%
            </span>
          </div>
          {weather.rainUpcoming && weather.rainDays.length > 0 && (
            <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1 text-[10px] lg:text-xs font-bold ${
              isDay ? "bg-amber-50 text-amber-600 border-2 border-amber-200" : "bg-fuchsia-500/10 text-fuchsia-300 border-2 border-fuchsia-500/20"
            }`}>
              <CloudRain size={12} />
              <span>{weather.rainToday ? "גשם היום" : `גשם ${weather.rainDays[0]}`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Forecast */}
      <div className={`hidden lg:flex border-t-2 ${isDay ? "border-sky-100" : "border-white/10"}`}>
        {weather.forecast.slice(0, 4).map((day, i) => (
          <div
            key={day.dayName}
            className={`flex-1 text-center py-3 ${
              i < 3 ? (isDay ? "border-r-2 border-sky-100" : "border-r-2 border-white/10") : ""
            }`}
          >
            <p className={`text-[10px] lg:text-sm font-black mb-0.5 ${isDay ? "text-sky-400" : "text-fuchsia-300/70"}`}>
              {day.dayName}
            </p>
            <p className={`text-base lg:text-2xl font-black ${isDay ? "text-sky-700" : "text-white"}`}>
              {day.tempMax}°
            </p>
            {day.rain && <CloudRain size={12} className={`mx-auto mt-0.5 ${isDay ? "text-sky-400" : "text-fuchsia-400"}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Droplets, Wind, Sun, CloudRain, Cloud, Thermometer } from "lucide-react";

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
    <div className={`rounded-2xl overflow-hidden ${isDay ? "glass-day" : "glass-sunset"}`}>
      {/* Main weather row */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isDay
                ? "bg-gradient-to-br from-amber-300 to-orange-400"
                : "bg-gradient-to-br from-orange-400 to-rose-500"
            }`}
          >
            <WeatherIcon size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-extrabold tracking-tight ${isDay ? "text-cyan-900" : "text-white"}`}>
                {weather.temp}°
              </span>
            </div>
            <p className={`text-xs font-medium -mt-0.5 ${isDay ? "text-cyan-600" : "text-orange-200"}`}>
              {weather.description}
            </p>
          </div>
        </div>

        <div className={`flex gap-4 text-xs ${isDay ? "text-cyan-600" : "text-orange-200/70"}`}>
          <span className="flex items-center gap-1">
            <Wind size={13} /> {weather.windSpeed}
          </span>
          <span className="flex items-center gap-1">
            <Droplets size={13} /> {weather.humidity}%
          </span>
        </div>
      </div>

      {/* Rain warning */}
      {weather.rainUpcoming && weather.rainDays.length > 0 && (
        <div
          className={`mx-4 mb-3 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-medium ${
            isDay ? "bg-amber-50 text-amber-700" : "bg-orange-500/10 text-orange-300"
          }`}
        >
          <CloudRain size={14} />
          <span>
            {weather.rainToday
              ? "גשם היום — להיערך"
              : `גשם צפוי יום ${weather.rainDays[0]} — לתכנן מראש`}
          </span>
        </div>
      )}

      {/* Mini forecast */}
      <div className={`flex gap-0 border-t ${isDay ? "border-cyan-100" : "border-white/5"}`}>
        {weather.forecast.slice(0, 4).map((day, i) => (
          <div
            key={day.dayName}
            className={`flex-1 text-center py-2.5 ${
              i < 3 ? (isDay ? "border-r border-cyan-100" : "border-r border-white/5") : ""
            }`}
          >
            <p className={`text-[10px] font-semibold mb-0.5 ${isDay ? "text-cyan-500" : "text-orange-300/60"}`}>
              {day.dayName}
            </p>
            <p className={`text-sm font-bold ${isDay ? "text-cyan-800" : "text-white"}`}>
              {day.tempMax}°
            </p>
            {day.rain && (
              <CloudRain size={10} className={`mx-auto mt-0.5 ${isDay ? "text-cyan-400" : "text-orange-400"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

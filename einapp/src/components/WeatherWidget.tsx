"use client";

import { useEffect, useState } from "react";
import { Cloud, Droplets, Wind, Sun, CloudRain } from "lucide-react";

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

  return (
    <div
      className={`rounded-2xl p-4 ${
        isDay
          ? "bg-gradient-to-bl from-[#e8f4f8] to-white border border-[#d8eef5]"
          : "bg-gradient-to-bl from-[#2a2035] to-[#1a1520] border border-[#3a2540]"
      }`}
    >
      {/* Current */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDay ? "bg-[#2196c8]/10" : "bg-[#e65100]/10"}`}>
            {weather.rainToday ? (
              <CloudRain size={22} className={isDay ? "text-[#2196c8]" : "text-[#e65100]"} />
            ) : (
              <Sun size={22} className={isDay ? "text-[#2196c8]" : "text-[#ff8f00]"} />
            )}
          </div>
          <div>
            <span className={`text-2xl font-bold ${isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}`}>
              {weather.temp}°
            </span>
            <p className={`text-xs ${isDay ? "text-[#4a7a8a]" : "text-[#c8a88a]"}`}>
              {weather.description}
            </p>
          </div>
        </div>
        <div className={`flex gap-3 text-xs ${isDay ? "text-[#8ab0c0]" : "text-[#8a6a5a]"}`}>
          <span className="flex items-center gap-1">
            <Wind size={12} /> {weather.windSpeed}
          </span>
          <span className="flex items-center gap-1">
            <Droplets size={12} /> {weather.humidity}%
          </span>
        </div>
      </div>

      {/* Rain warning */}
      {weather.rainUpcoming && weather.rainDays.length > 0 && (
        <div className={`text-xs px-3 py-2 rounded-xl mb-3 flex items-center gap-2 ${
          isDay ? "bg-[#fff3e0] text-[#e65100]" : "bg-[#3a2540] text-[#ff8f00]"
        }`}>
          <CloudRain size={14} />
          <span>
            {weather.rainToday
              ? "גשם היום — להיערך"
              : `גשם צפוי יום ${weather.rainDays[0]} — לתכנן מראש`}
          </span>
        </div>
      )}

      {/* Mini forecast */}
      <div className="flex gap-2 overflow-x-auto">
        {weather.forecast.slice(0, 4).map((day) => (
          <div
            key={day.dayName}
            className={`flex-1 min-w-[52px] text-center py-2 px-1 rounded-xl text-xs ${
              isDay ? "bg-[#f5f9fb]" : "bg-[#231a2e]"
            }`}
          >
            <p className={`font-medium mb-1 ${isDay ? "text-[#4a7a8a]" : "text-[#c8a88a]"}`}>
              {day.dayName}
            </p>
            <p className={isDay ? "text-[#1a3a4a]" : "text-[#f5e6d8]"}>
              {day.tempMax}°
            </p>
            {day.rain && <CloudRain size={10} className={`mx-auto mt-0.5 ${isDay ? "text-[#2196c8]" : "text-[#e65100]"}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

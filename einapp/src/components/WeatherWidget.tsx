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
    <div className={isDay ? "cartoon-card-day overflow-hidden" : "cartoon-card-sunset overflow-hidden"}>
      {/* Main row */}
      <div className="p-4 lg:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-5">
          <div
            className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center ${
              isDay
                ? "bg-gradient-to-br from-amber-300 to-orange-400"
                : "bg-gradient-to-br from-orange-400 to-rose-500"
            }`}
            style={{ boxShadow: isDay ? "0 3px 0 #d97706" : "0 3px 0 #be123c" }}
          >
            <WeatherIcon size={22} className="text-white lg:hidden" />
            <WeatherIcon size={30} className="text-white hidden lg:block" />
          </div>
          <div>
            <span className={`text-3xl lg:text-5xl font-black ${isDay ? "text-sky-800" : "text-white"}`}>
              {weather.temp}°
            </span>
            <p className={`text-xs lg:text-base font-bold ${isDay ? "text-sky-500" : "text-orange-200"}`}>
              {weather.description}
            </p>
          </div>
        </div>

        <div className={`flex gap-4 text-xs lg:text-sm font-bold ${isDay ? "text-sky-400" : "text-orange-200/50"}`}>
          <span className="flex items-center gap-1">
            <Wind size={14} /> {weather.windSpeed}
          </span>
          <span className="flex items-center gap-1">
            <Droplets size={14} /> {weather.humidity}%
          </span>
        </div>
      </div>

      {/* Rain warning */}
      {weather.rainUpcoming && weather.rainDays.length > 0 && (
        <div className={`mx-4 lg:mx-6 mb-3 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs lg:text-sm font-bold ${
          isDay ? "bg-amber-50 text-amber-600 border-2 border-amber-200" : "bg-orange-500/10 text-orange-300 border-2 border-orange-500/10"
        }`}>
          <CloudRain size={16} />
          <span>{weather.rainToday ? "גשם היום — להיערך" : `גשם צפוי יום ${weather.rainDays[0]}`}</span>
        </div>
      )}

      {/* Forecast */}
      <div className={`flex border-t-3 ${isDay ? "border-sky-100" : "border-white/5"}`}>
        {weather.forecast.slice(0, 4).map((day, i) => (
          <div
            key={day.dayName}
            className={`flex-1 text-center py-3 lg:py-4 ${
              i < 3 ? (isDay ? "border-r-3 border-sky-100" : "border-r-3 border-white/5") : ""
            }`}
          >
            <p className={`text-[10px] lg:text-sm font-black mb-0.5 ${isDay ? "text-sky-400" : "text-orange-300/50"}`}>
              {day.dayName}
            </p>
            <p className={`text-base lg:text-2xl font-black ${isDay ? "text-sky-700" : "text-white"}`}>
              {day.tempMax}°
            </p>
            {day.rain && <CloudRain size={12} className={`mx-auto mt-0.5 ${isDay ? "text-sky-400" : "text-orange-400"}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

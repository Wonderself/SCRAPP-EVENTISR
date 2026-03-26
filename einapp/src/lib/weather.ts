// Shavei Tzion coordinates
const LAT = 32.9756;
const LON = 35.0828;

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rainToday: boolean;
  rainUpcoming: boolean;
  rainDays: string[];
  forecast: DayForecast[];
}

export interface DayForecast {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  description: string;
  rain: boolean;
}

const DAY_NAMES_HE: Record<number, string> = {
  0: "ראשון",
  1: "שני",
  2: "שלישי",
  3: "רביעי",
  4: "חמישי",
  5: "שישי",
  6: "שבת",
};

export async function getWeather(): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    // Current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${apiKey}&units=metric&lang=he`,
      { next: { revalidate: 1800 } } // cache 30min
    );
    const current = await currentRes.json();

    // 5-day forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${apiKey}&units=metric&lang=he`,
      { next: { revalidate: 3600 } }
    );
    const forecastData = await forecastRes.json();

    // Process forecast by day
    const dailyMap = new Map<string, { temps: number[]; descs: string[]; rain: boolean }>();

    for (const item of forecastData.list || []) {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { temps: [], descs: [], rain: false });
      }
      const day = dailyMap.get(date)!;
      day.temps.push(item.main.temp);
      day.descs.push(item.weather[0].description);
      if (item.rain || item.weather[0].main === "Rain") {
        day.rain = true;
      }
    }

    const forecast: DayForecast[] = [];
    const rainDays: string[] = [];

    for (const [date, data] of dailyMap) {
      const d = new Date(date + "T12:00:00");
      const dayForecast: DayForecast = {
        date,
        dayName: DAY_NAMES_HE[d.getDay()] || "",
        tempMin: Math.round(Math.min(...data.temps)),
        tempMax: Math.round(Math.max(...data.temps)),
        description: data.descs[Math.floor(data.descs.length / 2)],
        rain: data.rain,
      };
      forecast.push(dayForecast);
      if (data.rain) rainDays.push(DAY_NAMES_HE[d.getDay()] || date);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const todayForecast = dailyMap.get(todayStr);

    return {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // m/s to km/h
      rainToday: todayForecast?.rain || false,
      rainUpcoming: rainDays.length > 0,
      rainDays,
      forecast: forecast.slice(0, 5),
    };
  } catch (error) {
    console.error("[Weather] Error:", error);
    return null;
  }
}

export function formatWeatherForMessage(weather: WeatherData): string {
  let msg = `${weather.temp}° | ${weather.description}`;
  msg += `\nרוח: ${weather.windSpeed} קמ"ש | לחות: ${weather.humidity}%`;

  if (weather.rainToday) {
    msg += "\nצפוי גשם היום — כדאי להיערך!";
  }

  if (weather.rainUpcoming && weather.rainDays.length > 0) {
    msg += `\nגשם צפוי ביום ${weather.rainDays.join(", ")} — שווה לתכנן מראש`;
  }

  return msg;
}

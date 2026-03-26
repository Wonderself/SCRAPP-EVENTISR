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

// WMO Weather interpretation codes → Hebrew descriptions
function wmoToDescription(code: number): string {
  if (code === 0) return "שמים בהירים";
  if (code === 1) return "בעיקר בהיר";
  if (code === 2) return "מעונן חלקית";
  if (code === 3) return "מעונן";
  if (code >= 45 && code <= 48) return "ערפל";
  if (code >= 51 && code <= 55) return "טפטוף";
  if (code >= 56 && code <= 57) return "טפטוף קפוא";
  if (code >= 61 && code <= 65) return "גשם";
  if (code >= 66 && code <= 67) return "גשם קפוא";
  if (code >= 71 && code <= 77) return "שלג";
  if (code >= 80 && code <= 82) return "ממטרים";
  if (code >= 85 && code <= 86) return "ממטרי שלג";
  if (code >= 95 && code <= 99) return "סופת רעמים";
  return "לא ידוע";
}

function isRainCode(code: number): boolean {
  return code >= 51 && code <= 67 || code >= 80 && code <= 82 || code >= 95 && code <= 99;
}

export async function getWeather(): Promise<WeatherData | null> {
  try {
    // Current weather from Open-Meteo (free, no API key)
    const currentRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Jerusalem&forecast_days=6`,
      { next: { revalidate: 1800 } }
    );

    if (!currentRes.ok) {
      console.error("[Weather] Open-Meteo error:", currentRes.status);
      return null;
    }

    const data = await currentRes.json();
    const current = data.current;
    const daily = data.daily;

    // Process forecast
    const forecast: DayForecast[] = [];
    const rainDays: string[] = [];

    for (let i = 1; i < daily.time.length; i++) {
      const date = daily.time[i];
      const d = new Date(date + "T12:00:00");
      const rain = isRainCode(daily.weather_code[i]) || (daily.precipitation_sum[i] > 0.5);
      const dayForecast: DayForecast = {
        date,
        dayName: DAY_NAMES_HE[d.getDay()] || "",
        tempMin: Math.round(daily.temperature_2m_min[i]),
        tempMax: Math.round(daily.temperature_2m_max[i]),
        description: wmoToDescription(daily.weather_code[i]),
        rain,
      };
      forecast.push(dayForecast);
      if (rain) rainDays.push(DAY_NAMES_HE[d.getDay()] || date);
    }

    const todayRain = isRainCode(daily.weather_code[0]) || (daily.precipitation_sum[0] > 0.5);

    return {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      description: wmoToDescription(current.weather_code),
      icon: current.weather_code <= 2 ? "01d" : "04d",
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      rainToday: todayRain,
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

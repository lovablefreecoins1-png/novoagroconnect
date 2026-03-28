import { useState, useEffect } from "react";
import { ArrowLeft, Droplets, Wind, Thermometer, CloudRain, Sun, Cloud, CloudSun, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface WeatherData {
  city: string;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon: string;
    pop: number;
  };
  forecast: {
    date: string;
    temp_min: number;
    temp_max: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon: string;
    pop: number;
  }[];
  tips: string[];
}

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getWeatherIcon(icon: string) {
  if (icon.includes("01")) return <Sun size={28} className="text-yellow-500" />;
  if (icon.includes("02") || icon.includes("03")) return <CloudSun size={28} className="text-amber-500" />;
  if (icon.includes("04")) return <Cloud size={28} className="text-muted-foreground" />;
  if (icon.includes("09") || icon.includes("10") || icon.includes("11")) return <CloudRain size={28} className="text-blue-500" />;
  return <Sun size={28} className="text-yellow-500" />;
}

function getSmallWeatherIcon(icon: string) {
  if (icon.includes("01")) return <Sun size={20} className="text-yellow-500" />;
  if (icon.includes("02") || icon.includes("03")) return <CloudSun size={20} className="text-amber-500" />;
  if (icon.includes("04")) return <Cloud size={20} className="text-muted-foreground" />;
  if (icon.includes("09") || icon.includes("10") || icon.includes("11")) return <CloudRain size={20} className="text-blue-500" />;
  return <Sun size={20} className="text-yellow-500" />;
}

export default function Clima() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = async (lat?: number, lon?: number) => {
    setLoading(true);
    setError("");
    try {
      const body: any = {};
      if (lat && lon) {
        body.lat = lat;
        body.lon = lon;
      } else if (user?.city) {
        body.city = `${user.city},${user.state || "MG"},BR`;
      }

      const { data: result, error: fnError } = await supabase.functions.invoke("get-weather", { body });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setData(result);
    } catch (e: any) {
      setError(e.message || "Erro ao buscar clima");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(),
        { timeout: 5000 }
      );
    } else {
      fetchWeather();
    }
  }, [user]);

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Clima Agrícola</h1>
            {data && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin size={12} /> {data.city}
              </p>
            )}
          </div>
          <button onClick={() => fetchWeather()} className="text-muted-foreground hover:text-foreground p-2">
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-muted-foreground">Buscando previsão do tempo...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Cloud size={48} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-foreground font-medium">Erro ao carregar clima</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button onClick={() => fetchWeather()} className="btn-primary mt-4">Tentar novamente</button>
          </div>
        ) : data ? (
          <>
            {/* Current weather card */}
            <div className="bg-gradient-to-br from-primary to-[hsl(145,55%,30%)] rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium capitalize">{data.current.description}</p>
                  <p className="text-6xl font-bold mt-1">{data.current.temp}°</p>
                  <p className="text-white/60 text-sm mt-1">Sensação {data.current.feels_like}°C</p>
                </div>
                <div className="text-right">
                  {getWeatherIcon(data.current.icon)}
                  <p className="text-white/70 text-xs mt-2 flex items-center gap-1"><MapPin size={12} />{data.city}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/20">
                <div className="text-center">
                  <Droplets size={18} className="mx-auto text-white/70" />
                  <p className="text-sm font-semibold mt-1">{data.current.humidity}%</p>
                  <p className="text-[11px] text-white/50">Umidade</p>
                </div>
                <div className="text-center">
                  <Wind size={18} className="mx-auto text-white/70" />
                  <p className="text-sm font-semibold mt-1">{data.current.wind_speed} km/h</p>
                  <p className="text-[11px] text-white/50">Vento</p>
                </div>
                <div className="text-center">
                  <CloudRain size={18} className="mx-auto text-white/70" />
                  <p className="text-sm font-semibold mt-1">{data.current.pop}%</p>
                  <p className="text-[11px] text-white/50">Chuva</p>
                </div>
              </div>
            </div>

            {/* Agro tips */}
            {data.tips.length > 0 && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-semibold text-sm mb-3 text-foreground">🌾 Dicas para o campo hoje</h3>
                <div className="space-y-2">
                  {data.tips.map((tip, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{tip}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 7 day forecast */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-sm mb-4 text-foreground">Previsão 5 dias</h3>
              <div className="space-y-3">
                {data.forecast.map((day, i) => {
                  const d = new Date(day.date + "T12:00:00");
                  const dayName = i === 0 ? "Hoje" : weekDays[d.getDay()];
                  return (
                    <div key={day.date} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm font-medium w-12">{dayName}</span>
                      <div className="flex items-center gap-2">
                        {getSmallWeatherIcon(day.icon)}
                        <span className="text-xs text-muted-foreground w-16 truncate capitalize">{day.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CloudRain size={12} className="text-blue-400" />
                        <span className="text-xs text-muted-foreground w-8">{Math.round(day.pop * 100)}%</span>
                      </div>
                      <div className="text-sm text-right">
                        <span className="font-medium">{Math.round(day.temp_max)}°</span>
                        <span className="text-muted-foreground ml-1">{Math.round(day.temp_min)}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

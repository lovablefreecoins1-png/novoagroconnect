import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, User, CheckCircle, MessageCircle, Eye, Loader2, Wrench, SlidersHorizontal, Plus } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryChips from "@/components/CategoryChips";
import { sortOptions, serviceCategories } from "@/data/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/logo-agroconnect.png";

interface ProviderWithProfile {
  id: string;
  user_id: string;
  category: string | null;
  bio: string | null;
  available: string | null;
  radius_km: number | null;
  verified: boolean | null;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    lat: number | null;
    lng: number | null;
  } | null;
  distance?: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("online");
  const [radiusKm, setRadiusKm] = useState(80);
  const [showFilters, setShowFilters] = useState(false);
  const [providers, setProviders] = useState<ProviderWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // User location
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  useEffect(() => {
    if (user?.lat && user?.lng) {
      setUserLat(user.lat);
      setUserLng(user.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => { setUserLat(-21.0922); setUserLng(-45.5631); },
        { timeout: 10000 }
      );
    } else {
      setUserLat(-21.0922); setUserLng(-45.5631);
    }
  }, [user]);

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    setLoading(true);
    const { data } = await supabase.from("providers").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url, phone, city, state, lat, lng").in("id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      setProviders(data.map(p => ({ ...p, profile: profileMap.get(p.user_id) || null })));
    } else {
      setProviders([]);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let results = providers.map(p => {
      if (userLat && userLng && p.profile?.lat && p.profile?.lng) {
        return { ...p, distance: haversineKm(userLat, userLng, p.profile.lat, p.profile.lng) };
      }
      return { ...p, distance: undefined };
    });

    // Category filter - match against group name or service
    if (category) {
      const catLower = category.toLowerCase();
      const matchingGroup = serviceCategories.find(g => g.group.toLowerCase() === catLower);
      results = results.filter(p => {
        const pCat = (p.category || "").toLowerCase();
        if (pCat.includes(catLower)) return true;
        if (matchingGroup) return matchingGroup.services.some(s => pCat.includes(s.toLowerCase()));
        return false;
      });
    }

    // Text search
    if (search) {
      const lower = search.toLowerCase();
      results = results.filter(p =>
        (p.profile?.full_name || "").toLowerCase().includes(lower) ||
        (p.category || "").toLowerCase().includes(lower) ||
        (p.profile?.city || "").toLowerCase().includes(lower) ||
        (p.bio || "").toLowerCase().includes(lower)
      );
    }

    // Radius filter
    results = results.filter(p => {
      if (p.distance === undefined) return true;
      return p.distance <= radiusKm;
    });

    // Sort
    results.sort((a, b) => {
      if (sort === "distance") return (a.distance ?? 999) - (b.distance ?? 999);
      if (sort === "online") {
        const order: Record<string, number> = { now: 0, week: 1, busy: 2 };
        return (order[a.available || "busy"] || 2) - (order[b.available || "busy"] || 2);
      }
      return 0;
    });

    return results;
  }, [search, category, sort, providers, userLat, userLng, radiusKm]);

  const dispLabel = (a: string | null) => a === "now" ? "Disponível" : a === "week" ? "Esta semana" : "Ocupado";
  const dispBg = (a: string | null) => a === "now" ? "bg-green-100 text-green-700" : a === "week" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  const dispDot = (a: string | null) => a === "now" ? "bg-green-500" : a === "week" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="min-h-screen pb-20 md:pb-6 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Voltar">
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <img src={logo} alt="AgroConnect" className="h-8 w-8" width={32} height={32} />
              <span className="font-medium text-lg">Buscar</span>
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${showFilters ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <SlidersHorizontal size={20} />
            </button>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </header>

      {/* Offer Service CTA */}
      <div className="max-w-2xl mx-auto px-4 mt-3">
        {user && (user.role === "prestador" || user.role === "ambos") ? (
          <Link to="/meus-servicos"
            className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors active:scale-[0.99]">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Wrench size={20} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">Gerenciar meus serviços</p>
              <p className="text-xs text-muted-foreground">Veja seus contratos e serviços ativos</p>
            </div>
          </Link>
        ) : (
          <Link to="/cadastro/prestador"
            className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors active:scale-[0.99]">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Wrench size={20} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">Sou prestador — Anunciar serviço agora</p>
              <p className="text-xs text-muted-foreground">Cadastre-se e apareça para produtores da região</p>
            </div>
          </Link>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="max-w-2xl mx-auto px-4 mt-3 space-y-3">
          <div className="card-agro space-y-3">
            <p className="text-sm font-medium">Raio de distância</p>
            <div className="flex gap-2 flex-wrap">
              {[30, 50, 80, 100, 200].map(r => (
                <button key={r} onClick={() => setRadiusKm(r)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${radiusKm === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-2xl mx-auto px-4 mt-3">
        <CategoryChips selected={category} onSelect={setCategory} />
      </div>

      {/* Sort */}
      <div className="max-w-2xl mx-auto mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {sortOptions.map((opt) => (
          <button key={opt.value} onClick={() => setSort(opt.value)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[15px] transition-all duration-100 active:scale-[0.98] ${
              sort === opt.value ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        <p className="text-[15px] text-muted-foreground">
          {filtered.length} prestador{filtered.length !== 1 ? "es" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          {` (raio de ${radiusKm} km)`}
        </p>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-[16px] text-foreground font-medium">Nenhum prestador encontrado</p>
            <p className="text-[15px] text-muted-foreground mt-1.5">Tente aumentar o raio ou mudar os filtros.</p>
          </div>
        ) : (
          filtered.map((p) => {
            const profile = p.profile;
            const phone = profile?.phone?.replace(/\D/g, "") || "";
            const whatsappUrl = phone ? `https://wa.me/55${phone}?text=${encodeURIComponent(`Olá ${profile?.full_name || ""}, encontrei você no AgroConnect e gostaria de um orçamento.`)}` : "";

            return (
              <div key={p.id} className="card-agro">
                <div className="flex gap-3.5">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name || ""} className="h-14 w-14 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <User size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-[16px] text-foreground truncate">{profile?.full_name || "Prestador"}</h3>
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${dispBg(p.available)}`}>
                        <span className={`w-2 h-2 rounded-full ${dispDot(p.available)}`} />
                        {dispLabel(p.available)}
                      </span>
                    </div>
                    <p className="text-[15px] text-muted-foreground mt-0.5">{p.category || "Serviços gerais"}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {p.verified && (
                        <span className="badge-verified">
                          <CheckCircle size={12} /> Verificado ✓
                        </span>
                      )}
                      {p.distance !== undefined && (
                        <span className="text-xs text-primary">~{Math.round(p.distance)} km</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border mt-3.5 pt-3">
                  <div className="flex items-center gap-3 text-[15px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin size={14} />
                      {profile?.city || "Sul de Minas"}, {profile?.state || "MG"}
                    </span>
                    {p.radius_km && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">Raio: {p.radius_km} km</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-border mt-3 pt-3 flex gap-2.5">
                  <Link to={`/perfil-prestador/${p.id}`} className="btn-secondary flex-1 !min-h-[48px] !text-[15px]">
                    <Eye size={18} /> Ver perfil
                  </Link>
                  {whatsappUrl ? (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1 !min-h-[48px] !text-[15px]">
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                  ) : (
                    <button disabled className="btn-primary flex-1 !min-h-[48px] !text-[15px] opacity-50">
                      <MessageCircle size={18} /> Sem telefone
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB - Anunciar Serviço */}
      <Link
        to={user ? "/meus-servicos" : "/cadastro/prestador"}
        className="fixed bottom-24 right-5 z-30 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.96] md:bottom-8"
      >
        <Plus size={20} /> Anunciar Serviço
      </Link>
    </div>
  );
}

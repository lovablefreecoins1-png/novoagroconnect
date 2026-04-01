import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Store, MapPin, Search, User } from "lucide-react";
import { marketplaceCategories } from "@/data/categories";
import { supabase } from "@/integrations/supabase/client";

interface Anuncio {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_type: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  photos: string[] | null;
  whatsapp: string | null;
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

export default function Marketplace() {
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnuncios();
  }, [catFilter]);

  const loadAnuncios = async () => {
    setLoading(true);
    let query = supabase.from("anuncios").select("*").eq("status", "active").order("created_at", { ascending: false });
    if (catFilter) query = query.eq("category", catFilter);
    const { data } = await query;
    const ads = (data as Anuncio[]) || [];
    if (ads.length > 0) {
      const userIds = [...new Set(ads.map(a => a.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      ads.forEach(a => { a.profile = profileMap.get(a.user_id) || null; });
    }
    setAnuncios(ads);
    setLoading(false);
  };

  const filtered = anuncios.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (a: Anuncio) => {
    if (a.price_type === "negotiable" || !a.price) return "A combinar";
    return `R$ ${a.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="text-muted-foreground hover:text-foreground" aria-label="Voltar"><ArrowLeft size={24} /></button>
            <h1 className="text-lg font-medium">Marketplace</h1>
          </div>
          <Link to="/marketplace/novo" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]">
            <Plus size={18} /> Anunciar
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="input-field !pl-10 !min-h-[48px]"
            placeholder="Buscar anúncios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setCatFilter(null)}
          className={`text-[14px] px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
            !catFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >Todos</button>
        {marketplaceCategories.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(catFilter === c ? null : c)}
            className={`text-[14px] px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
              catFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >{c}</button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Carregando anúncios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-[15px] font-medium text-foreground">Nenhum anúncio encontrado</p>
            <p className="text-[15px] text-muted-foreground mt-1">Seja o primeiro a anunciar aqui.</p>
            <Link to="/marketplace/novo" className="btn-primary mt-4 inline-flex text-sm !min-h-[48px]">
              <Plus size={18} /> Criar anúncio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => (
              <Link key={a.id} to={`/marketplace/${a.id}`} className="card-agro !p-0 overflow-hidden group">
                {a.photos && a.photos.length > 0 ? (
                  <img src={a.photos[0]} alt={a.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Store size={32} className="text-muted-foreground/40" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {a.profile?.avatar_url ? <img src={a.profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" /> : <User size={12} className="text-muted-foreground" />}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{a.profile?.full_name || "Anunciante"}</span>
                  </div>
                  {a.category && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{a.category}</span>
                  )}
                  <h3 className="font-medium text-[15px] mt-2 line-clamp-1">{a.title}</h3>
                  <p className="text-lg font-semibold text-primary mt-1">
                    {formatPrice(a)}
                  </p>
                  {a.city && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <MapPin size={12} /> {a.city}{a.state ? `, ${a.state}` : ""}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

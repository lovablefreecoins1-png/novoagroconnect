import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, MapPin, MessageCircle, Clock, User, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const availabilityConfig = {
  now: { label: "Disponível agora", className: "bg-green-100 text-green-700" },
  week: { label: "Esta semana", className: "bg-amber-100 text-amber-700" },
  busy: { label: "Ocupado", className: "bg-red-100 text-red-700" },
} as const;

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: prov } = await supabase.from("providers").select("*").eq("id", id).maybeSingle();
      if (prov) {
        setProvider(prov);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", prov.user_id).maybeSingle();
        setProfile(prof);
      } else {
        const { data: prov2 } = await supabase.from("providers").select("*").eq("user_id", id).maybeSingle();
        if (prov2) {
          setProvider(prov2);
          const { data: prof } = await supabase.from("profiles").select("*").eq("id", prov2.user_id).maybeSingle();
          setProfile(prof);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-muted-foreground" size={28} /></div>;

  if (!provider || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Prestador não encontrado.</p>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4 inline-flex">Voltar</button>
        </div>
      </div>
    );
  }

  const phone = profile.phone || "";
  const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${profile.full_name}, encontrei você no AgroConnect e gostaria de um orçamento.`)}`;
  const avail = availabilityConfig[(provider.available as keyof typeof availabilityConfig) || "now"];

  return (
    <div className="min-h-screen pb-24">
      {/* Banner */}
      <div className="relative h-48 bg-primary/20">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 to-foreground/50" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Profile header */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4">
          <div className="h-24 w-24 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <User size={36} className="text-muted-foreground" />
            )}
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-medium truncate">{profile.full_name || "Prestador"}</h1>
              {provider.verified && <span className="badge-verified"><CheckCircle size={12} /> Verificado</span>}
            </div>
            <p className="text-sm text-muted-foreground">{provider.category || "Serviço Geral"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground"><MapPin size={16} /> {profile.city || "—"}, {profile.state || "—"}</div>
          {provider.radius_km && <div className="flex items-center gap-1 text-muted-foreground"><Clock size={16} /> Raio de {provider.radius_km} km</div>}
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${avail.className}`}>{avail.label}</span>
        </div>

        {provider.bio && <p className="mt-4 text-sm leading-relaxed">{provider.bio}</p>}

        {provider.photos && provider.photos.length > 0 && (
          <div className="mt-6">
            <h2 className="text-base font-medium mb-3">Trabalhos realizados</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {provider.photos.map((photo: string, i: number) => (
                <img key={i} src={photo} alt={`Trabalho ${i + 1}`} className="h-40 w-56 rounded-lg object-cover flex-shrink-0" loading="lazy" />
              ))}
            </div>
          </div>
        )}

        {phone && (
          <div className="mt-6 card-agro">
            <p className="text-sm text-muted-foreground">Telefone: {phone}</p>
          </div>
        )}
      </div>

      {/* Single WhatsApp CTA - fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-20" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}>
        <div className="max-w-2xl mx-auto">
          {phone ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition-colors active:scale-[0.98] shadow-lg">
              <MessageCircle size={22} /> Chamar no WhatsApp
            </a>
          ) : (
            <button disabled className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-medium opacity-60">
              Sem WhatsApp disponível
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

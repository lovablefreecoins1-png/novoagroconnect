import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Trash2, Store, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

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
}

export default function MarketplaceDetalhe() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) loadAnuncio();
  }, [id]);

  const loadAnuncio = async () => {
    const { data } = await supabase.from("anuncios").select("*").eq("id", id).single();
    setAnuncio(data as Anuncio | null);
    if (data?.user_id) {
      const { data: p } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", data.user_id).maybeSingle();
      setProfile(p);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!anuncio) return;
    setDeleting(true);
    const { error } = await supabase.from("anuncios").delete().eq("id", anuncio.id);
    setDeleting(false);
    if (error) { toast({ title: "Erro ao excluir.", variant: "destructive" }); return; }
    toast({ title: "Anúncio excluído." });
    navigate("/marketplace");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;

  if (!anuncio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Anúncio não encontrado.</p>
          <Link to="/marketplace" className="btn-primary mt-4 inline-flex">Voltar</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === anuncio.user_id;
  const phone = anuncio.whatsapp?.replace(/\D/g, "") || "";
  const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(`Olá, vi seu anúncio "${anuncio.title}" no AgroConnect e tenho interesse.`)}`;

  const formatPrice = () => {
    if (anuncio.price_type === "negotiable" || !anuncio.price) return "A combinar";
    return `R$ ${anuncio.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-medium truncate flex-1">{anuncio.title}</h1>
          {isOwner && (
            <button onClick={() => setShowDeleteModal(true)} className="p-2 text-destructive hover:bg-destructive/10 rounded-xl">
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {anuncio.photos && anuncio.photos.length > 0 ? (
          <img src={anuncio.photos[0]} alt={anuncio.title} className="w-full aspect-[4/3] object-cover" />
        ) : (
          <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
            <Store size={48} className="text-muted-foreground/30" />
          </div>
        )}

        <div className="px-4 py-4 space-y-4">
          <div>
            {anuncio.category && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{anuncio.category}</span>}
            <h2 className="text-xl font-medium mt-2">{anuncio.title}</h2>
            <p className="text-2xl font-medium text-primary mt-1">{formatPrice()}</p>
          </div>

          {anuncio.description && <p className="text-sm text-muted-foreground">{anuncio.description}</p>}

          {profile && (
            <div className="card-agro flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <User size={20} className="text-muted-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium">{profile.full_name || "Anunciante"}</p>
                <p className="text-xs text-muted-foreground">{anuncio.city || "Sul de Minas"}, {anuncio.state || "MG"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-20" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}>
        <div className="max-w-2xl mx-auto">
          {phone ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-green-600 text-white font-semibold text-lg hover:bg-green-700 transition-colors active:scale-[0.98] shadow-lg">
              <MessageCircle size={22} /> Chamar no WhatsApp
            </a>
          ) : (
            <button disabled className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-medium text-lg opacity-60">
              Sem WhatsApp disponível
            </button>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="card-agro max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-medium">Excluir anúncio?</h3>
            <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-outline flex-1 !min-h-[44px]">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-xl bg-destructive text-destructive-foreground font-medium min-h-[44px] disabled:opacity-50 active:scale-[0.98]">
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

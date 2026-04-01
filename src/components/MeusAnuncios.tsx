import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Store, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Anuncio {
  id: string;
  title: string;
  price: number | null;
  price_type: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  photos: string[] | null;
  status: string | null;
  created_at: string;
}

export default function MeusAnuncios({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadAnuncios();
  }, [userId]);

  const loadAnuncios = async () => {
    const { data } = await supabase
      .from("anuncios")
      .select("id, title, price, price_type, category, city, state, photos, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setAnuncios((data as Anuncio[]) || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("anuncios").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir.", variant: "destructive" });
    } else {
      setAnuncios(prev => prev.filter(a => a.id !== id));
      toast({ title: "Anúncio excluído." });
    }
    setDeletingId(null);
  };

  const formatPrice = (a: Anuncio) => {
    if (a.price_type === "negotiable" || !a.price) return "A combinar";
    return `R$ ${a.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  if (loading) return <p className="text-muted-foreground py-8 text-center">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-lg">Meus Anúncios</h2>
        <Link to="/marketplace/novo" className="btn-primary !min-h-[40px] text-sm !px-4">
          <Plus size={16} /> Novo
        </Link>
      </div>

      {anuncios.length === 0 ? (
        <div className="text-center py-12">
          <Store size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-medium">Nenhum anúncio publicado</p>
          <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro anúncio no marketplace.</p>
          <Link to="/marketplace/novo" className="btn-primary mt-4 inline-flex text-sm !min-h-[44px]">
            <Plus size={16} /> Criar anúncio
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {anuncios.map(a => (
            <div key={a.id} className="card-agro flex items-start gap-3">
              {a.photos && a.photos[0] ? (
                <img src={a.photos[0]} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Store size={20} className="text-muted-foreground/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link to={`/marketplace/${a.id}`} className="font-medium text-[15px] hover:underline line-clamp-1">{a.title}</Link>
                <p className="text-sm text-primary font-medium">{formatPrice(a)}</p>
                {a.city && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {a.city}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                disabled={deletingId === a.id}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-xl flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Camera, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { marketplaceCategories } from "@/data/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export default function MarketplaceNovo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [categoria, setCategoria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [preco, setPreco] = useState("");
  const [aCombinar, setACombinar] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (user) setWhatsapp(user.phone || "");
  }, [user, authLoading]);

  const handleFoto = (file: File) => {
    if (fotos.length >= 5) return;
    const reader = new FileReader();
    reader.onload = () => setFotos(prev => [...prev, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!categoria) e.categoria = "Selecione uma categoria.";
    if (!titulo.trim()) e.titulo = "Este campo é obrigatório.";
    if (!descricao.trim()) e.descricao = "Este campo é obrigatório.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (!user) { toast({ title: "Faça login para anunciar.", variant: "destructive" }); return; }

    setSubmitting(true);

    // Parse price as number
    const priceNum = aCombinar ? null : (parseFloat(preco.replace(/[^\d.,]/g, "").replace(",", ".")) || null);

    const { error } = await supabase.from("anuncios").insert({
      title: titulo.trim(),
      description: descricao.trim(),
      category: categoria,
      price: priceNum,
      price_type: aCombinar ? "negotiable" : "fixed",
      photos: fotos.length > 0 ? fotos : null,
      whatsapp: whatsapp || user.phone || null,
      city: user.city || "Boa Esperança",
      state: user.state || "MG",
      user_id: user.id,
      status: "active",
    });
    setSubmitting(false);

    if (error) {
      console.error("Insert error:", error);
      toast({ title: "Erro ao publicar anúncio. Tente novamente.", variant: "destructive" });
      return;
    }

    toast({ title: "Anúncio publicado com sucesso! 🎉" });
    navigate("/marketplace");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/marketplace" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={24} /></Link>
          <h1 className="text-lg font-medium">Novo anúncio</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Categoria</label>
          <select className="input-field" value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option value="">Selecione...</option>
            {marketplaceCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.categoria && <p className="text-sm text-destructive mt-1">{errors.categoria}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Título ({titulo.length}/60)</label>
          <input className="input-field" value={titulo} onChange={e => setTitulo(e.target.value.slice(0, 60))} placeholder="Ex: Bezerros Nelore - Lote de 10" />
          {errors.titulo && <p className="text-sm text-destructive mt-1">{errors.titulo}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Descrição ({descricao.length}/300)</label>
          <textarea className="input-field !min-h-[80px] resize-none" value={descricao} onChange={e => setDescricao(e.target.value.slice(0, 300))} maxLength={300} placeholder="Descreva seu anúncio..." />
          {errors.descricao && <p className="text-sm text-destructive mt-1">{errors.descricao}</p>}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Fotos (até 5)</label>
          <div className="grid grid-cols-3 gap-2">
            {fotos.map((f, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={f} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setFotos(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/70 text-background text-xs flex items-center justify-center">✕</button>
              </div>
            ))}
            {fotos.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50">
                <Camera size={24} className="text-muted-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFoto(f); }} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Preço</label>
          <input className="input-field" value={preco} onChange={e => setPreco(e.target.value)} placeholder="R$ 0,00" disabled={aCombinar} inputMode="numeric" />
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input type="checkbox" checked={aCombinar} onChange={e => setACombinar(e.target.checked)} />
            A combinar
          </label>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">WhatsApp para contato</label>
          <input className="input-field" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" inputMode="tel" />
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full mt-4 disabled:opacity-50">
          {submitting ? "Publicando..." : "Publicar anúncio"}
        </button>
      </div>
    </div>
  );
}

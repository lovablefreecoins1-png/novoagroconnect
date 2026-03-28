import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Package, MapPin, Loader2, Edit2, X, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EmptyState from "@/components/EmptyState";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  category: string | null;
  min_stock: number | null;
  notes: string | null;
}

const categories = ["Insumos", "Ferramentas", "Sementes", "Fertilizantes", "Defensivos", "Equipamentos", "Outros"];

export default function Fazenda() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("un");
  const [cat, setCat] = useState("");
  const [minStock, setMinStock] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<"estoque" | "mapa">("estoque");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) loadItems();
  }, [user]);

  const loadItems = async () => {
    if (!user) return;
    setLoadingItems(true);
    const { data } = await supabase.from("inventory").select("*").eq("user_id", user.id).order("name");
    setItems((data || []) as InventoryItem[]);
    setLoadingItems(false);
  };

  const handleAdd = async () => {
    if (!user || !name.trim()) { toast({ title: "Informe o nome.", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("inventory").insert({
      user_id: user.id, name: name.trim(), quantity: Number(qty) || 0, unit: unit || "un",
      category: cat || null, min_stock: minStock ? Number(minStock) : null, notes: notes || null,
    });
    if (error) toast({ title: "Erro ao salvar.", variant: "destructive" });
    else { toast({ title: "Item adicionado!" }); setShowAdd(false); setName(""); setQty(""); setUnit("un"); setCat(""); setMinStock(""); setNotes(""); loadItems(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("inventory").delete().eq("id", id);
    toast({ title: "Item removido." });
    loadItems();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground animate-pulse">Carregando...</p></div>;
  if (!user) return null;

  const lowStock = items.filter(i => i.min_stock && i.quantity <= i.min_stock);

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-medium flex-1">Minha Fazenda</h1>
        </div>
      </header>

      {/* View tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-3 flex gap-2">
        <button onClick={() => setActiveView("estoque")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeView === "estoque" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          <Package size={14} className="inline mr-1.5" /> Estoque
        </button>
        <button onClick={() => setActiveView("mapa")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeView === "mapa" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          <MapPin size={14} className="inline mr-1.5" /> Mapa Satélite
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {activeView === "estoque" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{items.length} ite{items.length !== 1 ? "ns" : "m"} no estoque</p>
              <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]">
                <Plus size={16} /> Adicionar
              </button>
            </div>

            {lowStock.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm font-medium text-amber-800">⚠️ Estoque baixo ({lowStock.length})</p>
                <p className="text-xs text-amber-600 mt-0.5">{lowStock.map(i => i.name).join(", ")}</p>
              </div>
            )}

            {loadingItems ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div> :
            items.length === 0 ? <EmptyState icon={Package} title="Estoque vazio" description="Adicione itens ao seu controle de estoque." /> :
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="card-agro flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[15px] truncate">{item.name}</h3>
                      {item.category && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{item.category}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className={`font-medium ${item.min_stock && item.quantity <= item.min_stock ? "text-amber-600" : "text-foreground"}`}>
                        {item.quantity} {item.unit}
                      </span>
                      {item.min_stock && <span className="text-xs text-muted-foreground">Mín: {item.min_stock}</span>}
                    </div>
                    {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-destructive/60 hover:text-destructive transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>}
          </>
        )}

        {activeView === "mapa" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Visualize sua propriedade via satélite.</p>
            {user.lat && user.lng ? (
              <div className="rounded-2xl overflow-hidden border border-border">
                <iframe
                  src={`https://www.google.com/maps?q=${user.lat},${user.lng}&t=k&z=16&output=embed`}
                  className="w-full h-[400px]"
                  allowFullScreen
                  loading="lazy"
                  title="Mapa Satélite"
                />
              </div>
            ) : (
              <div className="text-center py-16">
                <MapPin size={48} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-medium">Localização não cadastrada</p>
                <p className="text-sm text-muted-foreground mt-1">Atualize seu perfil com a localização da fazenda.</p>
                <button onClick={() => navigate("/perfil")} className="btn-primary mt-4 inline-flex text-sm">
                  Ir para o perfil
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add item modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <h3 className="text-lg font-medium">Novo Item</h3>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nome *</label>
              <input type="text" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Adubo NPK" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Quantidade</label>
                <input type="number" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={qty} onChange={e => setQty(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Unidade</label>
                <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={unit} onChange={e => setUnit(e.target.value)}>
                  {["un", "kg", "L", "sc", "t", "m", "m²", "ha"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Categoria</label>
              <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={cat} onChange={e => setCat(e.target.value)}>
                <option value="">Selecione...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Estoque mínimo</label>
              <input type="number" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="Opcional" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Observações</label>
              <textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[60px] resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button onClick={handleAdd} disabled={saving || !name.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
              <Check size={18} /> {saving ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

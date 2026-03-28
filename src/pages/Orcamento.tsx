import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Camera, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockProviders } from "@/data/mockData";

export default function Orcamento() {
  const { prestadorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const provider = mockProviders.find(p => p.id === prestadorId);

  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [data, setData] = useState("");

  const handleSubmit = () => {
    if (!descricao.trim()) return;
    toast({ title: "Pedido enviado!", description: "O profissional vai te chamar em breve." });
    navigate(`/chat/ch1`);
  };

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-[15px] text-muted-foreground">Prestador não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to={`/prestador/${provider.id}`} className="text-muted-foreground hover:text-foreground p-1" aria-label="Voltar">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-medium">Solicitar orçamento</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="card-agro flex items-center gap-3.5">
          <img src={provider.photo} alt={provider.name} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p className="text-[15px] font-medium">{provider.name}</p>
            <p className="text-[14px] text-muted-foreground">{provider.category}</p>
          </div>
        </div>

        <div>
          <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">
            Descreva o que você precisa ({descricao.length}/300)
          </label>
          <textarea className="input-field !min-h-[120px] resize-none" value={descricao}
            onChange={e => setDescricao(e.target.value.slice(0, 300))} maxLength={300}
            placeholder="Ex: Preciso de vacinação para 50 cabeças de gado nelore..." />
        </div>

        <div className="flex gap-3">
          <label className="btn-secondary flex-1 cursor-pointer !min-h-[48px] !text-[15px]">
            <Camera size={18} /> Adicionar foto
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) { const r = new FileReader(); r.onload = () => setFoto(r.result as string); r.readAsDataURL(f); }
            }} />
          </label>
          <div className="flex-1">
            <input type="date" className="input-field !min-h-[48px] text-[15px]" value={data} onChange={e => setData(e.target.value)} />
          </div>
        </div>

        {foto && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden">
            <img src={foto} alt="Anexo" className="w-full h-full object-cover" />
            <button onClick={() => setFoto(null)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-foreground/70 text-background text-xs flex items-center justify-center">✕</button>
          </div>
        )}

        <button onClick={handleSubmit} className="btn-primary w-full" disabled={!descricao.trim()}>
          Enviar solicitação
        </button>
      </div>
    </div>
  );
}

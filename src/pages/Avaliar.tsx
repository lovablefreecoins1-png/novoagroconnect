import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockProviders } from "@/data/mockData";

const labels = ["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"];

export default function Avaliar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const provider = mockProviders[0];

  const [rating, setRating] = useState(0);
  const [cumprido, setCumprido] = useState<boolean | null>(null);
  const [comentario, setComentario] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    toast({ title: "Avaliação publicada. Obrigado pela sua opinião!" });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary-bg))] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-primary">✓</span>
          </div>
          <h2 className="text-xl font-medium mb-2">Avaliação enviada!</h2>
          <p className="text-[15px] text-muted-foreground mb-6">Obrigado por avaliar. Sua opinião ajuda outros produtores.</p>
          <button onClick={() => navigate("/buscar")} className="btn-primary">Voltar ao início</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/buscar" className="text-muted-foreground hover:text-foreground p-1" aria-label="Voltar">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-medium">Avaliar serviço</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h2 className="text-xl font-medium text-center">Como foi o serviço?</h2>

        {provider && (
          <div className="card-agro flex items-center gap-3.5">
            <img src={provider.photo} alt={provider.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="text-[15px] font-medium">{provider.name}</p>
              <p className="text-[14px] text-muted-foreground">{provider.category}</p>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="flex justify-center gap-2.5">
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} onClick={() => setRating(i)} aria-label={`${i} estrelas`}
                className="p-1 active:scale-[0.95] transition-transform">
                <Star size={40} className={`transition-colors ${i <= rating ? "fill-secondary text-secondary" : "text-border"}`} />
              </button>
            ))}
          </div>
          {rating > 0 && <p className="text-[15px] text-muted-foreground mt-2">{labels[rating]}</p>}
        </div>

        <div>
          <p className="text-[15px] font-medium mb-3">O serviço foi realizado conforme combinado?</p>
          <div className="flex gap-3">
            <button onClick={() => setCumprido(true)}
              className={`flex-1 p-4 rounded-xl border text-[15px] transition-all active:scale-[0.98] ${
                cumprido === true ? "border-primary bg-[hsl(var(--primary-bg))]" : "border-border"
              }`}>
              Sim
            </button>
            <button onClick={() => setCumprido(false)}
              className={`flex-1 p-4 rounded-xl border text-[15px] transition-all active:scale-[0.98] ${
                cumprido === false ? "border-destructive bg-destructive/5" : "border-border"
              }`}>
              Não
            </button>
          </div>
        </div>

        <div>
          <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">
            Conte mais (opcional) ({comentario.length}/200)
          </label>
          <textarea className="input-field !min-h-[80px] resize-none" value={comentario}
            onChange={e => setComentario(e.target.value.slice(0, 200))} maxLength={200}
            placeholder="Como foi sua experiência?" />
        </div>

        <button onClick={handleSubmit} className="btn-primary w-full" disabled={rating === 0}>
          Enviar avaliação
        </button>
      </div>
    </div>
  );
}

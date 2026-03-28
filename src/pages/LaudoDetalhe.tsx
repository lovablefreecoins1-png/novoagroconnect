import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FileText, Star, ArrowLeft, MapPin, Camera, Calendar } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { laudosMock } from "@/data/laudosData";
import { toast } from "sonner";

export default function LaudoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const laudo = laudosMock.find(l => l.id === id);
  const [descricao, setDescricao] = useState("");

  if (!laudo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Laudo não encontrado.</p>
          <Link to="/marketplace/laudos" className="btn-primary mt-4 inline-flex">Voltar</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    toast.success("Laudo solicitado! Você receberá em até 48h.");
    navigate("/marketplace/laudos");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEOHead title={`${laudo.tipo} — AgroConnect`} description={laudo.descricao} />

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/marketplace/laudos" className="p-2 -ml-2"><ArrowLeft size={20} /></Link>
          <h1 className="text-lg font-medium">Solicitar Laudo</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        <div className="card-agro">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="font-medium">{laudo.tipo}</h2>
              <p className="text-sm text-muted-foreground">por {laudo.agrônomo}, {laudo.crea}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="fill-secondary text-secondary" />
                <span className="text-sm">{laudo.avaliacao} ({laudo.totalLaudos} laudos)</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{laudo.descricao}</p>
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            <span>Prazo: até {laudo.prazo}</span>
            <span>{laudo.formato}</span>
          </div>
        </div>

        <div className="card-agro space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Localização da propriedade</label>
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="CEP da propriedade" />
              <button className="btn-outline !min-h-[48px] gap-1 text-sm">
                <MapPin size={16} /> GPS
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Descreva o objetivo do laudo</label>
            <textarea className="input-field !h-24 resize-none" placeholder="Ex: Preciso de análise de solo para planejar a adubação da próxima safra de soja..." maxLength={300} value={descricao} onChange={e => setDescricao(e.target.value)} />
            <p className="text-xs text-muted-foreground text-right mt-1">{descricao.length}/300</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Fotos da área (opcional)</label>
            <button className="btn-outline w-full gap-2 text-sm">
              <Camera size={16} /> Adicionar fotos
            </button>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Prazo desejado</label>
            <input type="date" className="input-field" />
          </div>
        </div>

        <div className="card-agro bg-primary/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="text-xl font-medium text-primary">R$ {laudo.preco}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Pagamento processado com segurança. Laudo enviado por e-mail e disponível no app.</p>
        </div>

        <button onClick={handleSubmit} className="btn-primary w-full">
          Solicitar e pagar — R$ {laudo.preco}
        </button>
      </div>
    </div>
  );
}

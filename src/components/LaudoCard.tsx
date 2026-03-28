import { FileText, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface LaudoCardProps {
  laudo: {
    id: string;
    tipo: string;
    agrônomo: string;
    crea: string;
    avaliacao: number;
    totalLaudos: number;
    prazo: string;
    formato: string;
    preco: number;
    descricao: string;
    cidade: string;
  };
}

export default function LaudoCard({ laudo }: LaudoCardProps) {
  return (
    <div className="card-agro">
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary-bg))] flex items-center justify-center shrink-0">
          <FileText size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[15px]">{laudo.tipo}</h3>
          <p className="text-[14px] text-muted-foreground mt-0.5">por: {laudo.agrônomo}, {laudo.crea}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2.5 text-[14px] text-muted-foreground">
        <Star size={14} className="fill-secondary text-secondary" />
        <span>{laudo.avaliacao}</span>
        <span>({laudo.totalLaudos} laudos emitidos)</span>
      </div>
      <p className="text-[14px] text-muted-foreground mt-2">Prazo: até {laudo.prazo} · {laudo.formato}</p>
      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border">
        <span className="text-xl font-medium text-primary">R$ {laudo.preco}</span>
        <Link to={`/marketplace/laudos/${laudo.id}`} className="btn-primary !min-h-[44px] !text-[15px] !px-5">
          Solicitar laudo
        </Link>
      </div>
    </div>
  );
}

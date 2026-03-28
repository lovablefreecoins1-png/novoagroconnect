import { Lock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface DemandaCardProps {
  demanda: {
    id: string;
    servico: string;
    cidade: string;
    estado: string;
    totalBuscas: number;
    periodo: string;
    desbloqueado: boolean;
  };
}

export default function DemandaCard({ demanda }: DemandaCardProps) {
  if (!demanda.desbloqueado) {
    return (
      <div className="card-agro border-dashed">
        <div className="flex items-start gap-3.5">
          <Lock size={20} className="text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-[15px] font-medium">{demanda.totalBuscas} produtores em {demanda.cidade}</p>
            <p className="text-[14px] text-muted-foreground mt-0.5">buscaram {demanda.servico} {demanda.periodo}</p>
          </div>
        </div>
        <div className="mt-3.5 space-y-1.5">
          <div className="h-5 bg-muted rounded w-3/4 blur-sm" />
          <div className="h-5 bg-muted rounded w-2/3 blur-sm" />
        </div>
        <Link to="/painel/plano" className="btn-primary w-full mt-4 !text-[15px]">
          Assinar premium para ver quem são
        </Link>
      </div>
    );
  }

  return (
    <div className="card-agro border-primary/20">
      <div className="flex items-start gap-3.5">
        <CheckCircle size={20} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-[15px] font-medium">{demanda.totalBuscas} produtores em {demanda.cidade}</p>
          <p className="text-[14px] text-muted-foreground mt-0.5">buscaram {demanda.servico} {demanda.periodo}</p>
        </div>
      </div>
      <div className="mt-3.5 space-y-2.5 text-[15px]">
        <p>Sebastião Costa · (34) 9XXXX-XXXX</p>
        <p>Maria das Graças · (34) 9XXXX-XXXX</p>
        {demanda.totalBuscas > 2 && <p className="text-muted-foreground">+ {demanda.totalBuscas - 2} mais</p>}
      </div>
      <button className="btn-primary w-full mt-4 !text-[15px]">Entrar em contato</button>
    </div>
  );
}

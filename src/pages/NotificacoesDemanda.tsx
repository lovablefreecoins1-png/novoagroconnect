import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";

export default function NotificacoesDemanda() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEOHead title="Demanda Local — AgroConnect" description="Veja quem está buscando seus serviços perto de você." />

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/painel" className="p-2 -ml-2" aria-label="Voltar"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-lg font-medium">Demanda na sua região</h1>
            <p className="text-[15px] text-muted-foreground">Veja quem está buscando seus serviços perto de você</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className="text-center py-16">
          <Bell size={48} className="mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-[15px] font-medium text-foreground">Nenhuma demanda na sua região</p>
          <p className="text-[15px] text-muted-foreground mt-1">Quando produtores buscarem serviços perto de você, as notificações aparecerão aqui.</p>
        </div>
      </div>
    </div>
  );
}

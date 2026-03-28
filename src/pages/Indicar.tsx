import { useState } from "react";
import { Link } from "react-router-dom";
import { Share2, Copy, CheckCircle, Clock, Users, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";

const indicacoesMock = [
  { id: "i1", nome: "Carlos Mendes", telefone: "(34) 9XXXX-XXXX", status: "cadastrado" as const, dataIndicacao: "2025-03-10", recompensa: null },
  { id: "i2", nome: "Rafael Lima", telefone: "(66) 9XXXX-XXXX", status: "assinou_premium" as const, dataIndicacao: "2025-02-20", recompensa: "1 mês grátis — creditado em março/2025" },
  { id: "i3", nome: "Ana Paula Ferreira", telefone: "(17) 9XXXX-XXXX", status: "aguardando" as const, dataIndicacao: "2025-03-20", recompensa: null },
];

const statusConfig = {
  aguardando: { label: "Aguardando", className: "bg-muted text-muted-foreground" },
  cadastrado: { label: "Quase lá!", className: "bg-secondary/20 text-secondary" },
  assinou_premium: { label: "Recompensa ganha!", className: "bg-primary/10 text-primary" },
};

export default function Indicar() {
  const refLink = "https://agroconnect.com.br/cadastro?ref=user123";

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    toast.success("Link de indicação copiado!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "AgroConnect",
        text: "Me indique no AgroConnect e encontre clientes rurais perto de você!",
        url: refLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEOHead title="Programa de Indicação — AgroConnect" description="Indique um colega prestador e ganhe 1 mês grátis de premium." />

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2"><ArrowLeft size={20} /></Link>
          <h1 className="text-lg font-medium">Programa de Indicação</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-6">
        <div className="card-agro bg-primary/5 border-primary/20 text-center py-8">
          <Users size={48} className="mx-auto text-primary" />
          <h2 className="text-xl font-medium mt-4">Indique um colega e ganhe 1 mês grátis</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">Compartilhe seu link. Quando o indicado criar conta premium, você ganha 1 mês grátis.</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Como funciona</h3>
          {[
            { step: "1", title: "Compartilhe seu link exclusivo", icon: Share2 },
            { step: "2", title: "Seu colega se cadastra e cria conta premium", icon: Users },
            { step: "3", title: "Você ganha 1 mês grátis automaticamente", icon: CheckCircle },
          ].map(s => (
            <div key={s.step} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">{s.step}</span>
              <p className="text-sm">{s.title}</p>
            </div>
          ))}
        </div>

        <div className="card-agro">
          <p className="text-sm font-medium mb-2">Seu link de indicação</p>
          <div className="flex gap-2">
            <input className="input-field flex-1 text-sm" readOnly value={refLink} />
            <button onClick={handleCopy} className="btn-outline !min-h-[48px] gap-1 text-sm">
              <Copy size={16} /> Copiar
            </button>
          </div>
          <button onClick={handleShare} className="btn-whatsapp w-full mt-3 gap-2">
            <Share2 size={18} /> Compartilhar no WhatsApp
          </button>
        </div>

        <div>
          <h3 className="font-medium mb-3">Suas indicações</h3>
          <div className="space-y-3">
            {indicacoesMock.map(ind => (
              <div key={ind.id} className="card-agro flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                  {ind.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{ind.nome}</p>
                  <p className="text-xs text-muted-foreground">{ind.telefone} · {new Date(ind.dataIndicacao).toLocaleDateString("pt-BR")}</p>
                  {ind.recompensa && <p className="text-xs text-primary mt-0.5">{ind.recompensa}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[ind.status].className}`}>
                  {statusConfig[ind.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleShare} className="fixed bottom-20 right-4 md:hidden btn-primary !rounded-full !px-5 shadow-lg gap-2">
        <Share2 size={18} /> Compartilhar meu link
      </button>
    </div>
  );
}

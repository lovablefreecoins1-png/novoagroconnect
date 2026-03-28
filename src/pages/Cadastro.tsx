import { Link } from "react-router-dom";
import { Tractor, Briefcase, Check, ArrowLeft, Users } from "lucide-react";
import logo from "@/assets/logo-agroconnect.png";

export default function Cadastro() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      <Link to="/" className="absolute top-4 left-4 text-muted-foreground hover:text-foreground p-1" aria-label="Voltar">
        <ArrowLeft size={24} />
      </Link>

      <img src={logo} alt="AgroConnect" className="h-14 w-14 mb-5" />
      <h1 className="text-[22px] font-medium text-center mb-1.5">Criar conta</h1>
      <p className="text-[15px] text-muted-foreground text-center mb-8">Como você quer usar o AgroConnect?</p>

      <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
        {/* Produtor */}
        <div className="card-agro flex flex-col items-center text-center p-6">
          <Tractor size={44} className="text-primary mb-4" />
          <h2 className="text-lg font-medium mb-2">Sou Produtor Rural</h2>
          <p className="text-[15px] text-muted-foreground mb-4">
            Encontro profissionais qualificados para minha propriedade
          </p>
          <ul className="text-[15px] text-left space-y-2.5 mb-6 w-full">
            {["Busca gratuita e ilimitada", "Avaliações de outros produtores", "Contato direto por WhatsApp", "Solicite orçamentos sem custo"].map(b => (
              <li key={b} className="flex items-center gap-2.5">
                <Check size={18} className="text-[hsl(var(--success))] flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link to="/cadastro/produtor" className="btn-primary w-full">
            Cadastrar como Produtor
          </Link>
        </div>

        {/* Prestador */}
        <div className="card-agro flex flex-col items-center text-center p-6">
          <Briefcase size={44} className="text-secondary mb-4" />
          <h2 className="text-lg font-medium mb-2">Ofereço Serviços</h2>
          <p className="text-[15px] text-muted-foreground mb-4">
            Encontro clientes na minha região e expando meu negócio
          </p>
          <ul className="text-[15px] text-left space-y-2.5 mb-6 w-full">
            {["Perfil profissional completo", "Receba pedidos de serviço da sua região", "Badge de verificado", "Plano gratuito disponível"].map(b => (
              <li key={b} className="flex items-center gap-2.5">
                <Check size={18} className="text-[hsl(var(--success))] flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link to="/cadastro/prestador" className="btn-secondary w-full">
            Cadastrar como Prestador
          </Link>
          <span className="text-[13px] text-muted-foreground mt-2.5">Plano gratuito disponível</span>
        </div>

        {/* Ambos */}
        <div className="card-agro flex flex-col items-center text-center p-6 md:col-span-2">
          <Users size={44} className="text-accent-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">Sou Ambos</h2>
          <p className="text-[15px] text-muted-foreground mb-4">
            Produzo na minha propriedade e também ofereço serviços para outros produtores
          </p>
          <ul className="text-[15px] text-left space-y-2.5 mb-6 w-full max-w-md">
            {["Todas as funcionalidades de Produtor e Prestador", "Painel unificado com todas as ferramentas", "Gerencie fazenda e serviços no mesmo lugar"].map(b => (
              <li key={b} className="flex items-center gap-2.5">
                <Check size={18} className="text-[hsl(var(--success))] flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link to="/cadastro/ambos" className="btn-primary w-full max-w-xs">
            Cadastrar como Produtor + Prestador
          </Link>
        </div>
      </div>
    </div>
  );
}

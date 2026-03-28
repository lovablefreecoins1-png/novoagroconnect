import { useNavigate } from "react-router-dom";
import { Tractor, Wrench, Users } from "lucide-react";
import logo from "@/assets/logo-agroconnect.png";
import heroImg from "@/assets/hero-rural.jpg";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[240px] overflow-hidden">
        <img
          src={heroImg}
          alt="Campo rural brasileiro"
          className="w-full h-full object-cover"
          width={1280}
          height={720}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 to-foreground/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <img src={logo} alt="AgroConnect" className="h-16 w-16 mb-3" width={64} height={64} />
          <h1 className="text-3xl font-medium text-primary-foreground tracking-tight">
            AgroConnect
          </h1>
          <p className="text-primary-foreground/90 mt-2 text-base max-w-xs">
            Conectando quem produz a quem resolve
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 max-w-md mx-auto w-full">
        <h2 className="text-xl font-medium text-center">Como você quer usar o AgroConnect?</h2>

        <button
          onClick={() => navigate("/buscar")}
          className="btn-primary w-full gap-3"
        >
          <Tractor size={24} />
          Sou produtor rural
        </button>

        <button
          onClick={() => navigate("/buscar")}
          className="btn-secondary w-full gap-3"
        >
          <Wrench size={24} />
          Ofereço serviço
        </button>

        <button
          onClick={() => navigate("/cadastro/ambos")}
          className="w-full gap-3 inline-flex items-center justify-center px-4 py-3 rounded-2xl border-2 border-border text-foreground font-medium hover:bg-muted/50 transition-colors"
        >
          <Users size={24} />
          Sou ambos
        </button>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Gratuito para produtores. Sem burocracia.
        </p>
      </div>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-muted-foreground">404</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-outline inline-flex !min-h-[44px] text-sm">
            <ArrowLeft size={16} /> Voltar
          </button>
          <Link to="/" className="btn-primary inline-flex !min-h-[44px] text-sm">
            <Home size={16} /> Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

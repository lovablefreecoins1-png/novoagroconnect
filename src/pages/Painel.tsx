import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/**
 * Legacy Painel route — redirects to the appropriate panel based on user type.
 */
export default function Painel() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
    } else if (user.role === "ambos") {
      navigate("/ambos", { replace: true });
    } else if (user.role === "prestador") {
      navigate("/prestador", { replace: true });
    } else {
      navigate("/produtor", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  );
}

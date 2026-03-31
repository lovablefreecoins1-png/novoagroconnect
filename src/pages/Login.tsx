import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo-agroconnect.png";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isValid = email.includes("@") && password.length >= 4;

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await signIn(email, password);
      // Fetch profile to get user_type reliably
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).maybeSingle();
      const userType = profile?.user_type || data.user?.user_metadata?.user_type || "produtor";
      toast({ title: `Bem-vindo de volta!` });
      if (userType === "admin") navigate("/admin", { replace: true });
      else if (userType === "ambos") navigate("/ambos", { replace: true });
      else if (userType === "prestador") navigate("/prestador", { replace: true });
      else navigate("/produtor", { replace: true });
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Invalid login")) {
        setError("Email ou senha incorretos. Tente de novo.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Email não confirmado. Verifique sua caixa de entrada.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/inicio",
      });
      if (result.error) {
        setError("Erro ao fazer login com Google. Tente novamente.");
      }
    } catch {
      setError("Erro ao fazer login com Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="card-agro w-full max-w-sm p-6">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="AgroConnect" className="h-[60px] w-[60px] mb-4" />
          <h1 className="text-[22px] font-medium text-foreground">Bem-vindo de volta</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Entre com seu email e senha</p>
        </div>

        <div className="space-y-5">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="btn-outline w-full !border-border"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Entrando..." : "Entrar com Google"}
          </button>

          <div className="flex items-center gap-3 text-muted-foreground text-[13px]">
            <div className="flex-1 h-px bg-border" />
            <span>ou com email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div>
            <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">
              Seu email
            </label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">
              Sua senha
            </label>
            <div className="relative">
              <input
                className="input-field !pr-12"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[15px] text-destructive text-center font-medium">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={!isValid || loading}
            className="btn-primary w-full disabled:opacity-40 disabled:pointer-events-none"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="text-center">
            <Link to="/cadastro" className="text-[15px] text-primary hover:underline font-medium">
              Ainda não tenho conta → Cadastrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

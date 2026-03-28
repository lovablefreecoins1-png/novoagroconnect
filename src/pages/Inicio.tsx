import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, FileText, MapPin, ChevronRight, Coffee, CloudSun,
  Bell, Menu, X, LogOut, User, Wrench, Calendar, DollarSign,
  ToggleLeft, ShoppingBag, Landmark, CheckCircle, Star, Loader2, MessageCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MetricCard from "@/components/MetricCard";

export default function Inicio() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leadsCount, setLeadsCount] = useState(0);
  const [contractsCount, setContractsCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalProviders, setTotalProviders] = useState(0);
  const [disponibilidade, setDisponibilidade] = useState<"now" | "week" | "busy">("now");
  const [isProvider, setIsProvider] = useState(false);
  const [newNotif, setNewNotif] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Realtime notifications
  useEffect(() => {
    if (!user) return;
    const ch1 = supabase.channel("notif-leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads", filter: `producer_id=eq.${user.id}` }, () => {
        setNewNotif(true);
        toast({ title: "Atualização nos seus pedidos!" });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads", filter: `provider_id=eq.${user.id}` }, () => {
        setNewNotif(true);
        toast({ title: "Nova solicitação de serviço!" });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch1); };
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [leadsRes, contractsRes, providersRes, providerCheck] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact" }).or(`producer_id.eq.${user.id},provider_id.eq.${user.id}`),
      supabase.from("contracts").select("id", { count: "exact" }).or(`producer_id.eq.${user.id},provider_id.eq.${user.id}`),
      supabase.from("providers").select("id, available"),
      supabase.from("providers").select("id, available").eq("user_id", user.id).maybeSingle(),
    ]);
    setLeadsCount(leadsRes.count || 0);
    setContractsCount(contractsRes.count || 0);
    const provs = providersRes.data || [];
    setTotalProviders(provs.length);
    setOnlineCount(provs.filter(p => p.available === "now").length);
    if (providerCheck.data) {
      setIsProvider(true);
      setDisponibilidade((providerCheck.data.available || "now") as any);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground animate-pulse">Carregando...</p></div>;
  if (!user) return null;

  const firstName = (user.name || "").split(" ")[0] || "Usuário";
  const now = new Date();
  const month = now.getMonth();
  const isSafra = month >= 3 && month <= 7;
  const userRole = user.role;
  const dispLabel = disponibilidade === "now" ? "Disponível" : disponibilidade === "week" ? "Esta semana" : "Ocupado";
  const dispDot = disponibilidade === "now" ? "bg-green-500" : disponibilidade === "week" ? "bg-amber-500" : "bg-destructive";

  return (
    <div className="min-h-screen pb-20 md:pb-6 bg-background">
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {user.name ? (
              <span className="text-sm font-semibold text-primary">{user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
            ) : <User size={18} className="text-primary" />}
          </div>
          <div>
            <h1 className="text-lg font-medium">Olá, {firstName}!</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin size={10} /> {user.city || "Sul de Minas"}, {user.state || "MG"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isProvider && (
            <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${disponibilidade === "now" ? "bg-green-100 text-green-700" : disponibilidade === "week" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
              <span className={`w-2 h-2 rounded-full ${dispDot}`} />{dispLabel}
            </span>
          )}
          <button onClick={() => { navigate("/pedidos"); setNewNotif(false); }} className="p-2 rounded-xl hover:bg-muted relative" aria-label="Pedidos">
            <Bell size={20} className="text-muted-foreground" />
            {newNotif && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />}
          </button>
          <Link to="/perfil" className="p-2 rounded-xl hover:bg-muted" aria-label="Perfil">
            <User size={20} className="text-muted-foreground" />
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard icon={Search} label="Prestadores Online" value={String(onlineCount)} />
          <MetricCard icon={FileText} label="Pedidos" value={String(leadsCount)} />
          <MetricCard icon={CheckCircle} label="Concluídos" value={String(contractsCount)} />
          <MetricCard icon={Star} label="Cadastrados" value={String(totalProviders)} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => navigate("/buscar")} className="card-agro text-center py-4 hover:border-primary/30 transition-colors active:scale-[0.98]">
            <Search size={24} className="mx-auto text-primary mb-1.5" />
            <p className="text-sm font-medium">Buscar Prestador</p>
          </button>
          <button onClick={() => navigate("/pedidos")} className="card-agro text-center py-4 hover:border-primary/30 transition-colors active:scale-[0.98]">
            <FileText size={24} className="mx-auto text-muted-foreground mb-1.5" />
            <p className="text-sm font-medium">Meus Pedidos</p>
            {leadsCount > 0 && <p className="text-xs text-primary mt-1">{leadsCount} aberto{leadsCount !== 1 ? "s" : ""}</p>}
          </button>
          <button onClick={() => navigate("/marketplace")} className="card-agro text-center py-4 hover:border-primary/30 transition-colors active:scale-[0.98]">
            <ShoppingBag size={24} className="mx-auto text-secondary mb-1.5" />
            <p className="text-sm font-medium">Loja</p>
          </button>
          <button onClick={() => navigate("/fazenda")} className="card-agro text-center py-4 hover:border-primary/30 transition-colors active:scale-[0.98]">
            <Landmark size={24} className="mx-auto text-green-700 mb-1.5" />
            <p className="text-sm font-medium">Minha Fazenda</p>
          </button>
        </div>

        {/* Provider-specific quick actions */}
        {(isProvider || userRole === "prestador" || userRole === "ambos") && (
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => navigate("/pedidos?tab=servicos")} className="card-agro text-center py-3 hover:border-primary/30 transition-colors active:scale-[0.98]">
              <Wrench size={20} className="mx-auto text-blue-600 mb-1" />
              <p className="text-xs font-medium">Serviços</p>
            </button>
            <button onClick={() => navigate("/pedidos?tab=agenda")} className="card-agro text-center py-3 hover:border-primary/30 transition-colors active:scale-[0.98]">
              <Calendar size={20} className="mx-auto text-green-600 mb-1" />
              <p className="text-xs font-medium">Agenda</p>
            </button>
            <button onClick={() => navigate("/pedidos?tab=ganhos")} className="card-agro text-center py-3 hover:border-primary/30 transition-colors active:scale-[0.98]">
              <DollarSign size={20} className="mx-auto text-amber-600 mb-1" />
              <p className="text-xs font-medium">Ganhos</p>
            </button>
          </div>
        )}

        {/* Clima */}
        <a
          href={`https://www.google.com/search?q=clima+hoje+${encodeURIComponent(user.city || "Boa Esperança")}+${encodeURIComponent(user.state || "MG")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="card-agro flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors"
        >
          <CloudSun size={28} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Clima Hoje</p>
            <p className="font-medium text-sm">Ver previsão ☀️</p>
            <p className="text-xs text-muted-foreground">{user.city || "Boa Esperança"}, {user.state || "MG"}</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </a>

        {/* Safra banner */}
        {isSafra && (
          <div className="rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(145,40%,30%)] text-white p-5">
            <div className="flex items-center gap-2 mb-1"><Coffee size={20} /><span className="font-medium">Safra 2026 — Temporada de Colheita</span></div>
            <p className="text-sm text-white/80">Encontre equipes para panha manual de café na sua região agora.</p>
            <button onClick={() => navigate("/buscar")} className="inline-flex items-center gap-1 mt-3 text-sm font-medium bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">Buscar prestadores <ChevronRight size={14} /></button>
          </div>
        )}

        {/* Coffee Calendar */}
        <div className="card-agro">
          <h2 className="font-medium text-[16px] mb-3">📅 Calendário do Café 2026</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {[
              { period: "Jan–Mar", task: "Adubação + Poda", active: month >= 0 && month <= 2 },
              { period: "Abr–Mai", task: "Início da Colheita", active: month >= 3 && month <= 4 },
              { period: "Jun–Ago", task: "Panha + Secagem", active: month >= 5 && month <= 7 },
              { period: "Set–Dez", task: "Pós-colheita + Análise", active: month >= 8 && month <= 11 },
            ].map((c, i) => (
              <div key={i} className={`p-3 rounded-xl text-center ${c.active ? "bg-primary/10 border border-primary/20" : "bg-muted"}`}>
                <p className={`font-medium ${c.active ? "text-primary" : "text-foreground"}`}>{c.period}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.task}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

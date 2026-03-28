import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, FileText, CheckCircle, Eye, BarChart3, DollarSign } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
  const [tab, setTab] = useState<"dashboard" | "verificacoes" | "comissoes">("dashboard");
  const [filter, setFilter] = useState("pendente");
  const [stats, setStats] = useState({ profiles: 0, providers: 0, producers: 0, pendingVerifications: 0, leads: 0, commissions: 0 });
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadPendingProviders();
    loadCommissions();
  }, []);

  const loadStats = async () => {
    const [profilesRes, providersRes, leadsRes, commissionsRes] = await Promise.all([
      supabase.from("profiles").select("id, user_type", { count: "exact" }),
      supabase.from("providers").select("id, verified", { count: "exact" }),
      supabase.from("leads").select("id", { count: "exact" }),
      supabase.from("commissions").select("commission_value"),
    ]);

    const profiles = profilesRes.data || [];
    const producers = profiles.filter(p => p.user_type === "produtor").length;
    const unverified = (providersRes.data || []).filter(p => !p.verified).length;
    const totalCommission = (commissionsRes.data || []).reduce((sum, c) => sum + Number(c.commission_value || 0), 0);

    setStats({
      profiles: profilesRes.count || 0,
      providers: providersRes.count || 0,
      producers,
      pendingVerifications: unverified,
      leads: leadsRes.count || 0,
      commissions: totalCommission,
    });
  };

  const loadPendingProviders = async () => {
    const { data } = await supabase
      .from("providers")
      .select("id, user_id, category, verified, created_at")
      .eq("verified", false)
      .order("created_at", { ascending: false });
    
    if (data && data.length > 0) {
      // Fetch profiles for these providers
      const userIds = data.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone, city, state")
        .in("id", userIds);
      
      const merged = data.map(p => ({
        ...p,
        profile: profiles?.find(pr => pr.id === p.user_id),
      }));
      setPendingProviders(merged);
    }
  };

  const loadCommissions = async () => {
    const { data } = await supabase
      .from("commissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setCommissions(data || []);
  };

  const handleVerify = async (providerId: string, approve: boolean) => {
    if (approve) {
      await supabase.from("providers").update({ verified: true }).eq("id", providerId);
    }
    setPendingProviders(prev => prev.filter(p => p.id !== providerId));
    loadStats();
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={24} /></Link>
            <h1 className="text-lg font-medium">Painel Admin</h1>
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {(["dashboard", "verificacoes", "comissoes"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`text-[14px] px-3 py-1.5 rounded-lg whitespace-nowrap ${tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                {t === "dashboard" ? "Resumo" : t === "verificacoes" ? "Verificações" : "Comissões"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetricCard icon={Users} label="Total de usuários" value={String(stats.profiles)} />
              <MetricCard icon={FileText} label="Prestadores" value={String(stats.providers)} />
              <MetricCard icon={Users} label="Produtores" value={String(stats.producers)} />
              <MetricCard icon={CheckCircle} label="Aguardando verificação" value={String(stats.pendingVerifications)} />
              <MetricCard icon={Eye} label="Leads gerados" value={String(stats.leads)} />
              <MetricCard icon={DollarSign} label="Comissões (R$)" value={`R$ ${stats.commissions.toFixed(2)}`} />
            </div>
          </div>
        )}

        {tab === "verificacoes" && (
          <div className="space-y-4">
            {pendingProviders.length === 0 ? (
              <div className="card-agro text-center py-10">
                <CheckCircle size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-[15px] text-muted-foreground">Nenhuma verificação pendente</p>
              </div>
            ) : (
              pendingProviders.map(v => (
                <div key={v.id} className="card-agro">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {(v.profile?.full_name || "??").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[15px] font-medium">{v.profile?.full_name || "Sem nome"}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {v.category} · {v.profile?.city}, {v.profile?.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleVerify(v.id, true)} className="btn-primary flex-1 text-sm !min-h-[44px]">
                      <CheckCircle size={16} /> Aprovar
                    </button>
                    <button onClick={() => handleVerify(v.id, false)} className="btn-outline flex-1 text-sm !min-h-[44px] !text-destructive !border-destructive/30">
                      Reprovar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "comissoes" && (
          <div className="space-y-4">
            {commissions.length === 0 ? (
              <div className="card-agro text-center py-10">
                <DollarSign size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-[15px] text-muted-foreground">Nenhuma comissão registrada ainda</p>
                <p className="text-[13px] text-muted-foreground mt-1">Comissões de 10% aparecem quando serviços são fechados</p>
              </div>
            ) : (
              commissions.map(c => (
                <div key={c.id} className="card-agro">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[15px] font-medium">Comissão 10%</p>
                      <p className="text-[13px] text-muted-foreground">
                        Valor serviço: R$ {Number(c.service_value).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[17px] font-medium text-primary">
                        R$ {Number(c.commission_value).toFixed(2)}
                      </p>
                      <span className={`text-[12px] px-2 py-0.5 rounded-full ${
                        c.status === "paid" ? "bg-[hsl(var(--primary-bg))] text-primary" : "bg-accent-bg text-secondary"
                      }`}>
                        {c.status === "paid" ? "Pago" : "Pendente"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

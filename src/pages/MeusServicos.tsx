import { useState, useEffect } from "react";
import { ArrowLeft, ClipboardList, Loader2, Calendar, DollarSign, CheckCircle, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface ServiceItem {
  id: string;
  service_name: string | null;
  status: string | null;
  scheduled_date: string | null;
  service_value: number | null;
  created_at: string;
  role: "producer" | "provider";
  other_name: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Em andamento", color: "bg-blue-100 text-blue-700", icon: Clock },
  completed: { label: "Concluído", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: Clock },
  pending: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: Clock },
};

export default function MeusServicos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    if (!user) return;
    loadServices();
  }, [user]);

  const loadServices = async () => {
    if (!user) return;
    setLoading(true);

    // Load contracts where user is producer or provider
    const { data: contracts } = await supabase
      .from("contracts")
      .select("*")
      .or(`producer_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (contracts) {
      // Get other party names
      const otherIds = contracts.map(c => c.producer_id === user.id ? c.provider_id : c.producer_id).filter(Boolean) as string[];
      const uniqueIds = [...new Set(otherIds)];
      
      let profileMap = new Map<string, string>();
      if (uniqueIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", uniqueIds);
        profileMap = new Map((profiles || []).map(p => [p.id, p.full_name || ""]));
      }

      setServices(contracts.map(c => ({
        id: c.id,
        service_name: c.service_name,
        status: c.status,
        scheduled_date: c.scheduled_date,
        service_value: c.service_value,
        created_at: c.created_at,
        role: c.producer_id === user.id ? "producer" : "provider",
        other_name: profileMap.get(c.producer_id === user.id ? (c.provider_id || "") : (c.producer_id || "")) || null,
      })));
    }
    setLoading(false);
  };

  const filtered = services.filter(s => {
    if (filter === "active") return s.status === "active" || s.status === "pending";
    if (filter === "completed") return s.status === "completed";
    return true;
  });

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold text-lg">Meus Serviços</h1>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-4 flex gap-2">
        {(["all", "active", "completed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f === "all" ? "Todos" : f === "active" ? "Em andamento" : "Concluídos"}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground">Nenhum serviço encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Seus contratos e serviços aparecerão aqui</p>
          </div>
        ) : (
          filtered.map(s => {
            const cfg = statusConfig[s.status || "pending"] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={s.id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{s.service_name || "Serviço"}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {s.role === "producer" ? "Prestador" : "Produtor"}: {s.other_name || "—"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${cfg.color}`}>
                    <StatusIcon size={12} /> {cfg.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {s.scheduled_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {new Date(s.scheduled_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {s.service_value && (
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} /> R$ {s.service_value.toFixed(2)}
                    </span>
                  )}
                </div>

                {s.status === "completed" && (
                  <button
                    onClick={() => navigate(`/avaliar/${s.id}`)}
                    className="mt-3 w-full py-2.5 rounded-xl bg-secondary/10 text-secondary text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <Star size={16} /> Avaliar serviço
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

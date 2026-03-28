import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home, Calendar, Briefcase, DollarSign, ToggleLeft,
  User, Menu, X, LogOut, Bell, MapPin, Star, CheckCircle, Eye,
  MessageCircle, ChevronRight, ShoppingBag, BookOpen, Clock, Phone,
  Plus, Send, Wrench, Filter, Search, Loader2, Store
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MetricCard from "@/components/MetricCard";
import EmptyState from "@/components/EmptyState";
import MeusAnuncios from "@/components/MeusAnuncios";
import { useToast } from "@/hooks/use-toast";
import { serviceCategories } from "@/data/categories";

const sidebarItems = [
  { id: "inicio", label: "Início", icon: Home, path: "/prestador" },
  { id: "servicos", label: "Serviços", icon: Wrench, path: "/prestador/servicos" },
  { id: "agenda", label: "Agenda", icon: Calendar, path: "/prestador/agenda" },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, path: "/prestador/marketplace" },
  { id: "ganhos", label: "Ganhos", icon: DollarSign, path: "/prestador/ganhos" },
  { id: "disponibilidade", label: "Disponibilidade", icon: ToggleLeft, path: "/prestador/disponibilidade" },
  { id: "blog", label: "Blog", icon: BookOpen, path: "/prestador/blog" },
  { id: "perfil", label: "Perfil", icon: User, path: "/perfil" },
];

const allServices = serviceCategories.flatMap(g => g.services);

export default function PainelPrestador() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [leadsCount, setLeadsCount] = useState(0);
  const [contractsCount, setContractsCount] = useState(0);
  const [disponibilidade, setDisponibilidade] = useState<"now" | "week" | "busy">("now");
  const [savingDisp, setSavingDisp] = useState(false);
  const [marketplaceTab, setMarketplaceTab] = useState<"explorar" | "meus">("meus");
  const [newLeadNotif, setNewLeadNotif] = useState(false);

  // Serviços (leads where this provider is involved)
  const [myServices, setMyServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showCreateService, setShowCreateService] = useState(false);
  const [newSvcType, setNewSvcType] = useState("");
  const [newSvcDate, setNewSvcDate] = useState("");
  const [newSvcLocation, setNewSvcLocation] = useState("");
  const [newSvcBudget, setNewSvcBudget] = useState("");
  const [newSvcNotes, setNewSvcNotes] = useState("");
  const [creatingSvc, setCreatingSvc] = useState(false);

  // Agenda
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Ganhos
  const [earnings, setEarnings] = useState({ month: 0, total: 0, costs: 0 });
  const [earningsContracts, setEarningsContracts] = useState<any[]>([]);

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Search filters for agenda
  const [agendaSearch, setAgendaSearch] = useState("");

  useEffect(() => {
    const path = location.pathname;
    const found = sidebarItems.find(i => path === i.path);
    if (found) setActiveTab(found.id);
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("prestador-leads")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads", filter: `provider_id=eq.${user.id}` }, () => {
        setNewLeadNotif(true);
        setLeadsCount(prev => prev + 1);
        toast({ title: "Nova solicitação recebida!", description: "Um produtor solicitou seus serviços." });
        if (activeTab === "servicos") loadServices();
        if (activeTab === "agenda") loadContracts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeTab]);

  const loadData = async () => {
    if (!user) return;
    const [leadsRes, contractsRes] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact" }).eq("provider_id", user.id),
      supabase.from("contracts").select("id", { count: "exact" }).eq("provider_id", user.id),
    ]);
    setLeadsCount(leadsRes.count || 0);
    setContractsCount(contractsRes.count || 0);

    const { data: provData } = await supabase.from("providers").select("available").eq("user_id", user.id).maybeSingle();
    if (provData?.available) setDisponibilidade(provData.available as "now" | "week" | "busy");
  };

  const loadServices = async () => {
    if (!user) return;
    setLoadingServices(true);
    const { data } = await supabase.from("leads").select("*").or(`provider_id.eq.${user.id},provider_id.is.null`).order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const ids = [...new Set(data.map(l => l.producer_id).filter(Boolean))];
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, city, state, avatar_url").in("id", ids);
        const map = new Map((profiles || []).map(p => [p.id, p]));
        setMyServices(data.map(l => ({ ...l, producer: map.get(l.producer_id) || null })));
      } else {
        setMyServices(data);
      }
    } else {
      setMyServices([]);
    }
    setLoadingServices(false);
  };

  const loadContracts = async () => {
    if (!user) return;
    setLoadingContracts(true);
    const { data } = await supabase.from("contracts").select("*").eq("provider_id", user.id).order("scheduled_date", { ascending: true });
    setContracts(data || []);
    setLoadingContracts(false);
  };

  const loadEarnings = async () => {
    if (!user) return;
    const { data } = await supabase.from("contracts").select("*").eq("provider_id", user.id).eq("status", "completed");
    const list = data || [];
    const now = new Date();
    const monthTotal = list.filter(c => {
      const d = new Date(c.completed_at || c.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, c) => s + (Number(c.gross_amount) || 0), 0);
    const totalGross = list.reduce((s, c) => s + (Number(c.gross_amount) || 0), 0);
    const totalCosts = list.reduce((s, c) => s + (Number(c.cost_amount) || 0), 0);
    setEarnings({ month: monthTotal, total: totalGross, costs: totalCosts });
    setEarningsContracts(list);
  };

  const handleCreateService = async () => {
    if (!user || !newSvcType) {
      toast({ title: "Selecione o tipo de serviço.", variant: "destructive" });
      return;
    }
    setCreatingSvc(true);
    const { error } = await supabase.from("leads").insert({
      provider_id: user.id,
      service: newSvcType,
      requested_date: newSvcDate || null,
      location_text: newSvcLocation || null,
      budget: newSvcBudget ? Number(newSvcBudget) : null,
      message: newSvcNotes || null,
      status: "pending",
    });
    if (error) {
      toast({ title: "Erro ao criar serviço.", variant: "destructive" });
    } else {
      toast({ title: "Serviço criado!" });
      setShowCreateService(false);
      setNewSvcType(""); setNewSvcDate(""); setNewSvcLocation(""); setNewSvcBudget(""); setNewSvcNotes("");
      loadServices();
    }
    setCreatingSvc(false);
  };

  const handleAcceptLead = async (leadId: string) => {
    if (!user) return;
    await supabase.from("leads").update({ provider_id: user.id, status: "accepted" }).eq("id", leadId);
    toast({ title: "Serviço aceito!" });
    loadServices();
  };

  const handleCompleteLead = async (lead: any) => {
    if (!user) return;
    // Create contract from lead
    await supabase.from("contracts").insert({
      provider_id: user.id,
      producer_id: lead.producer_id || null,
      lead_id: lead.id,
      service_name: lead.service,
      scheduled_date: lead.requested_date || null,
      gross_amount: lead.budget || 0,
      cost_amount: 0,
      status: "completed",
      completed_at: new Date().toISOString(),
    });
    await supabase.from("leads").update({ status: "completed" }).eq("id", lead.id);
    toast({ title: "Serviço concluído e registrado nos ganhos!" });
    loadServices();
    loadData();
  };

  useEffect(() => {
    if (activeTab === "servicos" && user) { loadServices(); setNewLeadNotif(false); }
    if (activeTab === "agenda" && user) loadContracts();
    if (activeTab === "ganhos" && user) loadEarnings();
  }, [activeTab, user]);

  const saveDisponibilidade = async (value: "now" | "week" | "busy") => {
    setDisponibilidade(value);
    if (!user) return;
    setSavingDisp(true);
    const { data: existing } = await supabase.from("providers").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("providers").update({ available: value }).eq("user_id", user.id);
    } else {
      await supabase.from("providers").insert({ user_id: user.id, available: value });
    }
    setSavingDisp(false);
    toast({ title: "Disponibilidade atualizada!" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!user) return null;

  const firstName = (user.name || "").split(" ")[0] || "Prestador";
  const dispLabel = disponibilidade === "now" ? "Disponível" : disponibilidade === "week" ? "Esta semana" : "Ocupado";
  const dispColor = disponibilidade === "now" ? "bg-green-500" : disponibilidade === "week" ? "bg-amber-500" : "bg-destructive";

  const handleTabClick = (item: typeof sidebarItems[0]) => {
    if (item.id === "blog") { navigate("/blog"); return; }
    if (item.id === "perfil") { navigate("/perfil"); return; }
    setActiveTab(item.id);
    setSidebarOpen(false);
    if (item.path !== location.pathname) navigate(item.path);
  };

  return (
    <div className="min-h-screen flex bg-[hsl(210,15%,97%)]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[hsl(215,50%,18%)] text-white min-h-screen p-4 gap-1 fixed left-0 top-0 bottom-0 z-30">
        <div className="flex items-center gap-2 px-3 py-4 mb-4">
          <Briefcase size={22} className="text-blue-300" />
          <span className="font-semibold text-lg">AgroConnect</span>
        </div>
        <p className="px-3 text-blue-200/60 text-sm mb-3">Painel do Prestador</p>
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => handleTabClick(item)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-colors ${activeTab === item.id ? "bg-white/15 font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
            <item.icon size={18} />
            {item.label}
            {item.id === "servicos" && leadsCount > 0 && (
              <span className="ml-auto bg-blue-400 text-white text-[11px] px-1.5 py-0.5 rounded-full">{leadsCount}</span>
            )}
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-white/10">
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] text-white/60 hover:text-white hover:bg-white/10 w-full">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[hsl(215,50%,18%)] text-white p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between px-3 py-4 mb-2">
              <div className="flex items-center gap-2"><Briefcase size={20} className="text-blue-300" /><span className="font-semibold">AgroConnect</span></div>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <p className="px-3 text-blue-200/60 text-sm mb-3">Painel do Prestador</p>
            {sidebarItems.map(item => (
              <button key={item.id} onClick={() => handleTabClick(item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-colors ${activeTab === item.id ? "bg-white/15 font-medium" : "text-white/70 hover:bg-white/10"}`}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
            <div className="mt-auto pt-4 border-t border-white/10">
              <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-3 px-3 py-2.5 text-[15px] text-white/60 hover:text-white w-full"><LogOut size={18} /> Sair</button>
            </div>
          </aside>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" /> : <User size={28} className="text-muted-foreground" />}
              </div>
              <div>
                <h3 className="text-lg font-medium">{selectedUser.full_name || "Usuário"}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {selectedUser.city}, {selectedUser.state}</p>
              </div>
            </div>
            {selectedUser.phone && (
              <a href={`https://wa.me/55${selectedUser.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                <MessageCircle size={18} /> Abrir WhatsApp
              </a>
            )}
            {selectedUser.phone && <p className="text-sm text-muted-foreground text-center">Telefone: {selectedUser.phone}</p>}
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateService(false)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowCreateService(false)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <h3 className="text-lg font-medium">Criar Solicitação de Serviço</h3>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Tipo de serviço *</label>
              <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newSvcType} onChange={e => setNewSvcType(e.target.value)}>
                <option value="">Selecione...</option>
                {serviceCategories.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.services.map(s => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Data desejada</label>
              <input type="date" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newSvcDate} onChange={e => setNewSvcDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Localização</label>
              <input type="text" placeholder="Ex: Boa Esperança, MG" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newSvcLocation} onChange={e => setNewSvcLocation(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Valor estimado (R$)</label>
              <input type="number" placeholder="0,00" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newSvcBudget} onChange={e => setNewSvcBudget(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Observações</label>
              <textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[80px] resize-none" value={newSvcNotes} onChange={e => setNewSvcNotes(e.target.value)} placeholder="Detalhes do serviço..." maxLength={500} />
            </div>
            <button onClick={handleCreateService} disabled={creatingSvc || !newSvcType}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Send size={18} /> {creatingSvc ? "Criando..." : "Criar Serviço"}
            </button>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-6">
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
            <h1 className="text-lg font-medium">Olá, {firstName}!</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${disponibilidade === "now" ? "bg-green-100 text-green-700" : disponibilidade === "week" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
              <span className={`w-2 h-2 rounded-full ${dispColor}`} />{dispLabel}
            </span>
          </div>
          <button onClick={async () => {
            setActiveTab("servicos"); setNewLeadNotif(false);
            if ("Notification" in window && Notification.permission === "default") {
              const perm = await Notification.requestPermission();
              if (perm === "granted") toast({ title: "Notificações ativadas!" });
            }
          }} className="p-2 rounded-xl hover:bg-muted relative">
            <Bell size={20} className="text-muted-foreground" />
            {newLeadNotif && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-destructive" />}
          </button>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* INÍCIO */}
          {activeTab === "inicio" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard icon={Eye} label="Visualizações" value="0" />
                <MetricCard icon={Wrench} label="Serviços" value={String(leadsCount)} />
                <MetricCard icon={CheckCircle} label="Concluídos" value={String(contractsCount)} />
                <MetricCard icon={Star} label="Avaliação" value="—" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => setActiveTab("servicos")} className="card-agro text-center py-4 hover:border-blue-300/50 transition-colors">
                  <Wrench size={24} className="mx-auto text-blue-600 mb-1.5" />
                  <p className="text-sm font-medium">Serviços</p>
                  {leadsCount > 0 && <p className="text-xs text-blue-600 mt-1">{leadsCount} ativo{leadsCount !== 1 ? "s" : ""}</p>}
                </button>
                <button onClick={() => setActiveTab("agenda")} className="card-agro text-center py-4 hover:border-blue-300/50 transition-colors">
                  <Calendar size={24} className="mx-auto text-green-600 mb-1.5" />
                  <p className="text-sm font-medium">Agenda</p>
                </button>
                <button onClick={() => setActiveTab("disponibilidade")} className="card-agro text-center py-4 hover:border-blue-300/50 transition-colors">
                  <ToggleLeft size={24} className="mx-auto text-amber-600 mb-1.5" />
                  <p className="text-sm font-medium">Status</p>
                  <p className={`text-xs mt-1 ${disponibilidade === "now" ? "text-green-600" : disponibilidade === "week" ? "text-amber-600" : "text-red-600"}`}>{dispLabel}</p>
                </button>
                <button onClick={() => setActiveTab("ganhos")} className="card-agro text-center py-4 hover:border-blue-300/50 transition-colors">
                  <DollarSign size={24} className="mx-auto text-amber-600 mb-1.5" />
                  <p className="text-sm font-medium">Ganhos</p>
                </button>
              </div>
              <div className="card-agro flex items-center gap-3">
                <MapPin size={20} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.city || "Boa Esperança"}, {user.state || "MG"}</p>
                  <p className="text-xs text-muted-foreground">Raio de atendimento: 100 km</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${disponibilidade === "now" ? "bg-green-100 text-green-700" : disponibilidade === "week" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                  <span className={`w-2 h-2 rounded-full ${dispColor}`} />{dispLabel}
                </span>
              </div>
            </>
          )}

          {/* SERVIÇOS */}
          {activeTab === "servicos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">🔧 Serviços</h2>
                <button onClick={() => setShowCreateService(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Plus size={16} /> Criar Solicitação
                </button>
              </div>
              <p className="text-sm text-muted-foreground">Serviços solicitados por produtores e por você.</p>
              {loadingServices ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
              ) : myServices.length === 0 ? (
                <EmptyState icon={Wrench} title="Nenhum serviço" description="Crie uma solicitação de serviço ou aguarde produtores." />
              ) : (
                <div className="space-y-3">
                  {myServices.map(lead => (
                    <div key={lead.id} className="card-agro space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[15px]">{lead.service || "Serviço geral"}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lead.status === "pending" ? "bg-amber-100 text-amber-700" : lead.status === "accepted" ? "bg-blue-100 text-blue-700" : lead.status === "completed" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                        }`}>
                          {lead.status === "pending" ? "Pendente" : lead.status === "accepted" ? "Aceito" : lead.status === "completed" ? "Concluído" : lead.status}
                        </span>
                      </div>
                      {lead.requested_date && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} /> {new Date(lead.requested_date).toLocaleDateString("pt-BR")}</p>}
                      {lead.location_text && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {lead.location_text}</p>}
                      {lead.budget && <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign size={12} /> R$ {Number(lead.budget).toFixed(2)}</p>}
                      {lead.message && <p className="text-sm text-muted-foreground">{lead.message}</p>}
                      {lead.producer && (
                        <button onClick={() => setSelectedUser(lead.producer)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Produtor: <span className="font-medium text-foreground underline">{lead.producer.full_name}</span> — {lead.producer.city}, {lead.producer.state}
                        </button>
                      )}
                      <p className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                      <div className="flex flex-wrap gap-2">
                        {!lead.provider_id && lead.status === "pending" && (
                          <button onClick={() => handleAcceptLead(lead.id)} className="inline-flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors">
                            <CheckCircle size={14} /> Aceitar
                          </button>
                        )}
                        {lead.provider_id === user?.id && lead.status === "accepted" && (
                          <button onClick={() => handleCompleteLead(lead)} className="inline-flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 transition-colors">
                            <CheckCircle size={14} /> Concluir
                          </button>
                        )}
                        {lead.producer?.phone && (
                          <a href={`https://wa.me/55${lead.producer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
                            <Phone size={14} /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AGENDA */}
          {activeTab === "agenda" && (
            <div className="space-y-4">
              <h2 className="font-medium text-lg">📅 Agenda</h2>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Buscar por serviço..." className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 bg-background text-sm"
                  value={agendaSearch} onChange={e => setAgendaSearch(e.target.value)} />
              </div>
              {loadingContracts ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
              ) : contracts.length === 0 ? (
                <EmptyState icon={Calendar} title="Agenda vazia" description="Conclua serviços para vê-los na agenda." />
              ) : (
                <div className="space-y-3">
                  {contracts.filter(c => !agendaSearch || (c.service_name || "").toLowerCase().includes(agendaSearch.toLowerCase())).map(c => (
                    <div key={c.id} className="card-agro space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[15px]">{c.service_name || "Serviço"}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {c.status === "completed" ? "Concluído" : "Ativo"}
                        </span>
                      </div>
                      {c.scheduled_date && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} /> {new Date(c.scheduled_date).toLocaleDateString("pt-BR")}</p>}
                      <div className="flex gap-4 text-sm">
                        {c.gross_amount != null && <span className="text-green-700">Valor: R$ {Number(c.gross_amount).toFixed(2)}</span>}
                        {c.cost_amount != null && Number(c.cost_amount) > 0 && <span className="text-red-600">Custo: R$ {Number(c.cost_amount).toFixed(2)}</span>}
                      </div>
                      {c.notes && <p className="text-sm text-muted-foreground">{c.notes}</p>}
                      {c.completed_at && <p className="text-xs text-muted-foreground">Concluído em {new Date(c.completed_at).toLocaleDateString("pt-BR")}</p>}
                      {c.status === "completed" && (
                        <button onClick={() => navigate(`/avaliar/${c.id}`)} className="inline-flex items-center gap-1.5 text-sm bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600 transition-colors">
                          <Star size={14} /> Avaliar serviço
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MARKETPLACE */}
          {activeTab === "marketplace" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">🛒 Marketplace</h2>
                <Link to="/marketplace" className="text-sm text-primary hover:underline flex items-center gap-1">Ver tudo <ChevronRight size={14} /></Link>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMarketplaceTab("meus")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${marketplaceTab === "meus" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Meus Anúncios</button>
                <button onClick={() => setMarketplaceTab("explorar")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${marketplaceTab === "explorar" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Explorar</button>
              </div>
              {marketplaceTab === "meus" ? <MeusAnuncios userId={user.id} /> : <MarketplaceExplorar />}
            </div>
          )}

          {/* GANHOS */}
          {activeTab === "ganhos" && (
            <div className="space-y-4">
              <h2 className="font-medium text-lg">💰 Meus Ganhos</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="card-agro text-center py-5">
                  <p className="text-2xl font-medium text-green-700">R$ {earnings.month.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Este mês</p>
                </div>
                <div className="card-agro text-center py-5">
                  <p className="text-2xl font-medium">R$ {earnings.total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total bruto</p>
                </div>
                <div className="card-agro text-center py-5">
                  <p className="text-2xl font-medium text-red-600">R$ {earnings.costs.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Custos</p>
                </div>
              </div>
              <div className="card-agro text-center py-4">
                <p className="text-lg font-medium">Lucro: R$ {(earnings.total - earnings.costs).toFixed(2)}</p>
              </div>
              {earningsContracts.length === 0 ? (
                <EmptyState icon={DollarSign} title="Sem ganhos ainda" description="Conclua serviços para ver seus ganhos." />
              ) : (
                <div className="space-y-3">
                  <h3 className="font-medium">Serviços concluídos</h3>
                  {earningsContracts.map(c => (
                    <div key={c.id} className="card-agro flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[15px]">{c.service_name || "Serviço"}</p>
                        <p className="text-xs text-muted-foreground">{c.completed_at ? new Date(c.completed_at).toLocaleDateString("pt-BR") : "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-700">R$ {Number(c.gross_amount || 0).toFixed(2)}</p>
                        {Number(c.cost_amount) > 0 && <p className="text-xs text-red-600">- R$ {Number(c.cost_amount).toFixed(2)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DISPONIBILIDADE */}
          {activeTab === "disponibilidade" && (
            <div className="space-y-4">
              <h2 className="font-medium text-lg">🟢 Disponibilidade</h2>
              <p className="text-sm text-muted-foreground">Produtores verão seu status ao buscar prestadores.</p>
              <div className="space-y-2.5">
                {[
                  { value: "now" as const, label: "Disponível agora", desc: "Aceito trabalhos imediatamente", dot: "bg-green-500" },
                  { value: "week" as const, label: "Disponível esta semana", desc: "Posso agendar para os próximos dias", dot: "bg-amber-500" },
                  { value: "busy" as const, label: "Ocupado", desc: "Não estou aceitando serviços no momento", dot: "bg-destructive" },
                ].map(opt => (
                  <button key={opt.value} onClick={() => saveDisponibilidade(opt.value)} disabled={savingDisp}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${disponibilidade === opt.value ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-200"}`}>
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 ${opt.dot}`} />
                    <div>
                      <p className="text-[15px] font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    {disponibilidade === opt.value && <CheckCircle size={18} className="ml-auto text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
              {savingDisp && <p className="text-xs text-muted-foreground text-center">Salvando...</p>}
            </div>
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20 flex" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {[
          { id: "inicio", label: "Início", icon: Home },
          { id: "servicos", label: "Serviços", icon: Wrench },
          { id: "agenda", label: "Agenda", icon: Calendar },
          { id: "marketplace", label: "Loja", icon: ShoppingBag },
          { id: "ganhos", label: "Ganhos", icon: DollarSign },
        ].map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); navigate(`/prestador${item.id === "inicio" ? "" : "/" + item.id}`); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium relative ${activeTab === item.id ? "text-blue-600" : "text-muted-foreground"}`}>
            <item.icon size={20} />
            {item.label}
            {item.id === "servicos" && newLeadNotif && <span className="absolute top-1 w-2 h-2 rounded-full bg-destructive" />}
          </button>
        ))}
      </nav>
    </div>
  );
}

function MarketplaceExplorar() {
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);

  useEffect(() => {
    supabase.from("anuncios").select("*").eq("ativo", true).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { setAnuncios(data || []); setLoadingAds(false); });
  }, []);

  if (loadingAds) return <p className="text-sm text-muted-foreground py-8 text-center">Carregando anúncios...</p>;
  if (anuncios.length === 0) return <EmptyState icon={ShoppingBag} title="Nenhum anúncio disponível" description="Quando anúncios forem publicados, aparecerão aqui." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {anuncios.map(a => (
        <Link key={a.id} to={`/marketplace/${a.id}`} className="card-agro !p-0 overflow-hidden hover:border-primary/30 transition-colors">
          {a.fotos && a.fotos.length > 0 ? (
            <img src={a.fotos[0]} alt={a.titulo} className="w-full h-36 object-cover" />
          ) : (
            <div className="w-full h-36 bg-muted flex items-center justify-center"><Store size={24} className="text-muted-foreground/40" /></div>
          )}
          <div className="p-3">
          <h3 className="font-medium text-[15px]">{a.titulo}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.descricao}</p>
          <div className="flex items-center justify-between mt-3">
            {a.preco && <span className="text-sm font-medium text-primary">{a.preco}</span>}
            <span className="text-xs text-muted-foreground">{a.cidade}, {a.estado}</span>
          </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

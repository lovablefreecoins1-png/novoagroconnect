import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home, Search, FileText, Calendar, DollarSign, ToggleLeft,
  User, Menu, X, LogOut, Bell, MapPin, Star, CheckCircle, Eye,
  MessageCircle, ChevronRight, ShoppingBag, BookOpen, Clock, Phone,
  Plus, Send, Wrench, Filter, Loader2, Store, Coffee, CloudSun,
  Landmark, Briefcase, Users
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MetricCard from "@/components/MetricCard";
import EmptyState from "@/components/EmptyState";
import MeusAnuncios from "@/components/MeusAnuncios";
import { useToast } from "@/hooks/use-toast";
import { serviceCategories } from "@/data/categories";

const sidebarItems = [
  { id: "inicio", label: "Início", icon: Home, path: "/ambos" },
  { id: "prestadores", label: "Buscar", icon: Search, path: "/ambos/prestadores" },
  { id: "pedidos", label: "Meus Pedidos", icon: FileText, path: "/ambos/pedidos" },
  { id: "servicos", label: "Serviços", icon: Wrench, path: "/ambos/servicos" },
  { id: "agenda", label: "Agenda", icon: Calendar, path: "/ambos/agenda" },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, path: "/ambos/marketplace" },
  { id: "ganhos", label: "Ganhos", icon: DollarSign, path: "/ambos/ganhos" },
  { id: "disponibilidade", label: "Status", icon: ToggleLeft, path: "/ambos/disponibilidade" },
  { id: "fazenda", label: "Fazenda", icon: Landmark, path: "/ambos/fazenda" },
  { id: "blog", label: "Blog", icon: BookOpen, path: "/ambos/blog" },
  { id: "perfil", label: "Perfil", icon: User, path: "/perfil" },
];

export default function PainelAmbos() {
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
  const [marketplaceTab, setMarketplaceTab] = useState<"explorar" | "meus">("explorar");
  const [newNotif, setNewNotif] = useState(false);

  // Providers search
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchAvail, setSearchAvail] = useState("");

  // My leads (as producer)
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLeadService, setNewLeadService] = useState("");
  const [newLeadMessage, setNewLeadMessage] = useState("");
  const [newLeadDate, setNewLeadDate] = useState("");
  const [newLeadLocation, setNewLeadLocation] = useState("");
  const [newLeadBudget, setNewLeadBudget] = useState("");
  const [newLeadProviderId, setNewLeadProviderId] = useState("");
  const [sendingLead, setSendingLead] = useState(false);

  // Services (as provider)
  const [myServices, setMyServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showCreateService, setShowCreateService] = useState(false);
  const [newSvcType, setNewSvcType] = useState("");
  const [newSvcDate, setNewSvcDate] = useState("");
  const [newSvcLocation, setNewSvcLocation] = useState("");
  const [newSvcBudget, setNewSvcBudget] = useState("");
  const [newSvcNotes, setNewSvcNotes] = useState("");
  const [creatingSvc, setCreatingSvc] = useState(false);

  // Contracts / Agenda
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [agendaSearch, setAgendaSearch] = useState("");

  // Earnings
  const [earnings, setEarnings] = useState({ month: 0, total: 0, costs: 0 });
  const [earningsContracts, setEarningsContracts] = useState<any[]>([]);

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const path = location.pathname;
    const found = sidebarItems.find(i => path === i.path);
    if (found) setActiveTab(found.id);
  }, [location.pathname]);

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const ch1 = supabase.channel("ambos-producer-leads")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads", filter: `producer_id=eq.${user.id}` }, () => {
        setNewNotif(true);
        toast({ title: "Atualização no seu pedido!" });
        if (activeTab === "pedidos") loadMyLeads();
      }).subscribe();
    const ch2 = supabase.channel("ambos-provider-leads")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads", filter: `provider_id=eq.${user.id}` }, () => {
        setNewNotif(true);
        toast({ title: "Nova solicitação de serviço!" });
        if (activeTab === "servicos") loadServices();
      }).subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "prestadores" || activeTab === "inicio") loadProviders();
    if (activeTab === "pedidos") { loadMyLeads(); setNewNotif(false); }
    if (activeTab === "servicos") { loadServices(); setNewNotif(false); }
    if (activeTab === "agenda") loadContracts();
    if (activeTab === "ganhos") loadEarnings();
  }, [activeTab, user]);

  const loadData = async () => {
    if (!user) return;
    const [leadsRes, contractsRes] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact" }).or(`producer_id.eq.${user.id},provider_id.eq.${user.id}`),
      supabase.from("contracts").select("id", { count: "exact" }).or(`producer_id.eq.${user.id},provider_id.eq.${user.id}`),
    ]);
    setLeadsCount(leadsRes.count || 0);
    setContractsCount(contractsRes.count || 0);
    const { data: provData } = await supabase.from("providers").select("available").eq("user_id", user.id).maybeSingle();
    if (provData?.available) setDisponibilidade(provData.available as any);
  };

  const loadProviders = async () => {
    setLoadingProviders(true);
    const { data: providerData } = await supabase.from("providers").select("*").order("created_at", { ascending: false });
    if (providerData && providerData.length > 0) {
      const userIds = [...new Set(providerData.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, city, state, avatar_url").in("id", userIds);
      const map = new Map((profiles || []).map(p => [p.id, p]));
      setProviders(providerData.filter(p => p.user_id !== user?.id).map(p => ({ ...p, profile: map.get(p.user_id) || null })));
    } else setProviders([]);
    setLoadingProviders(false);
  };

  const loadMyLeads = async () => {
    if (!user) return;
    setLoadingLeads(true);
    const { data } = await supabase.from("leads").select("*").eq("producer_id", user.id).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const ids = [...new Set(data.map(l => l.provider_id).filter(Boolean))];
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, city, state, avatar_url").in("id", ids);
        const map = new Map((profiles || []).map(p => [p.id, p]));
        setMyLeads(data.map(l => ({ ...l, provider: map.get(l.provider_id) || null })));
      } else setMyLeads(data);
    } else setMyLeads([]);
    setLoadingLeads(false);
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
      } else setMyServices(data);
    } else setMyServices([]);
    setLoadingServices(false);
  };

  const loadContracts = async () => {
    if (!user) return;
    setLoadingContracts(true);
    const { data } = await supabase.from("contracts").select("*").or(`provider_id.eq.${user.id},producer_id.eq.${user.id}`).order("scheduled_date", { ascending: true });
    setContracts(data || []);
    setLoadingContracts(false);
  };

  const loadEarnings = async () => {
    if (!user) return;
    const { data } = await supabase.from("contracts").select("*").eq("provider_id", user.id).eq("status", "completed");
    const list = data || [];
    const now = new Date();
    const monthTotal = list.filter(c => { const d = new Date(c.completed_at || c.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, c) => s + (Number(c.gross_amount) || 0), 0);
    setEarnings({ month: monthTotal, total: list.reduce((s, c) => s + (Number(c.gross_amount) || 0), 0), costs: list.reduce((s, c) => s + (Number(c.cost_amount) || 0), 0) });
    setEarningsContracts(list);
  };

  const handleSendLead = async () => {
    if (!user || !newLeadService.trim()) { toast({ title: "Selecione o serviço.", variant: "destructive" }); return; }
    setSendingLead(true);
    const leadData: any = { producer_id: user.id, producer_name: user.name || "", service: newLeadService, message: newLeadMessage || null, requested_date: newLeadDate || null, location_text: newLeadLocation || null, budget: newLeadBudget ? Number(newLeadBudget) : null, status: "pending" };
    if (newLeadProviderId) leadData.provider_id = newLeadProviderId;
    const { error } = await supabase.from("leads").insert(leadData);
    if (error) toast({ title: "Erro ao enviar.", variant: "destructive" });
    else { toast({ title: "Pedido enviado!" }); setShowNewLead(false); setNewLeadService(""); setNewLeadMessage(""); setNewLeadDate(""); setNewLeadLocation(""); setNewLeadBudget(""); setNewLeadProviderId(""); loadMyLeads(); }
    setSendingLead(false);
  };

  const handleCreateService = async () => {
    if (!user || !newSvcType) { toast({ title: "Selecione o serviço.", variant: "destructive" }); return; }
    setCreatingSvc(true);
    const { error } = await supabase.from("leads").insert({ provider_id: user.id, service: newSvcType, requested_date: newSvcDate || null, location_text: newSvcLocation || null, budget: newSvcBudget ? Number(newSvcBudget) : null, message: newSvcNotes || null, status: "pending" });
    if (error) toast({ title: "Erro.", variant: "destructive" });
    else { toast({ title: "Serviço criado!" }); setShowCreateService(false); setNewSvcType(""); setNewSvcDate(""); setNewSvcLocation(""); setNewSvcBudget(""); setNewSvcNotes(""); loadServices(); }
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
    await supabase.from("contracts").insert({ provider_id: user.id, producer_id: lead.producer_id || null, lead_id: lead.id, service_name: lead.service, scheduled_date: lead.requested_date || null, gross_amount: lead.budget || 0, cost_amount: 0, status: "completed", completed_at: new Date().toISOString() });
    await supabase.from("leads").update({ status: "completed" }).eq("id", lead.id);
    toast({ title: "Serviço concluído!" });
    loadServices(); loadData();
  };

  const saveDisponibilidade = async (value: "now" | "week" | "busy") => {
    setDisponibilidade(value);
    if (!user) return;
    setSavingDisp(true);
    const { data: existing } = await supabase.from("providers").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) await supabase.from("providers").update({ available: value }).eq("user_id", user.id);
    else await supabase.from("providers").insert({ user_id: user.id, available: value });
    setSavingDisp(false);
    toast({ title: "Status atualizado!" });
  };

  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) { toast({ title: "GPS não suportado.", variant: "destructive" }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setSearchCity(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`); toast({ title: "Localização obtida!" }); },
      () => toast({ title: "Erro ao obter localização.", variant: "destructive" })
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!user) return null;

  const firstName = (user.name || "").split(" ")[0] || "Usuário";
  const dispLabel = disponibilidade === "now" ? "Disponível" : disponibilidade === "week" ? "Esta semana" : "Ocupado";
  const dispColor = disponibilidade === "now" ? "bg-green-500" : disponibilidade === "week" ? "bg-amber-500" : "bg-destructive";

  const handleTabClick = (item: typeof sidebarItems[0]) => {
    if (item.id === "blog") { navigate("/blog"); return; }
    if (item.id === "perfil") { navigate("/perfil"); return; }
    setActiveTab(item.id);
    setSidebarOpen(false);
    if (item.path !== location.pathname) navigate(item.path);
  };

  const filteredProviders = providers.filter(p => {
    const profile = p.profile;
    if (searchCity && !(profile?.city || "").toLowerCase().includes(searchCity.toLowerCase()) && !(profile?.state || "").toLowerCase().includes(searchCity.toLowerCase())) return false;
    if (searchService && !(p.category || "").toLowerCase().includes(searchService.toLowerCase())) return false;
    if (searchAvail && p.available !== searchAvail) return false;
    return true;
  });

  const onlineProviders = providers.filter(p => p.available === "now");

  return (
    <div className="min-h-screen flex bg-[hsl(130,11%,97%)]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[hsl(200,40%,15%)] text-white min-h-screen p-4 gap-1 fixed left-0 top-0 bottom-0 z-30">
        <div className="flex items-center gap-2 px-3 py-4 mb-4">
          <Users size={22} className="text-emerald-300" />
          <span className="font-semibold text-lg">AgroConnect</span>
        </div>
        <p className="px-3 text-emerald-200/60 text-sm mb-3">Painel Completo</p>
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => handleTabClick(item)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-colors ${activeTab === item.id ? "bg-white/15 font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
            <item.icon size={18} /> {item.label}
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-white/10">
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] text-white/60 hover:text-white hover:bg-white/10 w-full"><LogOut size={18} /> Sair</button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[hsl(200,40%,15%)] text-white p-4 flex flex-col gap-1 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-4 mb-2">
              <div className="flex items-center gap-2"><Users size={20} className="text-emerald-300" /><span className="font-semibold">AgroConnect</span></div>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <p className="px-3 text-emerald-200/60 text-sm mb-3">Painel Completo</p>
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

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" /> : <User size={28} className="text-muted-foreground" />}
              </div>
              <div>
                <h3 className="text-lg font-medium">{selectedUser.full_name || "Usuário"}</h3>
                {selectedUser.category && <p className="text-sm text-primary font-medium">{selectedUser.category}</p>}
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {selectedUser.city}, {selectedUser.state}</p>
              </div>
            </div>
            {selectedUser.phone && (
              <a href={`https://wa.me/55${selectedUser.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                <MessageCircle size={18} /> WhatsApp
              </a>
            )}
            {selectedUser.provider_id && (
              <button onClick={() => { setNewLeadProviderId(selectedUser.provider_user_id || ""); setSelectedUser(null); setShowNewLead(true); setActiveTab("pedidos"); }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                <Send size={18} /> Solicitar Serviço
              </button>
            )}
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {showNewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewLead(false)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowNewLead(false)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <h3 className="text-lg font-medium">Novo Pedido</h3>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Serviço *</label>
              <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadService} onChange={e => setNewLeadService(e.target.value)}>
                <option value="">Selecione...</option>
                {serviceCategories.map(g => (<optgroup key={g.group} label={g.group}>{g.services.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>))}
              </select>
            </div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Data</label><input type="date" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadDate} onChange={e => setNewLeadDate(e.target.value)} /></div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Local</label><input type="text" placeholder="Ex: Boa Esperança, MG" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadLocation} onChange={e => setNewLeadLocation(e.target.value)} /></div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Orçamento (R$)</label><input type="number" placeholder="0,00" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadBudget} onChange={e => setNewLeadBudget(e.target.value)} /></div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Mensagem</label><textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[80px] resize-none" value={newLeadMessage} onChange={e => setNewLeadMessage(e.target.value)} placeholder="Descreva..." /></div>
            <button onClick={handleSendLead} disabled={sendingLead || !newLeadService} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 flex items-center justify-center gap-2"><Send size={18} /> {sendingLead ? "Enviando..." : "Enviar"}</button>
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateService(false)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowCreateService(false)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <h3 className="text-lg font-medium">Criar Solicitação</h3>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Serviço *</label>
              <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newSvcType} onChange={e => setNewSvcType(e.target.value)}>
                <option value="">Selecione...</option>
                {serviceCategories.map(g => (<optgroup key={g.group} label={g.group}>{g.services.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>))}
              </select>
            </div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Data</label><input type="date" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newSvcDate} onChange={e => setNewSvcDate(e.target.value)} /></div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Local</label><input type="text" placeholder="Ex: Boa Esperança" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newSvcLocation} onChange={e => setNewSvcLocation(e.target.value)} /></div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Valor (R$)</label><input type="number" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newSvcBudget} onChange={e => setNewSvcBudget(e.target.value)} /></div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Observações</label><textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[80px] resize-none" value={newSvcNotes} onChange={e => setNewSvcNotes(e.target.value)} /></div>
            <button onClick={handleCreateService} disabled={creatingSvc || !newSvcType} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 flex items-center justify-center gap-2"><Send size={18} /> {creatingSvc ? "Criando..." : "Criar"}</button>
          </div>
        </div>
      )}

      {/* Main content */}
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
            setNewNotif(false);
            if ("Notification" in window && Notification.permission === "default") {
              const perm = await Notification.requestPermission();
              if (perm === "granted") toast({ title: "Notificações ativadas!" });
            }
          }} className="p-2 rounded-xl hover:bg-muted relative">
            <Bell size={20} className="text-muted-foreground" />
            {newNotif && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-destructive" />}
          </button>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* INÍCIO */}
          {activeTab === "inicio" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} /><span>{user.city}, {user.state} — Produtor + Prestador</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard icon={FileText} label="Pedidos" value={String(leadsCount)} />
                <MetricCard icon={Wrench} label="Serviços" value={String(myServices.length)} />
                <MetricCard icon={CheckCircle} label="Concluídos" value={String(contractsCount)} />
                <MetricCard icon={DollarSign} label="Ganhos" value={`R$ ${earnings.total.toFixed(0)}`} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => setActiveTab("prestadores")} className="card-agro text-center py-4 hover:border-primary/30 transition-colors">
                  <Search size={24} className="mx-auto text-primary mb-1.5" /><p className="text-sm font-medium">Buscar</p>
                  <p className="text-xs text-muted-foreground">{onlineProviders.length} online</p>
                </button>
                <button onClick={() => setActiveTab("pedidos")} className="card-agro text-center py-4 hover:border-primary/30 transition-colors">
                  <FileText size={24} className="mx-auto text-amber-600 mb-1.5" /><p className="text-sm font-medium">Pedidos</p>
                </button>
                <button onClick={() => setActiveTab("servicos")} className="card-agro text-center py-4 hover:border-primary/30 transition-colors">
                  <Wrench size={24} className="mx-auto text-blue-600 mb-1.5" /><p className="text-sm font-medium">Serviços</p>
                </button>
                <button onClick={() => setActiveTab("ganhos")} className="card-agro text-center py-4 hover:border-primary/30 transition-colors">
                  <DollarSign size={24} className="mx-auto text-green-600 mb-1.5" /><p className="text-sm font-medium">Ganhos</p>
                </button>
              </div>
            </>
          )}

          {/* PRESTADORES */}
          {activeTab === "prestadores" && (
            <div className="space-y-4">
              <h2 className="font-medium text-lg">🔍 Prestadores de Serviço</h2>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Buscar por cidade..." className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 bg-background text-sm" value={searchCity} onChange={e => setSearchCity(e.target.value)} />
                  </div>
                  <button onClick={handleUseDeviceLocation} className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm hover:bg-muted"><MapPin size={16} /></button>
                </div>
                <div className="flex gap-2">
                  <select className="flex-1 border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={searchService} onChange={e => setSearchService(e.target.value)}>
                    <option value="">Todos os serviços</option>
                    {serviceCategories.map(g => (<optgroup key={g.group} label={g.group}>{g.services.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>))}
                  </select>
                  <select className="border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={searchAvail} onChange={e => setSearchAvail(e.target.value)}>
                    <option value="">Disponibilidade</option><option value="now">Disponível</option><option value="week">Esta semana</option>
                  </select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{filteredProviders.length} encontrado{filteredProviders.length !== 1 ? "s" : ""}</p>
              {loadingProviders ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
              ) : filteredProviders.length === 0 ? (
                <EmptyState icon={Search} title="Nenhum prestador" description="Ajuste os filtros." />
              ) : (
                <div className="space-y-3">
                  {filteredProviders.map(p => (
                    <ProviderCard key={p.id} provider={p} onClickUser={setSelectedUser} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PEDIDOS (producer role) */}
          {activeTab === "pedidos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">📋 Meus Pedidos</h2>
                <button onClick={() => setShowNewLead(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus size={16} /> Novo</button>
              </div>
              {loadingLeads ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
              : myLeads.length === 0 ? (
                <div className="text-center py-12"><FileText size={40} className="mx-auto text-muted-foreground/40 mb-3" /><p className="font-medium">Nenhum pedido</p>
                  <button onClick={() => setShowNewLead(true)} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus size={16} /> Criar</button></div>
              ) : (
                <div className="space-y-3">
                  {myLeads.map(lead => (
                    <div key={lead.id} className="card-agro space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[15px]">{lead.service || "Serviço"}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${lead.status === "pending" ? "bg-amber-100 text-amber-700" : lead.status === "accepted" ? "bg-green-100 text-green-700" : "bg-green-100 text-green-700"}`}>
                          {lead.status === "pending" ? "Pendente" : lead.status === "accepted" ? "Aceito" : "Concluído"}
                        </span>
                      </div>
                      {lead.requested_date && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> {new Date(lead.requested_date).toLocaleDateString("pt-BR")}</p>}
                      {lead.location_text && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {lead.location_text}</p>}
                      {lead.budget && <p className="text-xs text-muted-foreground">R$ {Number(lead.budget).toFixed(2)}</p>}
                      {lead.provider?.phone && (
                        <a href={`https://wa.me/55${lead.provider.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100"><Phone size={14} /> WhatsApp</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SERVIÇOS (provider role) */}
          {activeTab === "servicos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">🔧 Serviços</h2>
                <button onClick={() => setShowCreateService(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus size={16} /> Criar</button>
              </div>
              {loadingServices ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
              : myServices.length === 0 ? <EmptyState icon={Wrench} title="Nenhum serviço" description="Crie uma solicitação ou aguarde." />
              : (
                <div className="space-y-3">
                  {myServices.map(lead => (
                    <div key={lead.id} className="card-agro space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[15px]">{lead.service || "Serviço"}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${lead.status === "pending" ? "bg-amber-100 text-amber-700" : lead.status === "accepted" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {lead.status === "pending" ? "Pendente" : lead.status === "accepted" ? "Aceito" : "Concluído"}
                        </span>
                      </div>
                      {lead.requested_date && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} /> {new Date(lead.requested_date).toLocaleDateString("pt-BR")}</p>}
                      {lead.location_text && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {lead.location_text}</p>}
                      {lead.budget && <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign size={12} /> R$ {Number(lead.budget).toFixed(2)}</p>}
                      {lead.producer && <button onClick={() => setSelectedUser(lead.producer)} className="text-sm text-muted-foreground hover:text-foreground">Produtor: <span className="font-medium text-foreground underline">{lead.producer.full_name}</span></button>}
                      <div className="flex flex-wrap gap-2">
                        {!lead.provider_id && lead.status === "pending" && <button onClick={() => handleAcceptLead(lead.id)} className="inline-flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700"><CheckCircle size={14} /> Aceitar</button>}
                        {lead.provider_id === user?.id && lead.status === "accepted" && <button onClick={() => handleCompleteLead(lead)} className="inline-flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700"><CheckCircle size={14} /> Concluir</button>}
                        {lead.producer?.phone && <a href={`https://wa.me/55${lead.producer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100"><Phone size={14} /> WhatsApp</a>}
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
                <input type="text" placeholder="Buscar..." className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 bg-background text-sm" value={agendaSearch} onChange={e => setAgendaSearch(e.target.value)} />
              </div>
              {loadingContracts ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
              : contracts.length === 0 ? <EmptyState icon={Calendar} title="Agenda vazia" description="Conclua serviços para vê-los aqui." />
              : (
                <div className="space-y-3">
                  {contracts.filter(c => !agendaSearch || (c.service_name || "").toLowerCase().includes(agendaSearch.toLowerCase())).map(c => (
                    <div key={c.id} className="card-agro space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[15px]">{c.service_name || "Serviço"}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{c.status === "completed" ? "Concluído" : "Ativo"}</span>
                      </div>
                      {c.scheduled_date && <p className="text-xs text-muted-foreground"><Calendar size={12} className="inline mr-1" />{new Date(c.scheduled_date).toLocaleDateString("pt-BR")}</p>}
                      <div className="flex gap-4 text-sm">
                      {c.gross_amount != null && <span className="text-green-700">R$ {Number(c.gross_amount).toFixed(2)}</span>}
                        {c.cost_amount != null && Number(c.cost_amount) > 0 && <span className="text-red-600">Custo: R$ {Number(c.cost_amount).toFixed(2)}</span>}
                      </div>
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
                <button onClick={() => setMarketplaceTab("explorar")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${marketplaceTab === "explorar" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Explorar</button>
                <button onClick={() => setMarketplaceTab("meus")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${marketplaceTab === "meus" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Meus</button>
              </div>
              {marketplaceTab === "meus" ? <MeusAnuncios userId={user.id} /> : <MarketplaceExplorar />}
            </div>
          )}

          {/* GANHOS */}
          {activeTab === "ganhos" && (
            <div className="space-y-4">
              <h2 className="font-medium text-lg">💰 Meus Ganhos</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="card-agro text-center py-5"><p className="text-2xl font-medium text-green-700">R$ {earnings.month.toFixed(2)}</p><p className="text-sm text-muted-foreground mt-1">Este mês</p></div>
                <div className="card-agro text-center py-5"><p className="text-2xl font-medium">R$ {earnings.total.toFixed(2)}</p><p className="text-sm text-muted-foreground mt-1">Total</p></div>
                <div className="card-agro text-center py-5"><p className="text-2xl font-medium text-red-600">R$ {earnings.costs.toFixed(2)}</p><p className="text-sm text-muted-foreground mt-1">Custos</p></div>
              </div>
              <div className="card-agro text-center py-4"><p className="text-lg font-medium">Lucro: R$ {(earnings.total - earnings.costs).toFixed(2)}</p></div>
              {earningsContracts.length === 0 ? <EmptyState icon={DollarSign} title="Sem ganhos" description="Conclua serviços." />
              : <div className="space-y-3">{earningsContracts.map(c => (
                <div key={c.id} className="card-agro flex items-center justify-between">
                  <div><p className="font-medium text-[15px]">{c.service_name || "Serviço"}</p><p className="text-xs text-muted-foreground">{c.completed_at ? new Date(c.completed_at).toLocaleDateString("pt-BR") : "—"}</p></div>
                  <p className="font-medium text-green-700">R$ {Number(c.gross_amount || 0).toFixed(2)}</p>
                </div>
              ))}</div>}
            </div>
          )}

          {/* DISPONIBILIDADE */}
          {activeTab === "disponibilidade" && (
            <div className="space-y-4">
              <h2 className="font-medium text-lg">🟢 Disponibilidade</h2>
              <p className="text-sm text-muted-foreground">Seu status como prestador de serviços.</p>
              <div className="space-y-2.5">
                {[
                  { value: "now" as const, label: "Disponível agora", desc: "Aceito trabalhos imediatamente", dot: "bg-green-500" },
                  { value: "week" as const, label: "Esta semana", desc: "Posso agendar", dot: "bg-amber-500" },
                  { value: "busy" as const, label: "Ocupado", desc: "Não aceito serviços no momento", dot: "bg-destructive" },
                ].map(opt => (
                  <button key={opt.value} onClick={() => saveDisponibilidade(opt.value)} disabled={savingDisp}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${disponibilidade === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 ${opt.dot}`} />
                    <div><p className="text-[15px] font-medium">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.desc}</p></div>
                    {disponibilidade === opt.value && <CheckCircle size={18} className="ml-auto text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FAZENDA - reuse FazendaTab from PainelProdutor */}
          {activeTab === "fazenda" && <FazendaTabSimple user={user} />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20 flex" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {[
          { id: "inicio", label: "Início", icon: Home },
          { id: "prestadores", label: "Buscar", icon: Search },
          { id: "pedidos", label: "Pedidos", icon: FileText },
          { id: "servicos", label: "Serviços", icon: Wrench },
          { id: "marketplace", label: "Loja", icon: ShoppingBag },
        ].map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); navigate(`/ambos${item.id === "inicio" ? "" : "/" + item.id}`); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium relative ${activeTab === item.id ? "text-primary" : "text-muted-foreground"}`}>
            <item.icon size={20} />
            {item.label}
            {(item.id === "pedidos" || item.id === "servicos") && newNotif && <span className="absolute top-1 w-2 h-2 rounded-full bg-destructive" />}
          </button>
        ))}
      </nav>
    </div>
  );
}

// Provider card component
function ProviderCard({ provider, onClickUser }: { provider: any; onClickUser: (u: any) => void }) {
  const profile = provider.profile;
  const dispLabel = provider.available === "now" ? "Disponível" : provider.available === "week" ? "Esta semana" : "Ocupado";
  const dispBg = provider.available === "now" ? "bg-green-100 text-green-700" : provider.available === "week" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  const dispColor = provider.available === "now" ? "bg-green-500" : provider.available === "week" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="card-agro space-y-2 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onClickUser({ ...profile, category: provider.category, bio: provider.bio, available: provider.available, provider_id: provider.id, provider_user_id: provider.user_id })}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <User size={18} className="text-muted-foreground" />}
          </div>
          <div>
            <h3 className="font-medium text-[15px]">{profile?.full_name || "Prestador"}</h3>
            {provider.category && <p className="text-xs text-muted-foreground">{provider.category}</p>}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${dispBg}`}><span className={`w-2 h-2 rounded-full ${dispColor}`} />{dispLabel}</span>
      </div>
      {profile && <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin size={12} />{profile.city}, {profile.state}</p>}
      {provider.bio && <p className="text-sm text-muted-foreground line-clamp-2">{provider.bio}</p>}
      {profile?.phone && (
        <a href={`https://wa.me/55${profile.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100"><Phone size={14} /> WhatsApp</a>
      )}
    </div>
  );
}

// Simplified Fazenda tab
function FazendaTabSimple({ user }: { user: any }) {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [minStock, setMinStock] = useState("");
  const [saving, setSaving] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(user.lat && user.lng ? { lat: user.lat, lng: user.lng } : null);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => { loadInventory(); }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLoadingMap(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCoords(coords); setLoadingMap(false);
        await supabase.from("profiles").update({ lat: coords.lat, lng: coords.lng }).eq("id", user.id);
        toast({ title: "Localização obtida!" });
      },
      () => { setLoadingMap(false); toast({ title: "Erro no GPS.", variant: "destructive" }); }
    );
  };

  const loadInventory = async () => {
    setLoadingInv(true);
    const { data } = await supabase.from("inventory").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setInventory(data || []); setLoadingInv(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("inventory").insert({ user_id: user.id, name, category: category || null, quantity: Number(quantity) || 0, unit, min_stock: Number(minStock) || 0 });
    toast({ title: "Item adicionado!" }); setShowAdd(false); setName(""); setCategory(""); setQuantity(""); loadInventory();
    setSaving(false);
  };

  const handleDelete = async (id: string) => { await supabase.from("inventory").delete().eq("id", id); setInventory(prev => prev.filter(i => i.id !== id)); };
  const handleUpdateQty = async (id: string, q: number) => { await supabase.from("inventory").update({ quantity: q }).eq("id", id); setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: q } : i)); };

  return (
    <div className="space-y-4">
      <h2 className="font-medium text-lg">🌾 Minha Fazenda</h2>
      <div className="card-agro space-y-3">
        <div><label className="text-sm text-muted-foreground mb-1 block">Culturas</label>
          <div className="flex flex-wrap gap-2">{(user.productionTypes || ["Café"]).map((t: string, i: number) => <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{t}</span>)}</div>
        </div>
        <div><label className="text-sm text-muted-foreground mb-1 block">Propriedade</label><p className="font-medium">{user.propertySize || "Não informado"}</p></div>
      </div>
      <div className="card-agro space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">🛰️ Vista Satélite</h3>
          <button onClick={handleGetLocation} disabled={loadingMap} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
            <MapPin size={14} /> {loadingMap ? "..." : mapCoords ? "Atualizar" : "GPS"}
          </button>
        </div>
        {mapCoords ? (
          <div className="rounded-xl overflow-hidden border border-border">
            <iframe title="Satélite" width="100%" height="250" style={{ border: 0 }} loading="lazy" src={`https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=16&t=k&output=embed`} />
          </div>
        ) : (
          <div className="rounded-xl bg-muted/50 border border-border p-8 text-center"><MapPin size={32} className="mx-auto text-muted-foreground/40 mb-2" /><p className="text-sm text-muted-foreground">Toque em GPS para visualizar</p></div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">📦 Estoque</h3>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Plus size={16} /> Adicionar</button>
      </div>
      {loadingInv ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      : inventory.length === 0 ? <EmptyState icon={Store} title="Estoque vazio" description="Adicione itens." />
      : <div className="space-y-2">{inventory.map(item => (
        <div key={item.id} className="card-agro flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-[15px] truncate">{item.name}</h4>
            <span className="text-sm">{Number(item.quantity)} {item.unit}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => handleUpdateQty(item.id, Math.max(0, Number(item.quantity) - 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">−</button>
            <span className="w-10 text-center text-sm">{Number(item.quantity)}</span>
            <button onClick={() => handleUpdateQty(item.id, Number(item.quantity) + 1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">+</button>
            <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10 flex items-center justify-center ml-1"><X size={16} /></button>
          </div>
        </div>
      ))}</div>}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <h3 className="text-lg font-medium">Adicionar Item</h3>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nome *</label><input type="text" placeholder="Ex: Adubo NPK" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Categoria</label>
              <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Selecione...</option><option>Fertilizantes</option><option>Defensivos</option><option>Sementes</option><option>Ferramentas</option><option>Combustível</option><option>Outros</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Quantidade</label><input type="number" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={quantity} onChange={e => setQuantity(e.target.value)} /></div>
              <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Unidade</label>
                <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={unit} onChange={e => setUnit(e.target.value)}><option>kg</option><option>L</option><option>un</option><option>sacas</option></select>
              </div>
            </div>
            <div><label className="text-sm font-medium text-muted-foreground mb-1.5 block">Estoque mínimo</label><input type="number" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={minStock} onChange={e => setMinStock(e.target.value)} /></div>
            <button onClick={handleAdd} disabled={saving || !name.trim()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50">{saving ? "Salvando..." : "Adicionar"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Marketplace explorer
function MarketplaceExplorar() {
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState(true);

  useEffect(() => {
    supabase.from("anuncios").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { setAnuncios(data || []); setLoadingState(false); });
  }, []);

  if (loadingState) return <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>;
  if (anuncios.length === 0) return <EmptyState icon={ShoppingBag} title="Nenhum anúncio" description="Quando publicados, aparecerão aqui." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {anuncios.map(a => (
        <Link key={a.id} to={`/marketplace/${a.id}`} className="card-agro !p-0 overflow-hidden hover:border-primary/30 transition-colors">
          {a.photos && a.photos.length > 0 ? <img src={a.photos[0]} alt={a.title} className="w-full h-36 object-cover" /> : <div className="w-full h-36 bg-muted flex items-center justify-center"><Store size={24} className="text-muted-foreground/40" /></div>}
          <div className="p-3">
            <h3 className="font-medium text-[15px]">{a.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
            <div className="flex items-center justify-between mt-3">
              {a.price && <span className="text-sm font-medium text-primary">R$ {a.price}</span>}
              <span className="text-xs text-muted-foreground">{a.city}, {a.state}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

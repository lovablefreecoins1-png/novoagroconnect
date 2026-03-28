import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home, Search, FileText, Clock, Landmark, CloudSun, User, Store,
  MapPin, ChevronRight, Star, Coffee, Wrench, Users, Tractor,
  Menu, X, LogOut, Bell, ShoppingBag, BookOpen, Phone, CheckCircle,
  MessageCircle, Plus, Send, Filter, Loader2
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import EmptyState from "@/components/EmptyState";
import MeusAnuncios from "@/components/MeusAnuncios";
import { useToast } from "@/hooks/use-toast";
import { serviceCategories } from "@/data/categories";

const sidebarItems = [
  { id: "inicio", label: "Início", icon: Home, path: "/produtor" },
  { id: "prestadores", label: "Prestadores", icon: Search, path: "/produtor/prestadores" },
  { id: "pedidos", label: "Meus Pedidos", icon: FileText, path: "/produtor/pedidos" },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, path: "/produtor/marketplace" },
  { id: "fazenda", label: "Minha Fazenda", icon: Landmark, path: "/produtor/fazenda" },
  { id: "blog", label: "Blog", icon: BookOpen, path: "/produtor/blog" },
  { id: "perfil", label: "Perfil", icon: User, path: "/perfil" },
];

export default function PainelProdutor() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [leadsCount, setLeadsCount] = useState(0);
  const [marketplaceTab, setMarketplaceTab] = useState<"explorar" | "meus">("explorar");
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Search filters
  const [searchCity, setSearchCity] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchAvail, setSearchAvail] = useState("");

  // New lead form
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLeadService, setNewLeadService] = useState("");
  const [newLeadMessage, setNewLeadMessage] = useState("");
  const [newLeadDate, setNewLeadDate] = useState("");
  const [newLeadLocation, setNewLeadLocation] = useState("");
  const [newLeadBudget, setNewLeadBudget] = useState("");
  const [newLeadProviderId, setNewLeadProviderId] = useState("");
  const [sendingLead, setSendingLead] = useState(false);

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newNotif, setNewNotif] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    const found = sidebarItems.find(i => path === i.path);
    if (found) setActiveTab(found.id);
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      supabase.from("leads").select("id", { count: "exact" }).eq("producer_id", user.id)
        .then(({ count }) => setLeadsCount(count || 0));
    }
  }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("produtor-leads")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leads", filter: `producer_id=eq.${user.id}` }, () => {
        setNewNotif(true);
        toast({ title: "Atualização no seu pedido!", description: "Um prestador respondeu." });
        if (activeTab === "pedidos") loadMyLeads();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activeTab]);

  useEffect(() => {
    if ((activeTab === "prestadores" || activeTab === "inicio") && user) loadProviders();
    if (activeTab === "pedidos" && user) { loadMyLeads(); setNewNotif(false); }
  }, [activeTab, user]);

  const loadProviders = async () => {
    setLoadingProviders(true);
    const { data: providerData } = await supabase.from("providers").select("*").order("created_at", { ascending: false });

    if (providerData && providerData.length > 0) {
      const userIds = [...new Set(providerData.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, city, state, avatar_url").in("id", userIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      setProviders(providerData.map(p => ({ ...p, profile: profileMap.get(p.user_id) || null })));
    } else {
      setProviders([]);
    }
    setLoadingProviders(false);
  };

  const loadMyLeads = async () => {
    if (!user) return;
    setLoadingLeads(true);
    const { data } = await supabase.from("leads").select("*").eq("producer_id", user.id).order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const providerIds = [...new Set(data.map(l => l.provider_id).filter(Boolean))];
      if (providerIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, city, state, avatar_url").in("id", providerIds);
        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        setMyLeads(data.map(l => ({ ...l, provider: profileMap.get(l.provider_id) || null })));
      } else {
        setMyLeads(data);
      }
    } else {
      setMyLeads([]);
    }
    setLoadingLeads(false);
  };

  const handleSendLead = async () => {
    if (!user || !newLeadService.trim()) {
      toast({ title: "Selecione o tipo de serviço.", variant: "destructive" });
      return;
    }
    setSendingLead(true);
    const leadData: any = {
      producer_id: user.id,
      producer_name: user.name || "",
      service: newLeadService,
      message: newLeadMessage || null,
      requested_date: newLeadDate || null,
      location_text: newLeadLocation || null,
      budget: newLeadBudget ? Number(newLeadBudget) : null,
      status: "pending",
    };
    if (newLeadProviderId) leadData.provider_id = newLeadProviderId;

    const { error } = await supabase.from("leads").insert(leadData);
    if (error) {
      toast({ title: "Erro ao enviar pedido.", variant: "destructive" });
    } else {
      toast({ title: "Pedido enviado com sucesso!" });
      setShowNewLead(false);
      setNewLeadService(""); setNewLeadMessage(""); setNewLeadDate(""); setNewLeadLocation(""); setNewLeadBudget(""); setNewLeadProviderId("");
      setLeadsCount(prev => prev + 1);
      loadMyLeads();
    }
    setSendingLead(false);
  };

  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocalização não suportada neste dispositivo.", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchCity(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        toast({ title: "Localização obtida!" });
      },
      () => toast({ title: "Não foi possível obter localização.", variant: "destructive" })
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!user) return null;

  const firstName = (user.name || "").split(" ")[0] || "Produtor";
  const now = new Date();
  const month = now.getMonth();
  const isSafra = month >= 3 && month <= 7;

  const handleTabClick = (item: typeof sidebarItems[0]) => {
    if (item.id === "blog") { navigate("/blog"); return; }
    if (item.id === "perfil") { navigate("/perfil"); return; }
    setActiveTab(item.id);
    setSidebarOpen(false);
    if (item.path !== location.pathname) navigate(item.path);
  };

  // Filter providers
  const filteredProviders = providers.filter(p => {
    const profile = p.profile;
    if (searchCity) {
      const q = searchCity.toLowerCase();
      const cityMatch = (profile?.city || "").toLowerCase().includes(q) || (profile?.state || "").toLowerCase().includes(q);
      if (!cityMatch) return false;
    }
    if (searchService) {
      if (!(p.category || "").toLowerCase().includes(searchService.toLowerCase())) return false;
    }
    if (searchAvail) {
      if (p.available !== searchAvail) return false;
    }
    return true;
  });

  const onlineProviders = providers.filter(p => p.available === "now");
  const availableProviders = providers.filter(p => p.available !== "busy");

  return (
    <div className="min-h-screen flex bg-[hsl(130,11%,97%)]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[hsl(145,45%,12%)] text-white min-h-screen p-4 gap-1 fixed left-0 top-0 bottom-0 z-30">
        <div className="flex items-center gap-2 px-3 py-4 mb-4">
          <Coffee size={24} className="text-green-300" />
          <span className="font-semibold text-lg">AgroConnect</span>
        </div>
        <p className="px-3 text-green-200/70 text-sm mb-3">Painel do Produtor</p>
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => handleTabClick(item)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-colors ${activeTab === item.id ? "bg-white/15 font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
            <item.icon size={18} /> {item.label}
            {item.id === "pedidos" && leadsCount > 0 && <span className="ml-auto bg-green-400 text-white text-[11px] px-1.5 py-0.5 rounded-full">{leadsCount}</span>}
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
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[hsl(145,45%,12%)] text-white p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between px-3 py-4 mb-2">
              <div className="flex items-center gap-2"><Coffee size={22} className="text-green-300" /><span className="font-semibold">AgroConnect</span></div>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <p className="px-3 text-green-200/70 text-sm mb-3">Painel do Produtor</p>
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
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" /> : <User size={28} className="text-muted-foreground" />}
              </div>
              <div>
                <h3 className="text-lg font-medium">{selectedUser.full_name || "Usuário"}</h3>
                {selectedUser.category && <p className="text-sm text-primary font-medium">{selectedUser.category}</p>}
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {selectedUser.city}, {selectedUser.state}</p>
              </div>
            </div>
            {selectedUser.bio && <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>}
            {selectedUser.available && (
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${selectedUser.available === "now" ? "bg-green-100 text-green-700" : selectedUser.available === "week" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                <span className={`w-2 h-2 rounded-full ${selectedUser.available === "now" ? "bg-green-500" : selectedUser.available === "week" ? "bg-amber-500" : "bg-red-500"}`} />
                {selectedUser.available === "now" ? "Disponível" : selectedUser.available === "week" ? "Esta semana" : "Ocupado"}
              </span>
            )}
            {selectedUser.phone && (
              <a href={`https://wa.me/55${selectedUser.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                <MessageCircle size={18} /> Abrir WhatsApp
              </a>
            )}
            {selectedUser.phone && <p className="text-sm text-muted-foreground text-center">Telefone: {selectedUser.phone}</p>}
            {selectedUser.provider_id && (
              <>
                <Link to={`/perfil-prestador/${selectedUser.provider_id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">
                  <User size={18} /> Ver Perfil Completo
                </Link>
                <button onClick={() => { setNewLeadProviderId(selectedUser.provider_user_id || ""); setSelectedUser(null); setShowNewLead(true); setActiveTab("pedidos"); }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  <Send size={18} /> Solicitar Serviço
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* New Lead Form Modal */}
      {showNewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewLead(false)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowNewLead(false)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <h3 className="text-lg font-medium">Novo Pedido de Serviço</h3>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Tipo de serviço *</label>
              <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadService} onChange={e => setNewLeadService(e.target.value)}>
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
              <input type="date" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadDate} onChange={e => setNewLeadDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Local</label>
              <input type="text" placeholder="Ex: Boa Esperança, MG" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadLocation} onChange={e => setNewLeadLocation(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Orçamento estimado (R$)</label>
              <input type="number" placeholder="0,00" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadBudget} onChange={e => setNewLeadBudget(e.target.value)} />
            </div>
            {!newLeadProviderId && providers.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Prestador (opcional)</label>
                <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={newLeadProviderId} onChange={e => setNewLeadProviderId(e.target.value)}>
                  <option value="">Qualquer prestador disponível</option>
                  {providers.filter(p => p.available !== "busy").map(p => (
                    <option key={p.id} value={p.user_id}>{p.profile?.full_name || "Prestador"} — {p.category || "Geral"}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Mensagem (opcional)</label>
              <textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[80px] resize-none" value={newLeadMessage} onChange={e => setNewLeadMessage(e.target.value)} placeholder="Descreva o que você precisa..." maxLength={500} />
            </div>
            <button onClick={handleSendLead} disabled={sendingLead || !newLeadService}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Send size={18} /> {sendingLead ? "Enviando..." : "Enviar Pedido"}
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-6">
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
            <h1 className="text-lg font-medium">Olá, {firstName}!</h1>
          </div>
          <button onClick={async () => {
            setActiveTab("pedidos"); setNewNotif(false);
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
                <MapPin size={14} />
                <span>{user.city || "Boa Esperança"}, {user.state || "MG"} — raio de 100 km</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <a href={`https://www.google.com/search?q=clima+hoje+${encodeURIComponent(user.city || "Boa Esperança")}+${encodeURIComponent(user.state || "MG")}`} target="_blank" rel="noopener noreferrer" className="card-agro flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors">
                  <CloudSun size={28} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Clima Hoje</p>
                    <p className="font-medium text-sm">Ver previsão ☀️</p>
                    <p className="text-xs text-muted-foreground">{user.city || "Boa Esperança"}</p>
                  </div>
                </a>
                <div className="card-agro flex items-center gap-3 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveTab("prestadores")}>
                  <Search size={28} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Prestadores Online</p>
                    <p className="font-medium text-sm">{onlineProviders.length} disponíve{onlineProviders.length !== 1 ? "is" : "l"}</p>
                    <p className="text-xs text-muted-foreground">{providers.length} cadastrados</p>
                  </div>
                </div>
                <div className="card-agro flex items-center gap-3 col-span-2 md:col-span-1 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveTab("pedidos")}>
                  <FileText size={28} className="text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Meus Pedidos</p>
                    <p className="font-medium text-sm">{leadsCount} aberto{leadsCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>

              {isSafra && (
                <div className="rounded-2xl bg-gradient-to-r from-[hsl(145,45%,18%)] to-[hsl(145,40%,25%)] text-white p-5">
                  <div className="flex items-center gap-2 mb-1"><Coffee size={20} /><span className="font-medium">Safra 2026 — Temporada de Colheita</span></div>
                  <p className="text-sm text-white/80">Encontre equipes para panha manual de café na sua região agora.</p>
                  <button onClick={() => setActiveTab("prestadores")} className="inline-flex items-center gap-1 mt-3 text-sm font-medium bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">Buscar prestadores <ChevronRight size={14} /></button>
                </div>
              )}

              {availableProviders.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-medium text-[16px]">Prestadores Disponíveis</h2>
                    <button onClick={() => setActiveTab("prestadores")} className="text-sm text-primary hover:underline flex items-center gap-1">Ver todos <ChevronRight size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableProviders.slice(0, 4).map(p => (
                      <ProviderCardItem key={p.id} provider={p} onClickUser={setSelectedUser} />
                    ))}
                  </div>
                </div>
              )}

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
            </>
          )}

          {/* PRESTADORES */}
          {activeTab === "prestadores" && (
            <div className="space-y-4">
              <h2 className="font-medium text-lg">🔍 Prestadores de Serviço</h2>

              {/* Search filters */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Buscar por cidade/estado..." className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 bg-background text-sm"
                      value={searchCity} onChange={e => setSearchCity(e.target.value)} />
                  </div>
                  <button onClick={handleUseDeviceLocation} className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm hover:bg-muted transition-colors" title="Usar minha localização">
                    <MapPin size={16} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <select className="flex-1 border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={searchService} onChange={e => setSearchService(e.target.value)}>
                    <option value="">Todos os serviços</option>
                    {serviceCategories.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.services.map(s => <option key={s} value={s}>{s}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <select className="border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={searchAvail} onChange={e => setSearchAvail(e.target.value)}>
                    <option value="">Disponibilidade</option>
                    <option value="now">Disponível</option>
                    <option value="week">Esta semana</option>
                    <option value="busy">Ocupado</option>
                  </select>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{filteredProviders.length} prestador{filteredProviders.length !== 1 ? "es" : ""} encontrado{filteredProviders.length !== 1 ? "s" : ""}</p>

              {loadingProviders ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
              ) : filteredProviders.length === 0 ? (
                <EmptyState icon={Search} title="Nenhum prestador encontrado" description="Tente ajustar os filtros de busca." />
              ) : (
                <div className="space-y-3">
                  {filteredProviders.map(p => (
                    <ProviderCardItem key={p.id} provider={p} expanded onClickUser={setSelectedUser} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PEDIDOS */}
          {activeTab === "pedidos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">📋 Meus Pedidos</h2>
                <button onClick={() => setShowNewLead(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Plus size={16} /> Novo Pedido
                </button>
              </div>
              {loadingLeads ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
              ) : myLeads.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={40} className="mx-auto text-muted-foreground/40 mb-3" />
                  <p className="font-medium">Nenhum pedido aberto</p>
                  <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro pedido de serviço.</p>
                  <button onClick={() => setShowNewLead(true)} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                    <Plus size={16} /> Criar Pedido
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myLeads.map(lead => (
                    <div key={lead.id} className="card-agro space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[15px]">{lead.service || "Serviço geral"}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lead.status === "pending" ? "bg-amber-100 text-amber-700" : lead.status === "accepted" ? "bg-green-100 text-green-700" : lead.status === "completed" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                        }`}>
                          {lead.status === "pending" ? "Pendente" : lead.status === "accepted" ? "Aceito" : lead.status === "completed" ? "Concluído" : lead.status}
                        </span>
                      </div>
                      {lead.requested_date && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> {new Date(lead.requested_date).toLocaleDateString("pt-BR")}</p>}
                      {lead.location_text && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {lead.location_text}</p>}
                      {lead.budget && <p className="text-xs text-muted-foreground">Orçamento: R$ {Number(lead.budget).toFixed(2)}</p>}
                      {lead.message && <p className="text-sm text-muted-foreground">{lead.message}</p>}
                      {lead.provider && (
                        <button onClick={() => setSelectedUser({ ...lead.provider })} className="text-sm text-muted-foreground hover:text-foreground">
                          Prestador: <span className="font-medium text-foreground underline">{lead.provider.full_name}</span> — {lead.provider.city}, {lead.provider.state}
                        </button>
                      )}
                      <p className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                      <div className="flex flex-wrap gap-2">
                        {lead.provider?.phone && (
                          <a href={`https://wa.me/55${lead.provider.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
                            <Phone size={14} /> WhatsApp
                          </a>
                        )}
                        {lead.status === "completed" && (
                          <button onClick={() => navigate(`/avaliar/${lead.id}`)} className="inline-flex items-center gap-1.5 text-sm bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600 transition-colors">
                            <Star size={14} /> Avaliar
                          </button>
                        )}
                      </div>
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
                <button onClick={() => setMarketplaceTab("explorar")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${marketplaceTab === "explorar" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Explorar</button>
                <button onClick={() => setMarketplaceTab("meus")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${marketplaceTab === "meus" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Meus Anúncios</button>
              </div>
              {marketplaceTab === "meus" ? <MeusAnuncios userId={user.id} /> : <MarketplaceExplorar />}
            </div>
          )}

          {/* FAZENDA */}
          {activeTab === "fazenda" && (
            <FazendaTab user={user} />
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20 flex" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {[
          { id: "inicio", label: "Início", icon: Home },
          { id: "prestadores", label: "Buscar", icon: Search },
          { id: "pedidos", label: "Pedidos", icon: FileText },
          { id: "marketplace", label: "Loja", icon: ShoppingBag },
          { id: "fazenda", label: "Fazenda", icon: Landmark },
        ].map(item => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); navigate(`/produtor${item.id === "inicio" ? "" : "/" + item.id}`); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium relative ${activeTab === item.id ? "text-primary" : "text-muted-foreground"}`}>
            <item.icon size={20} />
            {item.label}
            {item.id === "pedidos" && newNotif && <span className="absolute top-1 right-1/4 w-2 h-2 rounded-full bg-destructive" />}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ProviderCardItem({ provider, expanded, onClickUser }: { provider: any; expanded?: boolean; onClickUser: (u: any) => void }) {
  const dispLabel = provider.available === "now" ? "Disponível" : provider.available === "week" ? "Esta semana" : "Ocupado";
  const dispColor = provider.available === "now" ? "bg-green-500" : provider.available === "week" ? "bg-amber-500" : "bg-red-500";
  const dispBg = provider.available === "now" ? "bg-green-100 text-green-700" : provider.available === "week" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  const profile = provider.profile;

  const handleClick = () => {
    onClickUser({
      ...profile,
      category: provider.category,
      bio: provider.bio,
      available: provider.available,
      radius_km: provider.radius_km,
      provider_id: provider.id,
      provider_user_id: provider.user_id,
    });
  };

  return (
    <div className="card-agro space-y-2 cursor-pointer hover:border-primary/30 transition-colors" onClick={handleClick}>
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
        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${dispBg}`}>
          <span className={`w-2 h-2 rounded-full ${dispColor}`} />{dispLabel}
        </span>
      </div>
      {profile && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={12} /><span>{profile.city}, {profile.state}</span>
          {provider.radius_km && <span>• Raio: {provider.radius_km} km</span>}
        </div>
      )}
      {expanded && provider.bio && <p className="text-sm text-muted-foreground">{provider.bio}</p>}
      {expanded && profile?.phone && (
        <a href={`https://wa.me/55${profile.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
          <Phone size={14} /> WhatsApp
        </a>
      )}
    </div>
  );
}

function FazendaTab({ user }: { user: any }) {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [minStock, setMinStock] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(
    user.lat && user.lng ? { lat: user.lat, lng: user.lng } : null
  );
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => { loadInventory(); }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { toast({ title: "Geolocalização não suportada.", variant: "destructive" }); return; }
    setLoadingMap(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCoords(coords);
        setLoadingMap(false);
        // Save coords to profile
        await supabase.from("profiles").update({ lat: coords.lat, lng: coords.lng }).eq("id", user.id);
        toast({ title: "Localização obtida!" });
      },
      () => { setLoadingMap(false); toast({ title: "Não foi possível obter localização.", variant: "destructive" }); }
    );
  };

  const loadInventory = async () => {
    setLoadingInv(true);
    const { data } = await supabase.from("inventory").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setInventory(data || []);
    setLoadingInv(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) { toast({ title: "Nome obrigatório.", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("inventory").insert({
      user_id: user.id, name, category: category || null,
      quantity: Number(quantity) || 0, unit, min_stock: Number(minStock) || 0, notes: notes || null,
    });
    if (error) { toast({ title: "Erro ao salvar.", variant: "destructive" }); }
    else { toast({ title: "Item adicionado!" }); setShowAdd(false); setName(""); setCategory(""); setQuantity(""); setUnit("kg"); setMinStock(""); setNotes(""); loadInventory(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("inventory").delete().eq("id", id);
    setInventory(prev => prev.filter(i => i.id !== id));
    toast({ title: "Item removido." });
  };

  const handleUpdateQty = async (id: string, newQty: number) => {
    await supabase.from("inventory").update({ quantity: newQty }).eq("id", id);
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  const lowStock = inventory.filter(i => Number(i.quantity) <= Number(i.min_stock) && Number(i.min_stock) > 0);

  return (
    <div className="space-y-4">
      <h2 className="font-medium text-lg">🌾 Minha Fazenda</h2>

      <div className="card-agro space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Culturas principais</label>
          <div className="flex flex-wrap gap-2">
            {(user.productionTypes || ["Café"]).map((t: string, i: number) => (
              <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Tamanho da propriedade</label>
          <p className="font-medium">{user.propertySize || "Não informado"}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Localização</label>
          <p className="font-medium">{user.city || "Boa Esperança"}, {user.state || "MG"}</p>
        </div>
      </div>

      {/* Satellite Map View */}
      <div className="card-agro space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-[16px]">🛰️ Vista Satélite</h3>
          <button onClick={handleGetLocation} disabled={loadingMap}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <MapPin size={14} /> {loadingMap ? "Buscando..." : mapCoords ? "Atualizar" : "Usar GPS"}
          </button>
        </div>
        {mapCoords ? (
          <div className="rounded-xl overflow-hidden border border-border">
            <iframe
              title="Vista satélite da propriedade"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=16&t=k&output=embed`}
            />
            <p className="text-xs text-muted-foreground p-2 text-center">
              {mapCoords.lat.toFixed(5)}, {mapCoords.lng.toFixed(5)} — {user.city || "Boa Esperança"}, {user.state || "MG"}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-muted/50 border border-border p-8 text-center">
            <MapPin size={32} className="mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Toque em "Usar GPS" para visualizar sua propriedade por satélite</p>
          </div>
        )}
      </div>

      {/* Inventory Control */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[16px]">📦 Controle de Estoque</h3>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm font-medium text-amber-800">⚠️ Estoque baixo</p>
          <p className="text-xs text-amber-700 mt-1">{lowStock.map(i => i.name).join(", ")}</p>
        </div>
      )}

      {loadingInv ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : inventory.length === 0 ? (
        <EmptyState icon={Store} title="Estoque vazio" description="Adicione itens para controlar seu estoque." />
      ) : (
        <div className="space-y-2">
          {inventory.map(item => (
            <div key={item.id} className="card-agro flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-[15px] truncate">{item.name}</h4>
                  {item.category && <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.category}</span>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm font-medium ${Number(item.quantity) <= Number(item.min_stock) && Number(item.min_stock) > 0 ? "text-amber-600" : "text-foreground"}`}>
                    {Number(item.quantity)} {item.unit}
                  </span>
                  {Number(item.min_stock) > 0 && <span className="text-xs text-muted-foreground">Mín: {Number(item.min_stock)} {item.unit}</span>}
                </div>
                {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleUpdateQty(item.id, Math.max(0, Number(item.quantity) - 1))}
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80">−</button>
                <span className="w-10 text-center text-sm font-medium">{Number(item.quantity)}</span>
                <button onClick={() => handleUpdateQty(item.id, Number(item.quantity) + 1)}
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80">+</button>
                <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10 flex items-center justify-center ml-1">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <h3 className="text-lg font-medium">Adicionar Item</h3>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nome *</label>
              <input type="text" placeholder="Ex: Adubo NPK 20-05-20" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Categoria</label>
              <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Selecione...</option>
                <option>Fertilizantes</option><option>Defensivos</option><option>Sementes</option><option>Ferramentas</option><option>Combustível</option><option>Ração</option><option>Outros</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Quantidade</label>
                <input type="number" placeholder="0" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Unidade</label>
                <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={unit} onChange={e => setUnit(e.target.value)}>
                  <option>kg</option><option>L</option><option>un</option><option>sacas</option><option>ton</option><option>m³</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Estoque mínimo (alerta)</label>
              <input type="number" placeholder="0" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={minStock} onChange={e => setMinStock(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Observações</label>
              <textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[60px] resize-none" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Lote, validade..." />
            </div>
            <button onClick={handleAdd} disabled={saving || !name.trim()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? "Salvando..." : "Adicionar Item"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketplaceExplorar() {
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [loadingState, setLoadingState] = useState(true);

  useEffect(() => {
    supabase.from("anuncios").select("*").eq("ativo", true).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { setAnuncios(data || []); setLoadingState(false); });
  }, []);

  if (loadingState) return <p className="text-sm text-muted-foreground py-8 text-center">Carregando anúncios...</p>;
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

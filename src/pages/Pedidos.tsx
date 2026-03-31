import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Plus, Send, X, Loader2, Calendar, DollarSign,
  MapPin, CheckCircle, Clock, Star, Phone, Wrench, FileText, User,
  Filter, Edit2, Trash2, Eye, ListFilter
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { serviceCategories, radiusOptions } from "@/data/categories";
import EmptyState from "@/components/EmptyState";

type ViewMode = "todos" | "meus";
type TabType = "pedidos" | "servicos" | "agenda" | "ganhos";

interface LeadWithProfile {
  id: string;
  producer_id: string | null;
  provider_id: string | null;
  service: string | null;
  message: string | null;
  status: string | null;
  requested_date: string | null;
  location_text: string | null;
  budget: number | null;
  created_at: string;
  producer_name: string | null;
  provider_name: string | null;
  producer?: { full_name: string | null; phone: string | null; city: string | null; state: string | null; avatar_url: string | null; lat: number | null; lng: number | null } | null;
  provider?: { full_name: string | null; phone: string | null; city: string | null; state: string | null; avatar_url: string | null } | null;
  distance?: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Pedidos() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "pedidos";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [viewMode, setViewMode] = useState<ViewMode>("todos");
  const [radiusKm, setRadiusKm] = useState(80);

  // User location
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  // All leads
  const [allLeads, setAllLeads] = useState<LeadWithProfile[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Services (as provider)
  const [myServices, setMyServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Agenda (contracts)
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Earnings
  const [earnings, setEarnings] = useState({ month: 0, total: 0, costs: 0 });
  const [earningsContracts, setEarningsContracts] = useState<any[]>([]);

  // Modals
  const [showNewLead, setShowNewLead] = useState(false);
  const [showCreateService, setShowCreateService] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadWithProfile | null>(null);
  const [detailLead, setDetailLead] = useState<LeadWithProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New lead form
  const [newLeadService, setNewLeadService] = useState("");
  const [newLeadMessage, setNewLeadMessage] = useState("");
  const [newLeadDate, setNewLeadDate] = useState("");
  const [newLeadLocation, setNewLeadLocation] = useState("");
  const [newLeadBudget, setNewLeadBudget] = useState("");
  const [sendingLead, setSendingLead] = useState(false);

  // Service form
  const [newSvcType, setNewSvcType] = useState("");
  const [newSvcDate, setNewSvcDate] = useState("");
  const [newSvcLocation, setNewSvcLocation] = useState("");
  const [newSvcBudget, setNewSvcBudget] = useState("");
  const [newSvcNotes, setNewSvcNotes] = useState("");
  const [creatingSvc, setCreatingSvc] = useState(false);

  const isProvider = user?.role === "prestador" || user?.role === "ambos";

  // Get user location
  useEffect(() => {
    if (user?.lat && user?.lng) {
      setUserLat(user.lat);
      setUserLng(user.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => { setUserLat(-21.0922); setUserLng(-45.5631); },
        { timeout: 10000 }
      );
    } else {
      setUserLat(-21.0922); setUserLng(-45.5631);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "pedidos") loadAllLeads();
    if (activeTab === "servicos") loadServices();
    if (activeTab === "agenda") loadContracts();
    if (activeTab === "ganhos") loadEarnings();
  }, [activeTab, user]);

  const loadAllLeads = async () => {
    if (!user) return;
    setLoadingLeads(true);
    // Load all pending leads + user's own leads
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const producerIds = [...new Set(data.map(l => l.producer_id).filter(Boolean))];
      const providerIds = [...new Set(data.map(l => l.provider_id).filter(Boolean))];
      const allIds = [...new Set([...producerIds, ...providerIds])];

      let profileMap = new Map();
      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, phone, city, state, avatar_url, lat, lng")
          .in("id", allIds);
        profileMap = new Map((profiles || []).map(p => [p.id, p]));
      }

      setAllLeads(data.map(l => ({
        ...l,
        producer: profileMap.get(l.producer_id) || null,
        provider: profileMap.get(l.provider_id) || null,
      })));
    } else {
      setAllLeads([]);
    }
    setLoadingLeads(false);
  };

  // Filtered leads based on view mode and radius
  const filteredLeads = useMemo(() => {
    if (viewMode === "meus") {
      return allLeads.filter(l => l.producer_id === user?.id);
    }
    // "todos" - show all pending leads within radius
    return allLeads
      .filter(l => l.status === "pending" && !l.provider_id)
      .map(l => {
        if (userLat && userLng && l.producer?.lat && l.producer?.lng) {
          return { ...l, distance: haversineKm(userLat, userLng, l.producer.lat, l.producer.lng) };
        }
        return { ...l, distance: undefined };
      })
      .filter(l => {
        if (l.distance === undefined) return true; // show if no coords
        return l.distance <= radiusKm;
      })
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [allLeads, viewMode, user, userLat, userLng, radiusKm]);

  const loadServices = async () => {
    if (!user) return;
    setLoadingServices(true);
    const { data } = await supabase.from("leads").select("*").or(`provider_id.eq.${user.id},provider_id.is.null`).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const ids = [...new Set(data.map(l => l.producer_id).filter(Boolean))];
      let profileMap = new Map();
      if (ids.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, city, state, avatar_url").in("id", ids);
        profileMap = new Map((profiles || []).map(p => [p.id, p]));
      }
      setMyServices(data.map(l => ({ ...l, producer: profileMap.get(l.producer_id) || null })));
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

  const resetLeadForm = () => { setNewLeadService(""); setNewLeadMessage(""); setNewLeadDate(""); setNewLeadLocation(""); setNewLeadBudget(""); };

  const handleSendLead = async () => {
    if (!user || !newLeadService.trim()) { toast({ title: "Selecione o serviço.", variant: "destructive" }); return; }
    setSendingLead(true);
    const { error } = await supabase.from("leads").insert({
      producer_id: user.id, producer_name: user.name || "", service: newLeadService,
      message: newLeadMessage || null, requested_date: newLeadDate || null,
      location_text: newLeadLocation || `${user.city || "Boa Esperança"}, ${user.state || "MG"}`,
      budget: newLeadBudget ? Number(newLeadBudget) : null, status: "pending",
    });
    if (error) toast({ title: "Erro ao enviar.", variant: "destructive" });
    else { toast({ title: "Pedido enviado!" }); setShowNewLead(false); resetLeadForm(); loadAllLeads(); }
    setSendingLead(false);
  };

  const handleEditLead = async () => {
    if (!editingLead || !newLeadService.trim()) return;
    setSendingLead(true);
    const { error } = await supabase.from("leads").update({
      service: newLeadService, message: newLeadMessage || null,
      requested_date: newLeadDate || null, location_text: newLeadLocation || null,
      budget: newLeadBudget ? Number(newLeadBudget) : null,
    }).eq("id", editingLead.id);
    if (error) toast({ title: "Erro ao atualizar.", variant: "destructive" });
    else { toast({ title: "Pedido atualizado!" }); setEditingLead(null); resetLeadForm(); loadAllLeads(); }
    setSendingLead(false);
  };

  const handleDeleteLead = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast({ title: "Erro ao excluir.", variant: "destructive" });
    else { toast({ title: "Pedido excluído." }); setDeletingId(null); loadAllLeads(); }
  };

  const handleCompleteLead = async (lead: any) => {
    if (!user) return;
    await supabase.from("leads").update({ status: "completed" }).eq("id", lead.id);
    await supabase.from("contracts").insert({
      provider_id: lead.provider_id || user.id, producer_id: lead.producer_id || null, lead_id: lead.id,
      service_name: lead.service, scheduled_date: lead.requested_date || null,
      gross_amount: lead.budget || 0, cost_amount: 0, status: "completed", completed_at: new Date().toISOString(),
    });
    toast({ title: "Pedido concluído!" }); loadAllLeads();
  };

  const handleAcceptLead = async (leadId: string) => {
    if (!user) return;
    await supabase.from("leads").update({ provider_id: user.id, provider_name: user.name, status: "accepted" }).eq("id", leadId);
    toast({ title: "Serviço aceito!" });
    loadAllLeads();
    if (activeTab === "servicos") loadServices();
  };

  const handleCreateService = async () => {
    if (!user || !newSvcType) { toast({ title: "Selecione o serviço.", variant: "destructive" }); return; }
    setCreatingSvc(true);
    const { error } = await supabase.from("leads").insert({
      provider_id: user.id, provider_name: user.name, service: newSvcType, requested_date: newSvcDate || null,
      location_text: newSvcLocation || null, budget: newSvcBudget ? Number(newSvcBudget) : null,
      message: newSvcNotes || null, status: "pending",
    });
    if (error) toast({ title: "Erro.", variant: "destructive" });
    else { toast({ title: "Serviço criado!" }); setShowCreateService(false); setNewSvcType(""); setNewSvcDate(""); setNewSvcLocation(""); setNewSvcBudget(""); setNewSvcNotes(""); loadServices(); }
    setCreatingSvc(false);
  };

  const openEdit = (lead: LeadWithProfile) => {
    setNewLeadService(lead.service || "");
    setNewLeadMessage(lead.message || "");
    setNewLeadDate(lead.requested_date || "");
    setNewLeadLocation(lead.location_text || "");
    setNewLeadBudget(lead.budget ? String(lead.budget) : "");
    setEditingLead(lead);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground animate-pulse">Carregando...</p></div>;
  if (!user) return null;

  const tabs = [
    { id: "pedidos" as TabType, label: "Pedidos", icon: FileText },
    ...(isProvider ? [
      { id: "servicos" as TabType, label: "Serviços", icon: Wrench },
      { id: "agenda" as TabType, label: "Agenda", icon: Calendar },
      { id: "ganhos" as TabType, label: "Ganhos", icon: DollarSign },
    ] : []),
  ];

  return (
    <div className="min-h-screen pb-24 bg-background">
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-medium flex-1">Pedidos & Serviços</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* PEDIDOS TAB */}
        {activeTab === "pedidos" && (
          <>
            {/* View mode toggle */}
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode("todos")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === "todos" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <ListFilter size={14} /> Todos na Região
              </button>
              <button onClick={() => setViewMode("meus")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === "meus" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <User size={14} /> Meus Pedidos
              </button>
            </div>

            {/* Radius filter (only in "todos" mode) */}
            {viewMode === "todos" && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {[30, 50, 80, 100, 200].map(r => (
                  <button key={r} onClick={() => setRadiusKm(r)}
                    className={`flex-shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${radiusKm === r ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted text-muted-foreground"}`}>
                    {r} km
                  </button>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {filteredLeads.length} pedido{filteredLeads.length !== 1 ? "s" : ""} encontrado{filteredLeads.length !== 1 ? "s" : ""}
              {viewMode === "todos" && ` (raio de ${radiusKm} km)`}
            </p>

            {loadingLeads ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
            ) : filteredLeads.length === 0 ? (
              <EmptyState icon={FileText} title={viewMode === "meus" ? "Nenhum pedido seu" : "Nenhum pedido na região"} description={viewMode === "meus" ? "Crie um pedido para encontrar prestadores." : "Tente aumentar o raio de busca."} />
            ) : (
              <div className="space-y-3">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="card-agro space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {lead.producer?.avatar_url ? (
                            <img src={lead.producer.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : <User size={18} className="text-muted-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-[15px] truncate">{lead.service || "Serviço"}</h3>
                          <p className="text-xs text-muted-foreground">{lead.producer?.full_name || lead.producer_name || "Produtor"}</p>
                        </div>
                      </div>
                      <StatusBadge status={lead.status || "pending"} />
                    </div>

                    {lead.requested_date && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} /> {new Date(lead.requested_date).toLocaleDateString("pt-BR")}</p>}
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      {lead.location_text && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {lead.location_text}</p>}
                      {lead.budget != null && Number(lead.budget) > 0 && <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign size={12} /> R$ {Number(lead.budget).toFixed(2)}</p>}
                      {lead.distance !== undefined && <p className="text-xs text-primary flex items-center gap-1"><MapPin size={12} /> ~{Math.round(lead.distance)} km</p>}
                    </div>

                    {lead.message && <p className="text-sm text-muted-foreground line-clamp-2">{lead.message}</p>}

                    {lead.provider && <p className="text-sm text-muted-foreground">Prestador: <span className="font-medium text-foreground">{lead.provider.full_name}</span></p>}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* "Todos" mode: accept button for providers */}
                      {viewMode === "todos" && !lead.provider_id && lead.status === "pending" && isProvider && lead.producer_id !== user?.id && (
                        <button onClick={() => handleAcceptLead(lead.id)} className="inline-flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors active:scale-[0.98]">
                          <CheckCircle size={14} /> Aceitar Serviço
                        </button>
                      )}

                      {/* "Meus" mode: full CRUD */}
                      {viewMode === "meus" && lead.producer_id === user?.id && (
                        <>
                          <button onClick={() => setDetailLead(lead)} className="inline-flex items-center gap-1.5 text-sm bg-muted text-foreground px-3 py-1.5 rounded-xl hover:bg-muted/80 transition-colors">
                            <Eye size={14} /> Detalhes
                          </button>
                          {lead.status !== "completed" && (
                            <>
                              <button onClick={() => openEdit(lead)} className="inline-flex items-center gap-1.5 text-sm bg-muted text-foreground px-3 py-1.5 rounded-xl hover:bg-muted/80 transition-colors">
                                <Edit2 size={14} /> Editar
                              </button>
                              <button onClick={() => handleCompleteLead(lead)} className="inline-flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 transition-colors active:scale-[0.98]">
                                <CheckCircle size={14} /> Concluir
                              </button>
                            </>
                          )}
                          <button onClick={() => setDeletingId(lead.id)} className="inline-flex items-center gap-1.5 text-sm bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl hover:bg-destructive/20 transition-colors">
                            <Trash2 size={14} /> Excluir
                          </button>
                        </>
                      )}

                      {/* WhatsApp */}
                      {viewMode === "todos" && lead.producer?.phone && (
                        <a href={`https://wa.me/55${lead.producer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${lead.producer.full_name || ""}, vi seu pedido de "${lead.service}" no AgroConnect.`)}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
                          <Phone size={14} /> WhatsApp
                        </a>
                      )}
                      {viewMode === "meus" && lead.provider?.phone && (
                        <a href={`https://wa.me/55${lead.provider.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
                          <Phone size={14} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SERVIÇOS TAB */}
        {activeTab === "servicos" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-medium">🔧 Serviços</h2>
              <button onClick={() => setShowCreateService(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]">
                <Plus size={16} /> Criar Solicitação
              </button>
            </div>
            {loadingServices ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div> :
            myServices.length === 0 ? <EmptyState icon={Wrench} title="Nenhum serviço" description="Crie uma solicitação ou aguarde produtores." /> :
            <div className="space-y-3">
              {myServices.map(lead => (
                <div key={lead.id} className="card-agro space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[15px]">{lead.service || "Serviço"}</h3>
                    <StatusBadge status={lead.status} />
                  </div>
                  {lead.requested_date && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={12} /> {new Date(lead.requested_date).toLocaleDateString("pt-BR")}</p>}
                  {lead.location_text && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {lead.location_text}</p>}
                  {lead.budget != null && <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign size={12} /> R$ {Number(lead.budget).toFixed(2)}</p>}
                  {lead.message && <p className="text-sm text-muted-foreground">{lead.message}</p>}
                  {lead.producer && <p className="text-sm text-muted-foreground">Produtor: <span className="font-medium text-foreground">{lead.producer.full_name}</span></p>}
                  <div className="flex flex-wrap gap-2">
                    {!lead.provider_id && lead.status === "pending" && (
                      <button onClick={() => handleAcceptLead(lead.id)} className="inline-flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition-colors active:scale-[0.98]">
                        <CheckCircle size={14} /> Aceitar
                      </button>
                    )}
                    {lead.provider_id === user?.id && lead.status === "accepted" && (
                      <button onClick={() => handleCompleteLead(lead)} className="inline-flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 transition-colors active:scale-[0.98]">
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
            </div>}
          </>
        )}

        {/* AGENDA TAB */}
        {activeTab === "agenda" && (
          <>
            <h2 className="font-medium">📅 Agenda</h2>
            {loadingContracts ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div> :
            contracts.length === 0 ? <EmptyState icon={Calendar} title="Agenda vazia" description="Conclua serviços para vê-los na agenda." /> :
            <div className="space-y-3">
              {contracts.map(c => (
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
                  {c.status === "completed" && (
                    <button onClick={() => navigate(`/avaliar/${c.id}`)} className="inline-flex items-center gap-1.5 text-sm bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600 transition-colors active:scale-[0.98]">
                      <Star size={14} /> Avaliar
                    </button>
                  )}
                </div>
              ))}
            </div>}
          </>
        )}

        {/* GANHOS TAB */}
        {activeTab === "ganhos" && (
          <>
            <h2 className="font-medium">💰 Meus Ganhos</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="card-agro text-center py-4">
                <p className="text-xl font-medium text-green-700">R$ {earnings.month.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Este mês</p>
              </div>
              <div className="card-agro text-center py-4">
                <p className="text-xl font-medium">R$ {earnings.total.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
              <div className="card-agro text-center py-4">
                <p className="text-xl font-medium text-red-600">R$ {earnings.costs.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Custos</p>
              </div>
            </div>
            <div className="card-agro text-center py-3">
              <p className="text-lg font-medium">Lucro: R$ {(earnings.total - earnings.costs).toFixed(2)}</p>
            </div>
            {earningsContracts.length === 0 ? <EmptyState icon={DollarSign} title="Sem ganhos" description="Conclua serviços para ver ganhos." /> :
            <div className="space-y-3">
              {earningsContracts.map(c => (
                <div key={c.id} className="card-agro flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[15px]">{c.service_name || "Serviço"}</p>
                    <p className="text-xs text-muted-foreground">{c.completed_at ? new Date(c.completed_at).toLocaleDateString("pt-BR") : "—"}</p>
                  </div>
                  <p className="font-medium text-green-700">R$ {Number(c.gross_amount || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>}
          </>
        )}
      </div>

      {/* New Lead Modal */}
      {showNewLead && (
        <ModalForm title="Novo Pedido de Serviço" onClose={() => setShowNewLead(false)}>
          <ServiceFormFields service={newLeadService} setService={setNewLeadService} date={newLeadDate} setDate={setNewLeadDate} location={newLeadLocation} setLocation={setNewLeadLocation} budget={newLeadBudget} setBudget={setNewLeadBudget} />
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Mensagem (opcional)</label>
            <textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[80px] resize-none" value={newLeadMessage} onChange={e => setNewLeadMessage(e.target.value)} placeholder="Descreva o que precisa..." maxLength={500} />
          </div>
          <button onClick={handleSendLead} disabled={sendingLead || !newLeadService}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
            <Send size={18} /> {sendingLead ? "Enviando..." : "Enviar Pedido"}
          </button>
        </ModalForm>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <ModalForm title="Editar Pedido" onClose={() => { setEditingLead(null); resetLeadForm(); }}>
          <ServiceFormFields service={newLeadService} setService={setNewLeadService} date={newLeadDate} setDate={setNewLeadDate} location={newLeadLocation} setLocation={setNewLeadLocation} budget={newLeadBudget} setBudget={setNewLeadBudget} />
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Mensagem</label>
            <textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[80px] resize-none" value={newLeadMessage} onChange={e => setNewLeadMessage(e.target.value)} placeholder="Descreva o que precisa..." maxLength={500} />
          </div>
          <button onClick={handleEditLead} disabled={sendingLead || !newLeadService}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
            <Send size={18} /> {sendingLead ? "Salvando..." : "Salvar Alterações"}
          </button>
        </ModalForm>
      )}

      {/* Detail Modal */}
      {detailLead && (
        <ModalForm title="Detalhes do Pedido" onClose={() => setDetailLead(null)}>
          <div className="space-y-3">
            <div><span className="text-sm text-muted-foreground">Serviço:</span><p className="font-medium">{detailLead.service}</p></div>
            {detailLead.message && <div><span className="text-sm text-muted-foreground">Mensagem:</span><p className="text-sm">{detailLead.message}</p></div>}
            {detailLead.requested_date && <div><span className="text-sm text-muted-foreground">Data:</span><p className="text-sm">{new Date(detailLead.requested_date).toLocaleDateString("pt-BR")}</p></div>}
            {detailLead.location_text && <div><span className="text-sm text-muted-foreground">Local:</span><p className="text-sm">{detailLead.location_text}</p></div>}
            {detailLead.budget != null && <div><span className="text-sm text-muted-foreground">Orçamento:</span><p className="text-sm">R$ {Number(detailLead.budget).toFixed(2)}</p></div>}
            <div><span className="text-sm text-muted-foreground">Status:</span><div className="mt-1"><StatusBadge status={detailLead.status || "pending"} /></div></div>
            {detailLead.provider && <div><span className="text-sm text-muted-foreground">Prestador:</span><p className="text-sm font-medium">{detailLead.provider.full_name}</p></div>}
            <div><span className="text-sm text-muted-foreground">Criado em:</span><p className="text-sm">{new Date(detailLead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p></div>
          </div>
        </ModalForm>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeletingId(null)} />
          <div className="relative bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-medium">Excluir pedido?</h3>
            <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita. O pedido será removido permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">Cancelar</button>
              <button onClick={() => handleDeleteLead(deletingId)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateService && (
        <ModalForm title="Criar Solicitação de Serviço" onClose={() => setShowCreateService(false)}>
          <ServiceFormFields service={newSvcType} setService={setNewSvcType} date={newSvcDate} setDate={setNewSvcDate} location={newSvcLocation} setLocation={setNewSvcLocation} budget={newSvcBudget} setBudget={setNewSvcBudget} />
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Observações</label>
            <textarea className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm min-h-[80px] resize-none" value={newSvcNotes} onChange={e => setNewSvcNotes(e.target.value)} placeholder="Detalhes..." maxLength={500} />
          </div>
          <button onClick={handleCreateService} disabled={creatingSvc || !newSvcType}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
            <Send size={18} /> {creatingSvc ? "Criando..." : "Criar Serviço"}
          </button>
        </ModalForm>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pendente", cls: "bg-amber-100 text-amber-700" },
    accepted: { label: "Aceito", cls: "bg-blue-100 text-blue-700" },
    completed: { label: "Concluído", cls: "bg-green-100 text-green-700" },
  };
  const c = cfg[status] || cfg.pending;
  return <span className={`text-xs px-2 py-0.5 rounded-full ${c.cls}`}>{c.label}</span>;
}

function ModalForm({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground"><X size={20} /></button>
        <h3 className="text-lg font-medium">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ServiceFormFields({ service, setService, date, setDate, location, setLocation, budget, setBudget }: any) {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Tipo de serviço *</label>
        <select className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={service} onChange={(e: any) => setService(e.target.value)}>
          <option value="">Selecione...</option>
          {serviceCategories.map((g: any) => (
            <optgroup key={g.group} label={g.group}>
              {g.services.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Data desejada</label>
        <input type="date" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={date} onChange={(e: any) => setDate(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Local</label>
        <input type="text" placeholder="Ex: Boa Esperança, MG" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={location} onChange={(e: any) => setLocation(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Orçamento (R$)</label>
        <input type="number" placeholder="0,00" className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm" value={budget} onChange={(e: any) => setBudget(e.target.value)} />
      </div>
    </>
  );
}

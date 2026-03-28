import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Camera, LogOut, Trash2, MessageCircle, User, MapPin, Loader2, ToggleLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Perfil() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [disponibilidade, setDisponibilidade] = useState<"now" | "week" | "busy">("now");
  const [savingDisp, setSavingDisp] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNome(user.name);
      setPhone(user.phone || "");
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    const { data: prov } = await supabase.from("providers").select("available").eq("user_id", user.id).maybeSingle();
    if (prov) { setIsProvider(true); setDisponibilidade((prov.available || "now") as any); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast({ title: "Erro no upload.", variant: "destructive" }); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
    setAvatarUrl(url);
    toast({ title: "Foto atualizada!" });
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: nome, phone, updated_at: new Date().toISOString() }).eq("id", user.id);
    setSaving(false);
    if (error) toast({ title: "Erro ao salvar.", variant: "destructive" });
    else toast({ title: "Informações salvas!" });
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground animate-pulse">Carregando...</p></div>;
  if (!user) { navigate("/login"); return null; }

  const whatsappUrl = phone ? `https://wa.me/55${phone.replace(/\D/g, "")}` : "";

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-3.5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground" aria-label="Voltar"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-medium">Meu Perfil</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted overflow-hidden border-4 border-background shadow-lg">
              {uploadingAvatar ? (
                <Loader2 className="animate-spin text-muted-foreground" size={24} />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt={user.name} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-medium text-primary">{(user.name || "?").split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 active:scale-[0.95]">
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <h2 className="mt-3 text-lg font-medium">{user.name || "Usuário"}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {user.city || "Sul de Minas"}, {user.state || "MG"}</p>
          <span className="mt-1 text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full capitalize">{user.role}</span>
        </div>

        {/* WhatsApp Button */}
        {phone && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors active:scale-[0.98] shadow-md">
            <MessageCircle size={20} /> Abrir WhatsApp
          </a>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[14px] font-medium text-muted-foreground">Nome</label>
            <input className="input-field" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] font-medium text-muted-foreground">Email</label>
            <input className="input-field bg-muted/30" value={user.email || ""} readOnly />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] font-medium text-muted-foreground">Celular (WhatsApp)</label>
            <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(35) 99999-9999" />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] font-medium text-muted-foreground">Cidade</label>
            <input className="input-field bg-muted/30" value={`${user.city || ""}, ${user.state || ""}`} readOnly />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full disabled:opacity-50 active:scale-[0.98]">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>

        {/* Disponibilidade (provider only) */}
        {(isProvider || user.role === "prestador" || user.role === "ambos") && (
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-[16px] font-medium"><ToggleLeft size={18} /> Disponibilidade</h2>
            <div className="space-y-2">
              {[
                { value: "now" as const, label: "Disponível agora", dot: "bg-green-500" },
                { value: "week" as const, label: "Esta semana", dot: "bg-amber-500" },
                { value: "busy" as const, label: "Ocupado", dot: "bg-destructive" },
              ].map(opt => (
                <button key={opt.value} onClick={() => saveDisponibilidade(opt.value)} disabled={savingDisp}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${disponibilidade === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <span className={`w-3 h-3 rounded-full ${opt.dot}`} />
                  <span className="text-sm font-medium">{opt.label}</span>
                  {disponibilidade === opt.value && <CheckCircle size={16} className="ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-[16px] font-medium"><Bell size={18} /> Notificações</h2>
          {["Novos pedidos de serviço", "Mensagens", "Avaliações", "Novidades do app"].map(label => (
            <label key={label} className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <span className="text-[15px]">{label}</span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={handleLogout} className="btn-outline w-full !border-destructive/30 !text-[15px] !text-destructive active:scale-[0.98]">
            <LogOut size={16} /> Sair da conta
          </button>
          <button className="flex w-full items-center justify-center gap-2 py-2.5 text-[15px] text-destructive hover:underline">
            <Trash2 size={14} /> Excluir minha conta
          </button>
        </div>
      </div>
    </div>
  );
}

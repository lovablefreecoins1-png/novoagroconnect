import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProgressSteps from "@/components/ProgressSteps";
import { formatPhone, validatePhone, formatCEP, fetchCEP, formatCPF, validateCPF } from "@/lib/validators";
import { serviceCategories, providerRadiusOptions } from "@/data/categories";
import { signUp, useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export default function CadastroPrestador() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const isExistingUser = !!user;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, skip step 1 (personal data) and start at step 2
  useEffect(() => {
    if (user && step === 1) {
      setStep(2);
    }
  }, [user]);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);

  const [categoria, setCategoria] = useState("");
  const [raio, setRaio] = useState(80);
  const [disponibilidade, setDisponibilidade] = useState<"now" | "week" | "busy">("now");

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [fotosTrabalho, setFotosTrabalho] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const [fotoDoc, setFotoDoc] = useState<string | null>(null);
  const [termos, setTermos] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCep = async (value: string) => {
    const formatted = formatCEP(value);
    setCep(formatted);
    if (value.replace(/\D/g, "").length === 8) {
      setLoadingCep(true);
      const result = await fetchCEP(value);
      setLoadingCep(false);
      if (result) { setCidade(result.cidade); setEstado(result.estado); }
      else setErrors(prev => ({ ...prev, cep: "CEP não encontrado. Digite o nome da sua cidade." }));
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setCidade("Boa Esperança"); setEstado("MG");
      toast({ title: "Localização padrão definida", description: "Boa Esperança, MG" });
      return;
    }
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=pt`
          );
          const data = await resp.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "Boa Esperança";
          const state = data.address?.state_code?.toUpperCase() || "MG";
          setCidade(city);
          setEstado(state.length > 2 ? "MG" : state);
          toast({ title: "Localização detectada", description: `${city}, ${state}` });
        } catch {
          setCidade("Boa Esperança"); setEstado("MG");
        }
        setLoadingGPS(false);
      },
      () => {
        setCidade("Boa Esperança"); setEstado("MG");
        setLat(-21.0922); setLng(-45.5631);
        toast({ title: "Localização padrão definida", description: "Boa Esperança, MG" });
        setLoadingGPS(false);
      },
      { timeout: 10000 }
    );
  };

  const handleFilePreview = (file: File, callback: (url: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Foto muito pesada. Use uma foto menor que 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  };

  const totalSteps = isExistingUser ? 3 : 4;
  const displayStep = isExistingUser ? step - 1 : step;

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1 && !isExistingUser) {
      if (!nome.trim()) e.nome = "Este campo precisa ser preenchido.";
      if (!validateCPF(cpf)) e.cpf = "CPF inválido. Verifique os números digitados.";
      if (!validatePhone(celular)) e.celular = "Número de celular incompleto. Use o formato (XX) XXXXX-XXXX.";
      if (!email.includes("@")) e.email = "Email inválido.";
      if (senha.length < 6) e.senha = "Senha deve ter no mínimo 6 caracteres.";
      if (!cidade || !estado) e.cep = "Informe seu CEP ou use a localização.";
    }
    if (step === 2) { if (!categoria) e.categoria = "Selecione sua categoria."; }
    if (step === 3) { if (!fotoPerfil) e.fotoPerfil = "Foto de perfil é obrigatória."; }
    if (step === 4 && !isExistingUser) {
      if (!termos) e.termos = "Aceite as regras do app para continuar.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    const lastStep = isExistingUser ? 3 : 4;
    if (step < lastStep) { setStep(step + 1); setErrors({}); return; }

    setLoading(true);
    try {
      if (isExistingUser) {
        // Already logged in — just create provider record
        await supabase.from("profiles").update({ user_type: "ambos" }).eq("id", user.id);
        await supabase.from("providers").upsert({
          user_id: user.id,
          category: categoria,
          radius_km: raio,
          available: disponibilidade,
          bio,
        }, { onConflict: "user_id" });
        toast({ title: "Perfil de prestador criado! 🎉" });
        navigate("/inicio");
      } else {
        await signUp(email, senha, {
          full_name: nome,
          phone: celular,
          user_type: "prestador",
          city: cidade,
          state: estado,
        });

        // Create provider record
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("profiles").update({ lat, lng }).eq("id", session.user.id);
          await supabase.from("providers").insert({
            user_id: session.user.id,
            category: categoria,
            radius_km: raio,
            available: disponibilidade,
            bio,
          });
        }

        toast({ title: "Conta criada! Bem-vindo ao AgroConnect." });
        navigate("/inicio");
      }
    } catch (err: any) {
      if (err.message?.includes("already registered")) {
        setErrors({ email: "Este email já está cadastrado. Tente fazer login." });
        setStep(1);
      } else {
        toast({ title: "Erro ao criar conta. Tente novamente.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const dispOptions = [
    { value: "now" as const, label: "Disponível agora", dot: "bg-[hsl(var(--success))]" },
    { value: "week" as const, label: "Disponível esta semana", dot: "bg-secondary" },
    { value: "busy" as const, label: "Ocupado no momento", dot: "bg-destructive" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step > (isExistingUser ? 2 : 1) ? (
            <button onClick={() => setStep(step - 1)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Voltar">
              <ArrowLeft size={24} />
            </button>
          ) : (
            <Link to={isExistingUser ? "/buscar" : "/cadastro"} className="text-muted-foreground hover:text-foreground p-1" aria-label="Voltar">
              <ArrowLeft size={24} />
            </Link>
          )}
          <div className="flex-1"><ProgressSteps current={displayStep} total={totalSteps} /></div>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-medium">Dados pessoais</h2>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Nome completo</label>
              <input className="input-field" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" />
              {errors.nome && <p className="text-[14px] text-destructive mt-1.5">{errors.nome}</p>}
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" inputMode="email" />
              {errors.email && <p className="text-[14px] text-destructive mt-1.5">{errors.email}</p>}
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Senha</label>
              <input className="input-field" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
              {errors.senha && <p className="text-[14px] text-destructive mt-1.5">{errors.senha}</p>}
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">CPF</label>
              <input className="input-field" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
              {errors.cpf && <p className="text-[14px] text-destructive mt-1.5">{errors.cpf}</p>}
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Celular (WhatsApp)</label>
              <input className="input-field" value={celular} onChange={e => setCelular(formatPhone(e.target.value))} placeholder="(XX) XXXXX-XXXX" inputMode="tel" />
              {errors.celular && <p className="text-[14px] text-destructive mt-1.5">{errors.celular}</p>}
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">CEP</label>
              <input className="input-field" value={cep} onChange={e => handleCep(e.target.value)} placeholder="00000-000" inputMode="numeric" />
              {loadingCep && <p className="text-[14px] text-muted-foreground mt-1.5">Buscando...</p>}
              {errors.cep && <p className="text-[14px] text-destructive mt-1.5">{errors.cep}</p>}
              <button onClick={handleGPS} disabled={loadingGPS} className="flex items-center gap-2 text-[15px] text-primary mt-2.5 hover:underline disabled:opacity-50">
                <MapPin size={16} /> {loadingGPS ? "Buscando localização..." : "Usar minha localização atual"}
              </button>
            </div>
            {cidade && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Cidade</label>
                  <input className="input-field bg-muted/30" value={cidade} readOnly />
                </div>
                <div className="w-24">
                  <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Estado</label>
                  <input className="input-field bg-muted/30" value={estado} readOnly />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-medium">Seus serviços</h2>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Serviço principal</label>
              <select className="input-field" value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Selecione...</option>
                {serviceCategories.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.services.map(s => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                ))}
              </select>
              {errors.categoria && <p className="text-[14px] text-destructive mt-1.5">{errors.categoria}</p>}
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Até onde eu atendo: {raio} km</label>
              <input type="range" min={30} max={200} step={10} value={raio}
                onChange={e => setRaio(Number(e.target.value))}
                className="w-full accent-primary h-2" />
              <div className="flex justify-between text-[13px] text-muted-foreground mt-1">
                <span>30 km</span><span>80 km</span><span>200 km</span>
              </div>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-3 block">Quando posso trabalhar</label>
              <div className="space-y-2.5">
                {dispOptions.map(opt => (
                  <button key={opt.value} onClick={() => setDisponibilidade(opt.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-[15px] transition-all active:scale-[0.98] ${
                      disponibilidade === opt.value ? "border-primary bg-[hsl(var(--primary-bg))]" : "border-border"
                    }`}>
                    <span className={`w-3.5 h-3.5 rounded-full ${opt.dot}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-medium">Seu perfil</h2>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-2 block">Foto de perfil</label>
              {errors.fotoPerfil && <p className="text-[14px] text-destructive mb-2">{errors.fotoPerfil}</p>}
              <div className="flex items-center gap-4">
                {fotoPerfil ? (
                  <img src={fotoPerfil} alt="Perfil" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Camera size={24} className="text-muted-foreground" />
                  </div>
                )}
                <label className="btn-secondary cursor-pointer !min-h-[44px] !text-[15px]">
                  <Upload size={16} /> Escolher foto
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFilePreview(f, setFotoPerfil);
                  }} />
                </label>
              </div>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-2 block">Fotos do trabalho (até 3)</label>
              <div className="grid grid-cols-3 gap-2.5">
                {fotosTrabalho.map((foto, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={foto} alt={`Trabalho ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => setFotosTrabalho(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-foreground/70 text-background text-xs flex items-center justify-center">✕</button>
                  </div>
                ))}
                {fotosTrabalho.length < 3 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50">
                    <Camera size={24} className="text-muted-foreground" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleFilePreview(f, url => setFotosTrabalho(prev => [...prev, url]));
                    }} />
                  </label>
                )}
              </div>
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Sobre mim ({bio.length}/200)</label>
              <textarea className="input-field !min-h-[80px] resize-none" value={bio}
                onChange={e => setBio(e.target.value.slice(0, 200))}
                placeholder="Descreva sua experiência e serviços..." maxLength={200} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Verificação</h2>
            <p className="text-[15px] text-muted-foreground">
              Sua conta fica ativa imediatamente. O badge "Verificado ✓" aparece em até 48h após análise.
            </p>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-2 block">Foto do documento (CPF ou RG)</label>
              {fotoDoc ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
                  <img src={fotoDoc} alt="Documento" className="w-full h-full object-contain" />
                  <button onClick={() => setFotoDoc(null)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/70 text-background flex items-center justify-center">✕</button>
                </div>
              ) : (
                <label className="w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50">
                  <Upload size={32} className="text-muted-foreground mb-2" />
                  <span className="text-[15px] text-muted-foreground">Clique para enviar foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFilePreview(f, setFotoDoc);
                  }} />
                </label>
              )}
            </div>
            <label className="flex items-start gap-2.5 text-[15px]">
              <input type="checkbox" checked={termos} onChange={e => setTermos(e.target.checked)} className="mt-1 w-5 h-5 accent-primary" />
              <span>Aceito as <a href="#" className="text-primary underline">regras do app</a> e a <a href="#" className="text-primary underline">política de dados</a></span>
            </label>
            {errors.termos && <p className="text-[14px] text-destructive">{errors.termos}</p>}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button onClick={handleNext} disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Salvando..." : step === (isExistingUser ? 3 : 4) ? (isExistingUser ? "Ativar perfil de prestador" : "Criar minha conta") : "Continuar"}
          </button>
          {step > (isExistingUser ? 2 : 1) && (
            <button onClick={() => setStep(step - 1)} className="w-full text-center text-[15px] text-muted-foreground py-2">
              Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

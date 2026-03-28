import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProgressSteps from "@/components/ProgressSteps";
import { formatPhone, validatePhone, formatCEP, fetchCEP } from "@/lib/validators";
import { productionTypes, propertySizes } from "@/data/categories";
import { signUp } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export default function CadastroProdutor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
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

  const [producao, setProducao] = useState<string[]>([]);
  const [tamanho, setTamanho] = useState("");

  const [termos, setTermos] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCep = async (value: string) => {
    const formatted = formatCEP(value);
    setCep(formatted);
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 8) {
      setLoadingCep(true);
      const result = await fetchCEP(cleaned);
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
        // Reverse geocode
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=pt`
          );
          const data = await resp.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "Boa Esperança";
          const state = data.address?.state_code?.toUpperCase() || data.address?.state || "MG";
          setCidade(city);
          setEstado(state.length > 2 ? "MG" : state);
          toast({ title: "Localização detectada", description: `${city}, ${state}` });
        } catch {
          setCidade("Boa Esperança"); setEstado("MG");
          toast({ title: "Localização definida", description: "Boa Esperança, MG" });
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

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Este campo precisa ser preenchido.";
    if (!validatePhone(celular)) e.celular = "Número de celular incompleto. Use o formato (XX) XXXXX-XXXX.";
    if (!email.includes("@")) e.email = "Email inválido.";
    if (senha.length < 6) e.senha = "Senha deve ter no mínimo 6 caracteres.";
    if (!cidade || !estado) e.cep = "Informe seu CEP ou use a localização.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (producao.length === 0) e.producao = "Selecione pelo menos um tipo.";
    if (!tamanho) e.tamanho = "Selecione o tamanho.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!termos) e.termos = "Aceite as regras do app para continuar.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) { setStep(2); setErrors({}); }
    else if (step === 2 && validateStep2()) { setStep(3); setErrors({}); }
    else if (step === 3 && validateStep3()) {
      setLoading(true);
      try {
        await signUp(email, senha, {
          full_name: nome,
          phone: celular,
          user_type: "produtor",
          city: cidade,
          state: estado,
        });

        // Update profile with extra fields after signup
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("profiles").update({
            production_types: producao,
            property_size: tamanho,
            lat,
            lng,
          }).eq("id", session.user.id);
        }

        toast({ title: "Conta criada! Bem-vindo ao AgroConnect." });
        navigate("/produtor");
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
    }
  };

  const toggleProducao = (type: string) => {
    setProducao(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3.5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Voltar">
              <ArrowLeft size={24} />
            </button>
          ) : (
            <Link to="/cadastro" className="text-muted-foreground hover:text-foreground p-1" aria-label="Voltar">
              <ArrowLeft size={24} />
            </Link>
          )}
          <div className="flex-1">
            <ProgressSteps current={step} total={3} />
          </div>
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
            <h2 className="text-xl font-medium">Tipo de produção</h2>
            <p className="text-[15px] text-muted-foreground">Selecione os tipos que se aplicam à sua propriedade.</p>
            {errors.producao && <p className="text-[14px] text-destructive">{errors.producao}</p>}
            <div className="grid grid-cols-2 gap-2.5">
              {productionTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleProducao(type)}
                  className={`card-agro text-[15px] text-left p-3.5 transition-all active:scale-[0.98] ${
                    producao.includes(type) ? "border-primary bg-[hsl(var(--primary-bg))]" : ""
                  }`}
                >
                  {producao.includes(type) ? "✓ " : ""}{type}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[14px] font-medium text-muted-foreground mb-1.5 block">Tamanho da propriedade</label>
              {errors.tamanho && <p className="text-[14px] text-destructive mb-1.5">{errors.tamanho}</p>}
              <div className="space-y-2">
                {propertySizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setTamanho(size)}
                    className={`w-full text-left p-3.5 rounded-xl border text-[15px] transition-all active:scale-[0.98] ${
                      tamanho === size ? "border-primary bg-[hsl(var(--primary-bg))]" : "border-border"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Confirmar cadastro</h2>
            <div className="card-agro space-y-3">
              <p className="text-[15px]"><span className="text-muted-foreground">Nome:</span> {nome}</p>
              <p className="text-[15px]"><span className="text-muted-foreground">Email:</span> {email}</p>
              <p className="text-[15px]"><span className="text-muted-foreground">Celular:</span> {celular}</p>
              <p className="text-[15px]"><span className="text-muted-foreground">Cidade:</span> {cidade}, {estado}</p>
              <p className="text-[15px]"><span className="text-muted-foreground">Produção:</span> {producao.join(", ")}</p>
              <p className="text-[15px]"><span className="text-muted-foreground">Propriedade:</span> {tamanho}</p>
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
            {loading ? "Criando conta..." : step === 3 ? "Criar minha conta" : "Continuar"}
          </button>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="w-full text-center text-[15px] text-muted-foreground py-2">
              Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

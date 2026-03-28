import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Tractor, Wrench, Stethoscope, GraduationCap, Truck, Users, FileText, Scissors, Trees, SprayCan, MapPin, ArrowRight, MessageCircle, CheckCircle, Shield, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { allServices } from "@/data/categories";
import { artigosMock } from "@/data/blogData";
import BlogCard from "@/components/BlogCard";
import { useAuth } from "@/lib/auth";
import ServicosDestaque from "@/components/ServicosDestaque";
import heroBg from "@/assets/hero-coffee.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const categories = [
  { icon: Trees, label: "Colheita de Café" },
  { icon: Scissors, label: "Poda de Café" },
  { icon: Stethoscope, label: "Veterinária" },
  { icon: Wrench, label: "Maquinário" },
  { icon: Tractor, label: "Aluguel Trator" },
  { icon: GraduationCap, label: "Assistência Técnica" },
  { icon: Truck, label: "Transporte Rural" },
  { icon: FileText, label: "Laudos Técnicos" },
  { icon: SprayCan, label: "Pulverização" },
  { icon: Users, label: "Mão de Obra" },
];

const testimonials = [
  { name: "Sebastião Costa", city: "Boa Esperança, MG", stars: 5, text: "Encontrei um veterinário excelente em menos de 10 minutos. Atendeu minha fazenda no mesmo dia." },
  { name: "Maria das Graças", city: "Alfenas, MG", stars: 5, text: "Achei uma equipe de panha que colheu todo meu cafezal de morro. Serviço rápido e honesto." },
  { name: "José Antônio Silva", city: "Lavras, MG", stars: 4, text: "Já contratei 3 serviços diferentes pelo app. Muito prático, especialmente o botão do WhatsApp." },
];

const stats = [
  { value: "5.800+", label: "Prestadores cadastrados" },
  { value: "12.400+", label: "Produtores ativos" },
  { value: "4,8 ★", label: "Avaliação média" },
];

const howSteps = [
  {
    icon: Search,
    title: "Busque o serviço",
    desc: "Digite o que precisa e filtre por distância, preço e avaliação.",
  },
  {
    icon: CheckCircle,
    title: "Escolha o profissional",
    desc: "Veja perfil completo, fotos reais do trabalho e avaliações.",
  },
  {
    icon: MessageCircle,
    title: "Conecte pelo WhatsApp",
    desc: "Fale direto com o prestador. Rápido e sem intermediários.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userCity, setUserCity] = useState("Sul de Minas");

  // Try to get user city from geolocation
  useEffect(() => {
    if (user?.city) {
      setUserCity(user.city);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "Sul de Minas";
          setUserCity(city);
        } catch { /* fallback */ }
      }, () => {}, { timeout: 5000 });
    }
  }, [user]);

  const suggestions = search.length >= 2
    ? allServices.filter(s => s.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen pb-14 md:pb-0 bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Trees size={20} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">AgroConnect</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
            <a href="#servicos" className="text-muted-foreground hover:text-foreground transition-colors">Serviços</a>
            <Link to="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <Link to="/buscar" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Search size={16} /> Buscar
                </Link>
                <Link to="/perfil" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  Meu perfil
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                  Entrar
                </Link>
                <Link to="/cadastro" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(145,50%,8%)/0.85] via-[hsl(145,50%,8%)/0.75] to-[hsl(145,50%,8%)/0.92]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center w-full">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <MapPin size={14} className="text-green-300" />
              <span className="text-sm text-white/90 font-medium">Serviços perto de você em {userCity}</span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-[32px] md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] max-w-3xl mx-auto tracking-tight">
              Mão de obra rural <br className="hidden md:block" />
              <span className="text-green-300">na hora.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-white/70 mt-6 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Colheita, poda, veterinário, trator, pulverização e mais — tudo perto de você. Sem intermediários.
            </motion.p>

            {/* Search */}
            <motion.div variants={fadeUp} custom={3} className="relative mt-10 max-w-lg mx-auto">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="O que você precisa? Ex: veterinário, trator..."
                className="w-full h-14 md:h-16 pl-12 pr-4 rounded-2xl bg-white shadow-2xl shadow-black/20 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-xl z-20 overflow-hidden">
                  {suggestions.map(s => (
                    <button key={s} className="w-full text-left px-5 py-3.5 text-[15px] hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                      onMouseDown={() => navigate(`/buscar?q=${encodeURIComponent(s)}`)}>
                      <Search size={14} className="inline mr-2 text-muted-foreground" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link to="/buscar" className="inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/30">
                🌾 Sou Produtor
              </Link>
              <Link to="/cadastro/prestador" className="inline-flex items-center justify-center gap-2.5 bg-white/15 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/25 active:scale-[0.98] transition-all">
                🛠 Quero oferecer serviço
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} custom={5} className="mt-6">
              <Link to="/login" className="text-white/60 hover:text-white/90 text-sm font-medium transition-colors">
                Já tenho conta? <span className="underline">Entrar</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown size={28} className="text-white/40" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-1">
        <div className="bg-primary py-0">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
              className="grid grid-cols-3 divide-x divide-white/10"
            >
              {stats.map((s, i) => (
                <motion.div key={i} variants={fadeUp} custom={i} className="text-center py-8 md:py-10">
                  <p className="text-2xl md:text-4xl font-bold text-white">{s.value}</p>
                  <p className="text-xs md:text-sm text-white/50 mt-1.5 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.span variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-wider">Simples e direto</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold mt-3">Como funciona</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-md mx-auto">
              Encontre o profissional certo em 3 passos simples
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8 md:gap-12"
          >
            {howSteps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="text-center group">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon size={32} className="text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-2">Passo {i + 1}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Serviços Mais Procurados */}
      <div id="servicos">
        <ServicosDestaque />
      </div>

      {/* Categories */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.span variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-wider">Explore</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold mt-3">Categorias em destaque</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
          >
            {categories.map((cat, i) => (
              <motion.div key={cat.label} variants={fadeUp} custom={i}>
                <Link
                  to={`/buscar?q=${encodeURIComponent(cat.label)}`}
                  className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.97] transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <cat.icon size={26} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-center">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.span variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-wider">Depoimentos</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold mt-3">O que dizem nossos usuários</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:shadow-primary/5 transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={16} className="fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-[15px] text-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Blog preview */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <motion.span variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-wider">Conteúdo</motion.span>
                <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold mt-3">Conteúdo técnico para o campo</motion.h2>
              </div>
              <Link to="/blog" className="text-sm text-primary font-semibold hidden md:inline hover:underline">Ver todos →</Link>
            </div>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {artigosMock.slice(0, 3).map(a => <BlogCard key={a.id} artigo={a} />)}
          </div>
          <Link to="/blog" className="btn-outline w-full mt-6 md:hidden">Ver todos os artigos</Link>
        </div>
      </section>

      {/* Laudos */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "hsl(var(--accent) / 0.08)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="inline-block badge-premium text-xs mb-4">Novo no app</motion.span>
            <motion.div variants={fadeUp} custom={1}>
              <FileText size={44} className="mx-auto text-secondary mb-5" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={2} className="text-3xl md:text-4xl font-bold">Laudos agronômicos online</motion.h2>
            <motion.p variants={fadeUp} custom={3} className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              Laudos de solo, análises e receituários para sua propriedade. Sem sair de casa.
            </motion.p>
            <motion.div variants={fadeUp} custom={4}>
              <Link to="/marketplace/laudos" className="btn-primary mt-8 inline-flex gap-2 text-lg">
                <FileText size={20} /> Ver laudos disponíveis
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Indicação */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "hsl(var(--primary) / 0.05)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <Users size={44} className="mx-auto text-primary mb-5" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">Indique e ganhe 1 mês grátis</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
              Compartilhe seu link. Quando o indicado criar conta premium, você ganha 1 mês grátis.
            </motion.p>
            <motion.div variants={fadeUp} custom={3}>
              <Link to="/indicar" className="btn-primary mt-8 inline-flex gap-2 text-lg">
                <Users size={20} /> Gerar meu link
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white">Pronto para começar?</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-white/70 mt-4 text-lg max-w-md mx-auto">
              Junte-se a milhares de produtores e prestadores no Sul de Minas.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              {user ? (
                <Link to="/buscar" className="inline-flex items-center justify-center gap-2.5 bg-white text-primary px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 active:scale-[0.98] transition-all">
                  <Search size={20} /> Buscar serviço
                </Link>
              ) : (
                <>
                  <Link to="/cadastro/produtor" className="inline-flex items-center justify-center gap-2.5 bg-white text-primary px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg">
                    <Tractor size={20} /> Sou produtor
                  </Link>
                  <Link to="/cadastro/prestador" className="inline-flex items-center justify-center gap-2.5 bg-white/15 border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/25 active:scale-[0.98] transition-all">
                    <Wrench size={20} /> Ofereço serviço
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/[0.03] border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Trees size={16} className="text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">AgroConnect</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Conectando produtores rurais a prestadores de serviços agropecuários em Boa Esperança, Alfenas, Lavras e todo o Sul de Minas.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Navegação</h4>
              <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
                <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <Link to="/cadastro/prestador" className="hover:text-foreground transition-colors">Para prestadores</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Suporte</h4>
              <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                <a href="https://wa.me/5535999999999" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">WhatsApp Suporte</a>
                <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2026 AgroConnect. Todos os direitos reservados.</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={14} />
              <span>Dados protegidos · Sem intermediários</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

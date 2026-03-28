import { useParams, Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import ProviderCard from "@/components/ProviderCard";
import { mockProviders } from "@/data/mockData";
const cityData: Record<string, { name: string; state: string; about: string }> = {
  "uberaba-mg": {
    name: "Uberaba", state: "MG",
    about: "Uberaba é a capital do zebu e um dos maiores polos pecuários do Brasil. Com mais de 330 mil habitantes, a cidade concentra importantes frigoríficos, leilões de gado e uma forte tradição na criação de nelore. A região também se destaca na produção de cana-de-açúcar e grãos.",
  },
  "monte-carmelo-mg": {
    name: "Monte Carmelo", state: "MG",
    about: "Monte Carmelo é um dos principais polos cafeeiros do Cerrado Mineiro, com produção de cafés especiais reconhecidos internacionalmente. A cidade conta com forte atividade agropecuária diversificada e abriga a Universidade Federal de Uberlândia — campus avançado.",
  },
  "patos-de-minas-mg": {
    name: "Patos de Minas", state: "MG",
    about: "Patos de Minas é conhecida pela Festa Nacional do Milho e é um importante centro agrícola do Alto Paranaíba. A região produz milho, soja, café e conta com pecuária leiteira expressiva. A cidade é polo regional de serviços agropecuários.",
  },
  "sorriso-mt": {
    name: "Sorriso", state: "MT",
    about: "Sorriso é a capital nacional do agronegócio e maior produtor de soja do Brasil. Com área plantada superior a 600 mil hectares, a cidade é referência em tecnologia agrícola, uso de drones e agricultura de precisão.",
  },
  "rio-verde-go": {
    name: "Rio Verde", state: "GO",
    about: "Rio Verde é um dos maiores produtores de grãos de Goiás, com forte presença de agroindústrias como BRF e Cargill. A região se destaca na produção de soja, milho, sorgo e na suinocultura integrada.",
  },
};

export default function BuscarCidade() {
  const { cidadeEstado } = useParams();
  const data = cityData[cidadeEstado || ""] || null;

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-muted-foreground">Cidade não encontrada.</p>
          <Link to="/buscar" className="btn-primary mt-4 inline-flex">Buscar prestadores</Link>
        </div>
      </div>
    );
  }

  // Filter providers by city/state (will work when real data is populated)
  const providers = mockProviders.filter(p =>
    p.city.toLowerCase() === data.name.toLowerCase() && p.state === data.state
  );
  const title = `Serviços agropecuários em ${data.name} ${data.state} — AgroConnect`;
  const description = `Encontre veterinários, agrônomos e técnicos em ${data.name} ${data.state}. Profissionais verificados, avaliações reais. Contato direto pelo WhatsApp.`;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <SEOHead title={title} description={description} canonical={`https://agroconnect.com.br/buscar/${cidadeEstado}`} />

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span>›</span>
            <Link to="/buscar" className="hover:text-foreground">Buscar</Link>
            <span>›</span>
            <span>{data.state}</span>
            <span>›</span>
            <span className="text-foreground">{data.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-8">
        <div>
          <h1 className="text-xl md:text-2xl font-medium">Serviços agropecuários em {data.name}, {data.state}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin size={14} /> {providers.length} profissionais disponíveis na região
          </p>
        </div>

        {providers.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {[...new Set(providers.map(p => p.category))].map(cat => {
                const count = providers.filter(p => p.category === cat).length;
                return (
                  <span key={cat} className="badge-verified text-xs">{cat} em {data.name} ({count})</span>
                );
              })}
            </div>
            <div className="space-y-4">
              {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">Nenhum prestador cadastrado nesta cidade ainda</h3>
            <p className="text-sm text-muted-foreground">Seja o primeiro a se cadastrar e atender produtores da região.</p>
            <Link to="/cadastro/prestador" className="btn-primary mt-4 inline-flex">Cadastrar como prestador</Link>
          </div>
        )}

        <div className="card-agro">
          <h2 className="font-medium mb-2">Sobre {data.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.about}</p>
        </div>

        <div className="card-agro bg-primary/5 border-primary/20 text-center py-6">
          <p className="font-medium">Você é prestador de serviço em {data.name}?</p>
          <p className="text-sm text-muted-foreground mt-1">Cadastre-se gratuitamente e apareça para os produtores da região.</p>
          <Link to="/cadastro/prestador" className="btn-primary mt-4 inline-flex">Cadastrar como prestador</Link>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Scissors, Trees, SprayCan, Stethoscope, Tractor, Wrench, FlaskConical } from "lucide-react";

const servicosDestaque = [
  {
    icon: Trees,
    title: "Colheita Manual de Café (Panha)",
    desc: "Equipes experientes para colheita em lavouras inclinadas.",
    preco: "R$ 35–45 por saca ou R$ 180–250 por dia/homem",
    query: "Colheita manual de café",
  },
  {
    icon: Scissors,
    title: "Poda de Café",
    desc: "Poda de produção ou rejuvenescimento — aumenta até 20% a produtividade.",
    preco: "R$ 2,50–4,50 por planta",
    query: "Poda de café",
  },
  {
    icon: SprayCan,
    title: "Pulverização Manual / Banho de Café",
    desc: "Aplicação precisa com bomba costal onde máquina não entra.",
    preco: "R$ 90–160 por hectare",
    query: "Pulverização manual",
  },
  {
    icon: Stethoscope,
    title: "Veterinário Rural (Gado Leiteiro)",
    desc: "Vacinação, parto, mastite, vermifugação — atendimento na fazenda.",
    preco: "R$ 280–480 por visita",
    query: "Médico veterinário",
  },
  {
    icon: Tractor,
    title: "Aluguel de Trator (Pequeno/Médio)",
    desc: "Preparo de solo, capina, transporte de café.",
    preco: "R$ 200–320/hora ou R$ 1.100–1.600/dia",
    query: "Aluguel de máquinas agrícolas",
  },
  {
    icon: Wrench,
    title: "Manutenção em Máquinas Agrícolas",
    desc: "Consertos em campo de tratores, colheitadeiras e implementos.",
    preco: "R$ 190–360 por hora",
    query: "Mecânico de tratores",
    senarLink: "https://sistemafaemg.org.br/senar/cursos",
  },
  {
    icon: FlaskConical,
    title: "Análise de Solo + Laudos Agronômicos",
    desc: "Laudo completo + receituário personalizado (emitido pelo nosso agrônomo).",
    preco: "R$ 280–550 por propriedade",
    query: "Análise de solo",
    isLaudo: true,
  },
];

export default function ServicosDestaque() {
  const now = new Date();
  const mes = now.getMonth() + 1; // 1-12
  const isSafra = mes >= 4 && mes <= 8;

  const sorted = isSafra
    ? [servicosDestaque[0], ...servicosDestaque.slice(1)]
    : servicosDestaque;

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-[22px] md:text-2xl font-medium text-center mb-3">
          Serviços mais procurados
        </h2>
        <p className="text-[15px] text-muted-foreground text-center mb-10 max-w-md mx-auto">
          Preços médios da região de Boa Esperança, Alfenas e Lavras — safra 2026
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((s, i) => (
            <div
              key={s.title}
              className={`card-agro p-5 flex flex-col gap-3 ${
                isSafra && i === 0
                  ? "ring-2 ring-secondary bg-accent-bg"
                  : ""
              }`}
            >
              {isSafra && i === 0 && (
                <span className="badge-premium text-xs self-start">
                  Época de safra
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <s.icon size={28} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-medium leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-[15px] text-muted-foreground mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>

              <div className="bg-primary-bg rounded-xl px-4 py-3">
                <p className="text-[15px] font-medium text-primary">
                  Preço médio: {s.preco}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to={`/buscar?q=${encodeURIComponent(s.query)}&raio=80`}
                  className="btn-primary w-full text-center"
                >
                  Buscar agora
                </Link>

                {s.senarLink && (
                  <a
                    href={s.senarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full text-center text-[15px]"
                  >
                    🎓 Curso GRATUITO SENAR — Operação de Tratores (24h, certificado)
                  </a>
                )}

                {s.isLaudo && (
                  <Link
                    to="/marketplace/laudos"
                    className="btn-secondary w-full text-center text-[15px]"
                  >
                    📋 Ver laudos disponíveis
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

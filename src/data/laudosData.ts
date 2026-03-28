export interface Laudo {
  id: string;
  tipo: string;
  agrônomo: string;
  crea: string;
  avaliacao: number;
  totalLaudos: number;
  prazo: string;
  formato: string;
  preco: number;
  descricao: string;
  cidade: string;
}

export const laudosMock: Laudo[] = [
  {
    id: "l1",
    tipo: "Análise de Solo Completa",
    agrônomo: "Antônia Rodrigues",
    crea: "CREA-MG 87654",
    avaliacao: 4.9,
    totalLaudos: 23,
    prazo: "48h",
    formato: "Digital + PDF",
    preco: 280,
    descricao: "Análise física, química e biológica do solo com recomendação de calagem e adubação. Inclui coleta assistida por vídeo e laudo interpretativo completo.",
    cidade: "Barretos, SP",
  },
  {
    id: "l2",
    tipo: "Receituário Agronômico",
    agrônomo: "Paulo Henrique Souza",
    crea: "CREA-GO 12345",
    avaliacao: 4.8,
    totalLaudos: 15,
    prazo: "24h",
    formato: "Digital + ART",
    preco: 150,
    descricao: "Prescrição de defensivos agrícolas com ART inclusa. Válido para compra e aplicação. Documento essencial para uso legal de agrotóxicos.",
    cidade: "Rio Verde, GO",
  },
  {
    id: "l3",
    tipo: "Laudo Fitossanitário",
    agrônomo: "Antônia Rodrigues",
    crea: "CREA-MG 87654",
    avaliacao: 4.9,
    totalLaudos: 11,
    prazo: "72h",
    formato: "Digital + PDF + ART",
    preco: 380,
    descricao: "Diagnóstico de pragas, doenças e deficiências nutricionais com plano de manejo integrado. Inclui visita técnica virtual e relatório fotográfico.",
    cidade: "Barretos, SP",
  },
  {
    id: "l4",
    tipo: "Laudo de Produtividade",
    agrônomo: "Paulo Henrique Souza",
    crea: "CREA-GO 12345",
    avaliacao: 4.7,
    totalLaudos: 8,
    prazo: "5 dias",
    formato: "Digital + PDF + ART",
    preco: 350,
    descricao: "Estimativa de produtividade da lavoura para fins de seguro agrícola, financiamento ou planejamento de colheita.",
    cidade: "Rio Verde, GO",
  },
];

export const laudoCategories = ["Todos", "Análise de Solo", "Receituário Agronômico", "Laudo Fitossanitário", "Laudo de Produtividade", "ART"];

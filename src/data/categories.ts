export interface ServiceCategory {
  group: string;
  icon: string;
  services: string[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    group: "Saúde animal",
    icon: "Heart",
    services: ["Médico veterinário", "Inseminação artificial", "Vacinação em lote", "Castração", "Tosquia"],
  },
  {
    group: "Maquinário",
    icon: "Wrench",
    services: ["Mecânico de tratores", "Mecânico de colheitadeiras", "Operador de trator", "Aluguel de máquinas agrícolas"],
  },
  {
    group: "Manejo de café",
    icon: "Leaf",
    services: ["Colheita manual de café", "Poda de café", "Pulverização manual / banho de café", "Adubação manual", "Desbrota"],
  },
  {
    group: "Assistência técnica",
    icon: "GraduationCap",
    services: ["Engenheiro agrônomo", "Técnico agrícola", "Consultoria de pragas", "Gestão de irrigação"],
  },
  {
    group: "Infraestrutura rural",
    icon: "Hammer",
    services: ["Cercamento e reforma de pasto", "Instalação elétrica rural", "Construção e reforma de galpão", "Perfuração de poço", "Sistema de irrigação", "Reforma de curral"],
  },
  {
    group: "Logística",
    icon: "Truck",
    services: ["Frete rural", "Transporte de animais", "Transporte de grãos"],
  },
  {
    group: "Mão de obra",
    icon: "Users",
    services: ["Diarista rural", "Colheita manual", "Tratorista", "Peão de gado"],
  },
  {
    group: "Negócios e crédito",
    icon: "Briefcase",
    services: ["Crédito rural", "Seguro agrícola", "Assistência para DAP/CAF", "Cooperativa"],
  },
  {
    group: "Comércio local",
    icon: "Store",
    services: ["Loja agropecuária", "Distribuidor de insumos"],
  },
  {
    group: "Cursos e capacitação",
    icon: "BookOpen",
    services: ["Treinamento de manejo", "Curso técnico agro"],
  },
];

export const allServices = serviceCategories.flatMap((c) => c.services);

export const productionTypes = [
  "Pecuária bovina", "Pecuária suína", "Pecuária leiteira", "Avicultura",
  "Lavoura (grãos)", "Cana-de-açúcar", "Café", "Hortifruti",
  "Fruticultura", "Pesca", "Silvicultura", "Outro"
] as const;

export const propertySizes = [
  "Até 10 ha", "10–50 ha", "50–200 ha", "200–500 ha", "Acima de 500 ha"
] as const;

export const radiusOptions = [
  { label: "30 km", value: 30 },
  { label: "50 km", value: 50 },
  { label: "80 km", value: 80 },
  { label: "100 km", value: 100 },
] as const;

export const providerRadiusOptions = [50, 100, 200, 300, 500, 1000, 2000] as const;

export const sortOptions = [
  { label: "Mais próximo", value: "distance" },
  { label: "Melhor avaliado", value: "rating" },
  { label: "Online agora", value: "online" },
] as const;

export const marketplaceCategories = [
  "Animais", "Máquinas", "Sementes", "Insumos", "Veículos", "Propriedades", "Alimentos"
] as const;

export interface Artigo {
  id: string;
  titulo: string;
  categoria: string;
  resumo: string;
  autor: string;
  data: string;
  tempoLeitura: number;
  slug: string;
  imagem: string;
  conteudo: string;
}

export const artigosMock: Artigo[] = [
  {
    id: "a1",
    titulo: "Análise de solo: quando fazer e o que os resultados significam",
    categoria: "Solo",
    resumo: "A análise de solo é a base de qualquer plano de adubação eficiente. Entenda os principais índices e como interpretar o laudo.",
    autor: "Paulo Henrique Souza",
    data: "2025-03-18",
    tempoLeitura: 7,
    slug: "analise-de-solo-quando-fazer",
    imagem: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
    conteudo: `## Por que fazer análise de solo?\n\nA análise de solo é o primeiro passo para qualquer plano de adubação eficiente. Sem ela, o produtor aplica fertilizantes às cegas — gastando mais e produzindo menos.\n\n### Quando coletar as amostras\n\nO ideal é coletar amostras **3 a 4 meses antes do plantio**. Para pastagens, a melhor época é o final da seca. Para lavouras anuais, entre a colheita e o próximo plantio.\n\n### Como coletar corretamente\n\n1. Divida a propriedade em **talhões homogêneos** (mesmo tipo de solo, mesma cultura anterior)\n2. Colete **15 a 20 sub-amostras** por talhão, em zigue-zague\n3. Use trado ou pá reta na profundidade de **0-20 cm** (e 20-40 cm para culturas perenes)\n4. Misture tudo em um balde limpo e retire cerca de **500g** — essa é sua amostra composta\n\n### O que o laudo mostra\n\nOs principais índices são:\n\n- **pH**: indica a acidez do solo. O ideal para a maioria das culturas é entre 5,5 e 6,5\n- **Matéria orgânica (MO)**: quanto maior, melhor a estrutura e retenção de água\n- **Fósforo (P)**: essencial para o desenvolvimento das raízes\n- **Potássio (K)**: importante para a resistência a doenças e qualidade dos grãos\n- **CTC**: capacidade de troca catiônica — indica quanto nutriente o solo consegue reter\n- **Saturação por bases (V%)**: a meta para lavoura de grãos é geralmente acima de 60%\n\n> **Dica prática**: se o V% estiver abaixo do recomendado, é necessário fazer calagem. O laudo indicará a quantidade de calcário a aplicar.\n\n### Quanto custa\n\nUma análise completa custa entre **R$ 50 e R$ 120** por amostra em laboratórios credenciados. O investimento se paga rapidamente com a economia em fertilizantes.\n\n### Onde solicitar\n\nNo CampoConecta, você pode solicitar laudos de análise de solo completa diretamente pelo app, com agrônomos registrados no CREA. [Solicitar laudo agora](/marketplace/laudos).`,
  },
  {
    id: "a2",
    titulo: "Vacinação do gado bovino: calendário completo 2025",
    categoria: "Sanidade Animal",
    resumo: "Quais vacinas são obrigatórias, quais são recomendadas e qual o cronograma ideal para cada fase do rebanho.",
    autor: "João Ferreira da Silva",
    data: "2025-03-12",
    tempoLeitura: 5,
    slug: "vacinacao-gado-bovino-calendario-2025",
    imagem: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop",
    conteudo: `## Calendário de vacinação bovina 2025\n\nManter o calendário de vacinação em dia é obrigação legal e protege o rebanho contra doenças que causam prejuízos enormes.\n\n### Vacinas obrigatórias\n\n**Febre aftosa**\n- Maio: vacinação de todo o rebanho (1ª etapa)\n- Novembro: vacinação de animais até 24 meses (2ª etapa)\n- Vacina trivalente (tipos A, O e C)\n\n**Brucelose (B19)**\n- Fêmeas de 3 a 8 meses de idade\n- Aplicação única, obrigatória\n- Somente por veterinário credenciado\n\n### Vacinas recomendadas\n\n**Clostridioses (carbúnculo, botulismo, enterotoxemia)**\n- Primeira dose aos 3-4 meses\n- Reforço 30 dias depois\n- Revacinação anual\n\n**Raiva bovina**\n- Obrigatória em áreas endêmicas\n- A partir dos 3 meses de idade\n- Reforço anual\n\n**IBR/BVD**\n- Recomendada para rebanhos de cria\n- Duas doses com intervalo de 21 dias\n- Reforço anual, preferencialmente pré-estação de monta\n\n### Dicas práticas\n\n- Mantenha a cadeia de frio: vacinas devem ficar entre **2°C e 8°C**\n- Use seringas e agulhas adequadas ao tamanho do animal\n- Registre todas as vacinações na caderneta sanitária\n- Guarde as notas fiscais das vacinas por no mínimo 2 anos\n\n> Precisa de um veterinário para vacinar seu rebanho? [Busque profissionais perto de você](/buscar).`,
  },
  {
    id: "a3",
    titulo: "Drone agrícola: vale a pena para pequenas propriedades?",
    categoria: "Tecnologia Agro",
    resumo: "Comparativo de custo-benefício entre o aluguel de serviço de drone e outros métodos de pulverização para propriedades de até 50 hectares.",
    autor: "Rafael Souza Lima",
    data: "2025-03-05",
    tempoLeitura: 6,
    slug: "drone-agricola-vale-a-pena-pequenas-propriedades",
    imagem: "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?w=600&h=400&fit=crop",
    conteudo: `## Drone agrícola para pequenas propriedades\n\nO uso de drones na agricultura tem crescido rapidamente no Brasil. Mas será que vale a pena para propriedades menores, de até 50 hectares?\n\n### Vantagens do drone\n\n- **Precisão**: aplica defensivos apenas onde é necessário, reduzindo desperdício em até 30%\n- **Velocidade**: um drone DJI Agras T30 cobre até 40 hectares por dia\n- **Acesso**: alcança áreas íngremes ou encharcadas onde o trator não entra\n- **Menor compactação**: não precisa entrar na lavoura com máquina pesada\n\n### Comparativo de custos\n\n| Método | Custo por hectare | Tempo (10 ha) |\n|--------|------------------|---------------|\n| Costal manual | R$ 80–120 | 2–3 dias |\n| Trator com pulverizador | R$ 40–60 | 3–4 horas |\n| Drone (aluguel de serviço) | R$ 50–80 | 1–2 horas |\n\n### Quando NÃO vale a pena\n\n- Áreas muito pequenas (menos de 5 hectares) — o custo mínimo de deslocamento do operador pode não compensar\n- Culturas muito altas (como milho em estágio avançado) — o drone tem limitação de volume por hectare\n- Condições de vento forte — acima de 20 km/h a aplicação perde eficácia\n\n### Nossa recomendação\n\nPara propriedades de **10 a 50 hectares**, o aluguel de serviço de drone é a melhor opção. Você não precisa investir no equipamento — contrate um operador certificado pela ANAC.\n\n> Encontre operadores de drone perto da sua propriedade: [Buscar operadores de drone](/buscar?q=drone).`,
  },
];

export const blogCategories = ["Todos", "Sanidade Animal", "Solo", "Tecnologia Agro", "Culturas", "Legislação", "Crédito Rural"];

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  pdfUrl?: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  cycleId: string;
  lessons: Lesson[];
};

export type Cycle = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  courses: Course[];
};

const mkLessons = (titles: string[]): Lesson[] =>
  titles.map((title, i) => ({
    id: `l-${i + 1}`,
    title,
    duration: `${20 + ((i * 7) % 25)} min`,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    pdfUrl: "#",
  }));

const course = (
  id: string,
  title: string,
  description: string,
  cycleId: string,
  lessonTitles: string[],
): Course => ({
  id,
  title,
  description,
  cycleId,
  lessons: mkLessons(lessonTitles),
});

export const cycles: Cycle[] = [
  {
    id: "ciclo-1",
    order: 1,
    title: "Ciclo 1 — Fundamentos",
    subtitle: "A base do discípulo",
    description:
      "As colunas essenciais para caminhar com solidez nas Escrituras e na vida com Deus.",
    courses: [
      course(
        "panorama-biblia",
        "Panorama Geral da Bíblia",
        "Uma visão de sobrevoo das 66 janelas das Escrituras, do Gênesis ao Apocalipse.",
        "ciclo-1",
        [
          "A grande história das Escrituras",
          "Antigo Testamento — Lei e História",
          "Poéticos e Sabedoria",
          "Profetas Maiores e Menores",
          "Evangelhos e Atos",
          "Cartas e Apocalipse",
        ],
      ),
      course(
        "hermeneutica",
        "Hermenêutica Bíblica",
        "Princípios sadios para ler, interpretar e aplicar as Escrituras.",
        "ciclo-1",
        [
          "O que é hermenêutica",
          "Contexto histórico e cultural",
          "Gêneros literários da Bíblia",
          "Cristo como centro da interpretação",
          "Aplicação para a vida",
        ],
      ),
      course(
        "doutrinas",
        "Doutrinas Fundamentais",
        "As verdades centrais da fé cristã organizadas com clareza pastoral.",
        "ciclo-1",
        [
          "Bibliologia",
          "Teologia própria — quem é Deus",
          "Antropologia e hamartiologia",
          "Salvação em Cristo",
          "Igreja e últimas coisas",
        ],
      ),
      course(
        "vida-espiritual",
        "Vida Espiritual",
        "Comunhão, oração, jejum e disciplinas que sustentam o caminhar diário.",
        "ciclo-1",
        [
          "Comunhão com o Pai",
          "Oração perseverante",
          "Jejum bíblico",
          "Leitura devocional",
          "Batalha espiritual",
        ],
      ),
    ],
  },
  {
    id: "ciclo-2",
    order: 2,
    title: "Ciclo 2 — Formação Bíblica",
    subtitle: "A Palavra em profundidade",
    description:
      "Um mergulho estruturado nas Escrituras, livro por livro, com contexto e teologia.",
    courses: [
      course(
        "livro-por-livro",
        "Estudo Livro por Livro",
        "Visão panorâmica e temática dos 66 livros das Escrituras.",
        "ciclo-2",
        ["Gênesis a Deuteronômio", "Josué a Ester", "Jó a Cantares", "Isaías a Malaquias", "Mateus a Apocalipse"],
      ),
      course(
        "teologia-biblica",
        "Teologia Bíblica",
        "Como a revelação de Deus se desdobra progressivamente na história.",
        "ciclo-2",
        ["Criação e queda", "Aliança e promessa", "Reino de Deus", "Cristo e a nova aliança", "Consumação"],
      ),
      course(
        "historia-biblica",
        "História Bíblica",
        "Contexto histórico-cultural que ilumina o texto sagrado.",
        "ciclo-2",
        ["Mundo do Antigo Oriente", "Israel e as nações", "Período intertestamentário", "Mundo greco-romano", "Igreja primitiva"],
      ),
      course(
        "cronologia",
        "Linha Cronológica da Bíblia",
        "Da criação à consumação: uma linha do tempo integrada.",
        "ciclo-2",
        ["Da criação aos patriarcas", "Êxodo e conquista", "Monarquia e exílio", "Vida de Cristo", "Igreja e consumação"],
      ),
    ],
  },
  {
    id: "ciclo-3",
    order: 3,
    title: "Ciclo 3 — Teologia",
    subtitle: "Conhecer o Deus vivo",
    description:
      "As grandes áreas da teologia sistemática apresentadas com profundidade e devoção.",
    courses: [
      course("cristologia", "Cristologia", "A pessoa e obra do Senhor Jesus Cristo.", "ciclo-3", [
        "A pré-existência do Verbo",
        "A encarnação",
        "Ministério e ensinos",
        "Cruz e ressurreição",
        "Cristo glorificado",
      ]),
      course("pneumatologia", "Pneumatologia", "A pessoa e obra do Espírito Santo.", "ciclo-3", [
        "O Espírito no Antigo Testamento",
        "Pentecostes",
        "Enchimento e comunhão",
        "Dons e frutos",
        "O Espírito e a missão",
      ]),
      course("escatologia", "Escatologia", "As últimas coisas: esperança e vigilância.", "ciclo-3", [
        "A volta de Cristo",
        "Ressurreição e juízo",
        "Céu e inferno",
        "Novos céus e nova terra",
        "Vivendo à luz do fim",
      ]),
      course("soteriologia", "Soteriologia", "A grande obra da salvação em Cristo.", "ciclo-3", [
        "Graça e chamado",
        "Arrependimento e fé",
        "Justificação",
        "Santificação",
        "Glorificação",
      ]),
      course("eclesiologia", "Eclesiologia", "A Igreja de Cristo: natureza, missão e ministério.", "ciclo-3", [
        "O que é a Igreja",
        "Ordenanças",
        "Ministérios e dons",
        "Governo e disciplina",
        "Igreja e mundo",
      ]),
    ],
  },
  {
    id: "ciclo-4",
    order: 4,
    title: "Ciclo 4 — Identidade Pentecostal",
    subtitle: "Espiritualidade com equilíbrio bíblico",
    description:
      "A herança pentecostal ancorada nas Escrituras: fogo e verdade caminhando juntos.",
    courses: [
      course("dons-espirituais", "Dons Espirituais", "Natureza, propósito e exercício dos dons.", "ciclo-4", [
        "O que são os dons",
        "Dons de revelação",
        "Dons de poder",
        "Dons de elocução",
        "Ordem e edificação",
      ]),
      course("profecia", "Profecia", "Ministério profético bíblico e pastoral.", "ciclo-4", [
        "Profecia nas Escrituras",
        "Discernir a voz de Deus",
        "Julgar profecias",
        "Profecia e edificação",
        "Cautelas pastorais",
      ]),
      course("discernimento", "Discernimento Espiritual", "Distinguir espíritos, doutrinas e influências.", "ciclo-4", [
        "Fundamentos do discernimento",
        "Provar os espíritos",
        "Falsas doutrinas",
        "Guerra espiritual sadia",
        "Vida de vigilância",
      ]),
      course("cura-divina", "Cura Divina", "A obra redentora de Cristo aplicada ao corpo e à alma.", "ciclo-4", [
        "Cura nas Escrituras",
        "Fé e soberania",
        "Cura interior",
        "Ministração pastoral",
        "Quando a cura tarda",
      ]),
    ],
  },
  {
    id: "ciclo-5",
    order: 5,
    title: "Ciclo 5 — Formação Ministerial",
    subtitle: "Servir com propósito",
    description:
      "Ferramentas para líderes, discipuladores, evangelistas e missionários do Reino.",
    courses: [
      course("lideranca", "Liderança", "Liderança segundo o coração de Deus.", "ciclo-5", [
        "Chamado e caráter",
        "Visão e propósito",
        "Equipes saudáveis",
        "Conflitos e reconciliação",
        "Sustentabilidade ministerial",
      ]),
      course("discipulado", "Discipulado", "Formar seguidores maduros de Jesus.", "ciclo-5", [
        "O modelo de Jesus",
        "Discipulado um a um",
        "Discipulado em grupos",
        "Multiplicação",
        "Discipulado pela vida toda",
      ]),
      course("evangelismo", "Evangelismo", "Anunciar Cristo com clareza e amor.", "ciclo-5", [
        "O coração do Evangelho",
        "Testemunho pessoal",
        "Apologética prática",
        "Evangelismo relacional",
        "Evangelismo público",
      ]),
      course("missoes", "Missões", "O coração missionário de Deus.", "ciclo-5", [
        "Deus missionário",
        "Missões transculturais",
        "Sensibilidade cultural",
        "Envio e sustento",
        "Igrejas que plantam igrejas",
      ]),
    ],
  },
];

export const allCourses: Course[] = cycles.flatMap((c) => c.courses);

export const findCourse = (id: string): Course | undefined =>
  allCourses.find((c) => c.id === id);

export const findCycleForCourse = (courseId: string): Cycle | undefined =>
  cycles.find((c) => c.courses.some((co) => co.id === courseId));

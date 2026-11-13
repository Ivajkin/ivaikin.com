// Summaries reuse the public Timothy Ivaikin / Edge portfolio, checked 2026-11-13.
// Employer, delivery entity and founder/product roles remain separate.
const sources={
  'discover-culture':{title:'Discover Culture',entity:'Enlightened Ventures LLC-FZ',period:'2023–2024',proof:'https://www.spa.gov.sa/en/N2002647'},
  infijoy:{title:'Infijoy',entity:'Infijoy DMCC',period:'2021–2023',proof:'https://www.infijoy.com/store'},
  edgefocus:{title:'EdgeFocus',entity:'Edge',period:'',proof:'https://landing.edgefocus.ru/'},
};
const copy={
  en:{
    casesTitle:'A few examples.',casesIntro:'Client delivery, work in other teams and an owned product. Each case keeps its own contribution and context.',caseLabels:['Situation','My contribution','Result'],caseDetails:'Case & contribution',caseProof:['Launch announcement','Course catalog','Open the product'],
    cases:[
      {id:'discover-culture',role:'Technical lead · partner delivery',situation:'One place to discover cultural events and book tickets.',contribution:'Technical leadership through my Dubai company, Enlightened Ventures LLC-FZ, as part of a partner delivery.',result:'Saudi Arabia’s Ministry of Culture announced the platform’s beta launch on 23 November 2023.'},
      {id:'infijoy',role:'CTO · Infijoy team',situation:'Deliver lessons and usage analytics across web and mobile.',contribution:'Led the platform’s development, including content delivery, analytics and release automation.',result:'The team demonstrated the product in July 2022. The current course catalog can be explored separately.'},
      {id:'edgefocus',role:'Product founder · with the Edge team',situation:'Keep customer relationships and project delivery connected.',contribution:'With the team, brought leads, deals and project tasks into one workspace.',result:'A working product for capturing a lead, developing a deal and managing the project’s tasks.'},
    ],
    proofAccess:'LinkedIn may require sign-in and limit visibility by account. Excerpts and working context are available here.',
    recommendationContexts:['Colleagues on different teams. Oleg describes planning under changing priorities and coordinating globally distributed teams.','Worked on the same team. Mark describes working with Timothy as CTO on a government project in the MENA region.'],
    recommendationTranslations:['When shifting priorities and tight timelines might derail a project, Timothy is already anticipating scenarios, orchestrating globally distributed teams…','Under his leadership, we built a high-performing team entirely from scratch and delivered innovative solutions on tight deadlines.'],
    contactNextTitle:'After your message',contactNext:'We start by clarifying your situation and the result you need. If the project is a fit, we discuss the first stage, its scope and terms before work begins. For a partnership or invitation, we agree the purpose and format.',
  },
  ru:{
    casesTitle:'Несколько примеров.',casesIntro:'Клиентские проекты, работа в других командах и собственный продукт. У каждого примера — свой вклад и контекст.',caseLabels:['Задача','Мой вклад','Результат'],caseDetails:'Кейс и вклад',caseProof:['Объявление о запуске','Каталог курсов','Открыть продукт'],
    cases:[
      {id:'discover-culture',role:'Технический руководитель · партнёрская поставка',situation:'Единая площадка для поиска культурных мероприятий и оформления билетов.',contribution:'Техническое руководство через мою компанию в Дубае Enlightened Ventures LLC-FZ в рамках партнёрской поставки.',result:'Министерство культуры Саудовской Аравии объявило о бета-запуске платформы 23 ноября 2023 года.'},
      {id:'infijoy',role:'Технический директор · команда Infijoy',situation:'Доставка уроков и аналитика их использования в вебе и мобильных приложениях.',contribution:'Руководил разработкой платформы: доставкой контента, аналитикой и автоматизацией релизов.',result:'Команда показала продукт на демо в июле 2022 года. Актуальный каталог курсов доступен по отдельной ссылке.'},
      {id:'edgefocus',role:'Основатель продукта · вместе с командой Edge',situation:'Связать работу с клиентами и исполнение проектов.',contribution:'Вместе с командой объединили лиды, сделки и задачи проектов в одном пространстве.',result:'Работающий продукт, в котором можно завести лид, вести сделку и управлять задачами по проекту.'},
    ],
    proofAccess:'LinkedIn может потребовать вход и ограничить видимость в зависимости от аккаунта. Фрагменты и контекст совместной работы доступны здесь.',
    recommendationContexts:['Работали в разных командах. Олег описывает планирование при смене приоритетов и координацию распределённых команд.','Работали в одной команде. Марк описывает совместную работу с Тимофеем как CTO на государственном проекте в регионе MENA.'],
    recommendationTranslations:['Когда смена приоритетов и сжатые сроки могут сорвать проект, Тимофей уже просчитывает сценарии и координирует распределённые по миру команды…','Под его руководством мы с нуля создали высокоэффективную команду и реализовали инновационные решения в сжатые сроки.'],
    contactNextTitle:'После вашего сообщения',contactNext:'Сначала уточним вашу ситуацию и нужный результат. Если задача подходит, обсудим первый этап, его объём и условия до начала работы. Для партнёрства или приглашения — согласуем цель и формат.',
  },
  es:{
    casesTitle:'Algunos ejemplos.',casesIntro:'Proyectos de clientes, trabajo en otros equipos y un producto propio. Cada caso conserva su contribución y contexto.',caseLabels:['Situación','Mi contribución','Resultado'],caseDetails:'Caso y contribución',caseProof:['Anuncio del lanzamiento','Catálogo de cursos','Abrir el producto'],
    cases:[
      {id:'discover-culture',role:'Responsable técnico · ejecución con socios',situation:'Un lugar para descubrir eventos culturales y reservar entradas.',contribution:'Dirección técnica a través de mi empresa de Dubái, Enlightened Ventures LLC-FZ, dentro de una ejecución con socios.',result:'El Ministerio de Cultura de Arabia Saudí anunció el lanzamiento beta de la plataforma el 23 de noviembre de 2023.'},
      {id:'infijoy',role:'CTO · equipo de Infijoy',situation:'Distribuir lecciones y analizar su uso en la web y en aplicaciones móviles.',contribution:'Dirigí el desarrollo de la plataforma: distribución de contenidos, analítica y automatización de versiones.',result:'El equipo presentó el producto en una demostración en julio de 2022. El catálogo actual se puede consultar por separado.'},
      {id:'edgefocus',role:'Fundador del producto · con el equipo de Edge',situation:'Conectar las relaciones con clientes con la ejecución de proyectos.',contribution:'Junto con el equipo, reunimos clientes potenciales, oportunidades y tareas de proyectos en un mismo espacio.',result:'Un producto operativo para registrar un cliente potencial, desarrollar una oportunidad y gestionar las tareas del proyecto.'},
    ],
    proofAccess:'LinkedIn puede exigir iniciar sesión y limitar la visibilidad según la cuenta. Los extractos y el contexto de colaboración se pueden leer aquí.',
    recommendationContexts:['Colegas de equipos distintos. Oleg describe la planificación ante cambios de prioridades y la coordinación de equipos distribuidos por el mundo.','Trabajaron en el mismo equipo. Mark describe su colaboración con Timothy como CTO en un proyecto gubernamental de la región MENA.'],
    recommendationTranslations:['Cuando los cambios de prioridades y los plazos ajustados podrían desviar un proyecto, Timothy ya está anticipando escenarios y coordinando equipos distribuidos por el mundo…','Bajo su dirección, creamos desde cero un equipo de alto rendimiento y entregamos soluciones innovadoras en plazos ajustados.'],
    contactNextTitle:'Después de tu mensaje',contactNext:'Primero aclaramos tu situación y el resultado que necesitas. Si el proyecto encaja, acordamos la primera etapa, su alcance y sus condiciones antes de empezar. Para colaboraciones o invitaciones, concretamos el propósito y el formato.',
  },
  zh:{
    casesTitle:'几个实际案例。',casesIntro:'客户项目、在其他团队的工作与自主产品。每个案例分别说明个人贡献和项目背景。',caseLabels:['需求','我的贡献','结果'],caseDetails:'案例与贡献',caseProof:['上线公告','课程目录','打开产品'],
    cases:[
      {id:'discover-culture',role:'技术负责人 · 合作交付',situation:'提供统一的文化活动发现与购票平台。',contribution:'通过我在迪拜的公司 Enlightened Ventures LLC-FZ，参与合作交付并承担技术领导工作。',result:'沙特阿拉伯文化部于 2023 年 11 月 23 日宣布该平台启动公测。'},
      {id:'infijoy',role:'技术总监 · Infijoy 团队',situation:'在网页和移动应用中提供课程内容及使用分析。',contribution:'领导平台开发，包括内容分发、使用分析和发布自动化。',result:'团队于 2022 年 7 月演示了产品。当前课程目录可通过单独的链接查看。'},
      {id:'edgefocus',role:'产品创始人 · 与 Edge 团队共同打造',situation:'连接客户关系管理与项目执行。',contribution:'与团队一起，将潜在客户、交易机会和项目任务整合到同一工作空间。',result:'一个可以记录潜在客户、推进交易机会并管理项目任务的实际产品。'},
    ],
    proofAccess:'LinkedIn 可能要求登录，并根据账号限制可见范围。此处可直接阅读推荐节选与合作背景。',
    recommendationContexts:['曾在不同团队共事。Oleg 描述了面对优先级变化时的规划，以及对全球分布式团队的协调。','曾在同一团队共事。Mark 描述了与担任 CTO 的 Timothy 在中东及北非地区政府项目中的合作。'],
    recommendationTranslations:['当优先级变化和紧迫期限可能使项目偏离轨道时，Timothy 已在预判不同情境并协调分布于全球的团队……','在他的领导下，我们从零组建了高绩效团队，并在紧迫的期限内交付了创新解决方案。'],
    contactNextTitle:'收到消息后',contactNext:'首先了解您的具体情况与期望结果。如果项目适合合作，再讨论第一阶段的范围和条件，然后开始工作。对于合作提议或活动邀请，先明确目的和形式。',
  },
};

export const homeEvidence=Object.fromEntries(Object.entries(copy).map(([lang,c])=>[lang,{...c,cases:c.cases.map((item,i)=>({...item,...sources[item.id],proofLabel:c.caseProof[i],details:`https://edgeivaikin.com/${lang==='ru'?'ru/':''}cases/#${item.id}`}))}]));

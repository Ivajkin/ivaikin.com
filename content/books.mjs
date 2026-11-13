// Published catalog identities; a cover label is not evidence of a renaming history.
export const bookLanguages=['en','ru','es','zh'];
export const bookPath=(lang,slug)=>`/${lang==='en'?'':lang+'/'}books/${slug}/`;
export const homePath=lang=>lang==='en'?'/':`/${lang}/`;

export const books=[
  {slug:'good-results',title:'Good Results',subtitle:'Art of efficiency for powerful growth',cover:'/assets/books/good-results.jpg',width:333,height:500,isbn:'9781795182980',
    editions:[
      {label:'Amazon · Kindle',url:'https://www.amazon.com/dp/B07N4R52H2'},
      {label:'Amazon · Paperback',url:'https://www.amazon.com/dp/1795182989'},
      {label:'Goodwill Books',url:'https://www.goodwillbooks.com/good-results-art-of-efficiency-for-power-765-9781795182980.html'},
    ],
    excerpt:[
      'Plan rituals, do rituals. Program/design systems - get results.',
      'Focus attention on important. Focus at one task at hand. Where you want results to appear - set your attention there.',
    ],
  },
  {slug:'shattering-limits',title:'Shattering Limits',subtitle:'Self-Improvement for Success and Empowerment',coverTitle:'The Path of Progress',cover:'/assets/books/shattering-limits.jpg',width:587,height:900,
    editions:[
      {label:'Google Play Books',url:'https://play.google.com/store/books/details?id=2NuiEAAAQBAJ'},
      {label:'Google Books',url:'https://books.google.com/books?id=2NuiEAAAQBAJ'},
    ],
    preview:'https://books.google.com/books?id=2NuiEAAAQBAJ&printsec=frontcover',
  },
];

export const bookCopy={
  en:{
    books:'Books',back:'All books & conversations',author:'By Timothy Ivaikin',language:'Written in English',details:'About the book',editions:'Editions & catalogs',availability:'Check the retailer for current availability in your country and format.',about:'About this book',excerpt:'Read an excerpt',excerptNote:'From the “System” chapter of Good Results. Original English text.',original:'Original in English',translation:'Translation of the excerpt',preview:'Read the preview on Google Books',otherBook:'Another book by Timothy',contact:'For interviews and conversations about these books',contactLink:'Get in touch',name:'Timothy Ivaikin',
    'good-results':{
      summary:'For readers who want a practical system for goals, attention and everyday action.',
      description:'Good Results brings together practices for capturing unfinished matters, choosing useful actions and reviewing progress. It connects daily routines with personal values and a longer-term direction.',
      topics:['Goals and an inbox for unfinished matters','Choosing actions and finding causes','Daily routines, attention and weekly review'],
    },
    'shattering-limits':{
      summary:'For readers exploring personal values, motivation, focus and communication.',
      description:'Shattering Limits explores how values and a sense of direction relate to everyday choices. The book brings together ideas and practices for setting goals, focusing attention and working with other people.',
      previewNote:'The ebook preview is available on Google Books.',
      coverNote:'On the cover: The Path of Progress.',
      editionNote:'Google Play Books and Google Books list this ebook as Shattering Limits. The cover supplied for that same edition reads The Path of Progress: Achieving Success Through Self-Development.',
      topics:['Personal values and direction','Motivation, goals and attention','Communication and everyday practice'],
    },
  },
  ru:{
    books:'Книги',back:'Все книги и разговоры',author:'Автор — Тимофей Ивайкин',language:'Книга на английском языке',details:'О книге',editions:'Издания и каталоги',availability:'Наличие нужного формата и доступность в вашей стране уточняйте на странице магазина.',about:'О чём книга',excerpt:'Прочитать фрагмент',excerptNote:'Из главы «System» книги Good Results. Ниже — перевод и оригинал на английском.',original:'Оригинал на английском',translation:'Перевод фрагмента',preview:'Читать фрагмент в Google Books',otherBook:'Другая книга Тимофея',contact:'Для интервью и разговоров об этих книгах',contactLink:'Связаться',name:'Тимофей Ивайкин',
    'good-results':{
      summary:'Для тех, кто хочет связать цели, внимание и повседневные действия в понятную систему.',
      description:'Good Results объединяет практики сохранения незавершённых дел, выбора полезных действий и обзора результатов. Книга связывает ежедневные привычки с личными ценностями и долгосрочным направлением.',
      topics:['Цели и сбор незавершённых дел','Выбор действий и поиск причин','Ежедневные практики, внимание и обзор недели'],
      translatedExcerpt:['Планируйте регулярные практики и выполняйте их. Проектируйте системы — получайте результаты.','Направляйте внимание на важное. Сосредоточьтесь на одной текущей задаче. Хотите получить результат в какой-то области — направьте туда своё внимание.'],
    },
    'shattering-limits':{
      summary:'Для тех, кто хочет разобраться в своих ценностях, мотивации, внимании и общении.',
      description:'Shattering Limits — о связи личных ценностей и жизненного направления с ежедневным выбором. В книге собраны идеи и практики постановки целей, концентрации внимания и взаимодействия с людьми.',
      previewNote:'Первые страницы электронной книги можно просмотреть в Google Books.',
      coverNote:'На обложке — The Path of Progress.',
      editionNote:'В Google Play Books и Google Books эта электронная книга называется Shattering Limits. На обложке того же издания указано The Path of Progress: Achieving Success Through Self-Development.',
      topics:['Личные ценности и направление','Мотивация, цели и внимание','Общение и повседневная практика'],
    },
  },
  es:{
    books:'Libros',back:'Todos los libros y conversaciones',author:'Por Timothy Ivaikin',language:'Escrito en inglés',details:'Sobre el libro',editions:'Ediciones y catálogos',availability:'Consulta en la tienda la disponibilidad actual en tu país y en el formato que prefieras.',about:'De qué trata',excerpt:'Leer un fragmento',excerptNote:'Del capítulo «System» de Good Results. Incluye una traducción y el original en inglés.',original:'Original en inglés',translation:'Traducción del fragmento',preview:'Leer la muestra en Google Books',otherBook:'Otro libro de Timothy',contact:'Para entrevistas y conversaciones sobre estos libros',contactLink:'Contactar',name:'Timothy Ivaikin',
    'good-results':{
      summary:'Para quienes buscan un sistema práctico que conecte objetivos, atención y acciones cotidianas.',
      description:'Good Results reúne prácticas para registrar asuntos pendientes, elegir acciones útiles y revisar el progreso. Conecta las rutinas diarias con los valores personales y una dirección a largo plazo.',
      topics:['Objetivos y registro de asuntos pendientes','Elegir acciones y buscar las causas','Rutinas, atención y revisión semanal'],
      translatedExcerpt:['Planifica tus prácticas habituales y llévalas a cabo. Diseña sistemas para obtener resultados.','Dirige la atención a lo importante. Concéntrate en una tarea cada vez. Donde quieras ver resultados, pon tu atención.'],
    },
    'shattering-limits':{
      summary:'Para quienes desean explorar sus valores, la motivación, la atención y la comunicación.',
      description:'Shattering Limits explora cómo los valores y el sentido de dirección se relacionan con las decisiones cotidianas. Reúne ideas y prácticas para fijar objetivos, concentrar la atención y colaborar con otras personas.',
      previewNote:'La muestra del libro electrónico está disponible en Google Books.',
      coverNote:'En la portada: The Path of Progress.',
      editionNote:'Google Play Books y Google Books presentan este libro electrónico como Shattering Limits. La portada de esa misma edición dice The Path of Progress: Achieving Success Through Self-Development.',
      topics:['Valores personales y dirección','Motivación, objetivos y atención','Comunicación y práctica cotidiana'],
    },
  },
  zh:{
    books:'书籍',back:'全部书籍与访谈',author:'作者：Timothy Ivaikin',language:'英文原著',details:'了解本书',editions:'版本与图书目录',availability:'具体格式及所在地区的供应情况，请以书店页面为准。',about:'关于本书',excerpt:'阅读节选',excerptNote:'节选自 Good Results 的“System”一章，附中文翻译与英文原文。',original:'英文原文',translation:'节选译文',preview:'在 Google Books 阅读试读内容',otherBook:'Timothy 的另一本书',contact:'有关这些书籍的采访与交流',contactLink:'联系作者',name:'Timothy Ivaikin',
    'good-results':{
      summary:'面向希望用一套实用方法连接目标、注意力与日常行动的读者。',
      description:'Good Results 汇集了记录未完成事项、选择有用行动和回顾进展的方法，将日常习惯与个人价值观、长期方向联系起来。它关注如何从纷杂的想法中选出当前行动，并通过持续回顾调整自己的做法。',
      topics:['目标与未完成事项的收集','选择行动与寻找原因','日常习惯、注意力与每周回顾'],
      translatedExcerpt:['规划并坚持日常实践。设计系统，取得结果。','把注意力放在重要的事情上。一次专注于手头的一项任务。希望在哪个方面取得结果，就把注意力放在那里。'],
    },
    'shattering-limits':{
      summary:'面向希望探索个人价值观、动力、专注与沟通的读者。',
      description:'Shattering Limits 探讨个人价值观与生活方向如何影响日常选择，汇集了设定目标、集中注意力和与他人协作的想法与实践。读者可以从自身的处境出发，思考什么值得投入精力，以及如何将方向落实到日常行动中。',
      previewNote:'可在 Google Books 阅读电子书的试读内容。',
      coverNote:'封面标题为 The Path of Progress。',
      editionNote:'Google Play Books 和 Google Books 将这本电子书列为 Shattering Limits。同一版本的封面标题为 The Path of Progress: Achieving Success Through Self-Development。',
      topics:['个人价值观与方向','动力、目标与注意力','沟通与日常实践'],
    },
  },
};

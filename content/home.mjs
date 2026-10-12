import { coreLocales } from './core.mjs';
import { extraLocales } from './extra.mjs';

export const homePaths = { en: '/', ru: '/ru/', es: '/es/', zh: '/zh/' };
// Exact excerpts checked against the authors' received LinkedIn recommendations
// on 2026-10-12. Dates belong to the recommendations, not to current job titles.
export const recommendations = [
  { name: 'Oleg Nozhichkin', date: '2024-12-10', quote: '…transform complexity into strategic opportunity…', translations: { ru: '…превращать сложность в стратегические возможности…', es: '…transformar la complejidad en una oportunidad estratégica…', zh: '……将复杂性转化为战略机遇……' } },
  { name: 'Mark Beseliya', date: '2024-12-08', quote: '…we built a high-performing team entirely from scratch and delivered innovative solutions on tight deadlines.', translations: { ru: '…мы с нуля создали высокоэффективную команду и реализовали инновационные решения в сжатые сроки.', es: '…creamos desde cero un equipo de alto rendimiento y entregamos soluciones innovadoras en plazos ajustados.', zh: '……我们从零开始组建了一支高绩效团队，并在紧迫的期限内交付了创新解决方案。' } },
];
export const recommendationSource = 'https://www.linkedin.com/in/timothyivaikin/details/recommendations/?detailScreenTabIndex=0';
const additions = {
  en: {
    hero: 'People. Technology. Systems that work.',
    title: 'Timothy Ivaikin — entrepreneur, founder & author',
    description: 'Timothy Ivaikin, founder of Edge Ecosystem and creator of EdgeFocus with his team. Software, AI, infrastructure and people, connected around a working result.',
    intro: 'I bring software, AI, infrastructure and teams together to turn business needs into digital products and services.',
    aboutLabel: 'More about me', profileLabel: 'Public profiles',
    proofEyebrow: 'Working together', proofTitle: 'In colleagues’ words.',
    proofNote: 'Excerpts from professional recommendations.', proofOriginal: 'Original in English',
    proofLink: 'Read the recommendations on LinkedIn', proofAccess: 'LinkedIn may require sign-in.',
    copyBrief: 'Copy project brief', copySuccess: 'Copied. Paste it into your message and fill it in.', copyError: 'Select and copy the text below.',
    briefTitle: 'A brief for email or Telegram', briefNote: 'A few lines are enough. Leave anything you do not know yet open.',
    projectBrief: ['Business and your role', 'What is blocked, and why it matters now', 'The result you need, and who it is for', 'Current stage', 'Target date, if any', 'Budget range, if known', 'Who decides and accepts the result'],
    intents: ['A project', 'A partnership', 'An interview or event'],
    intentSubjects: ['Project discussion', 'Partnership proposal', 'Interview or event invitation'],
    intentBodies: ['What needs to work:\nWho it is for:\nCurrent stage:\n', 'The opportunity:\nThe people involved:\nWhat we could do together:\n', 'Topic:\nAudience:\nFormat and proposed dates:\n'],
    socialAlt: 'Timothy Ivaikin — entrepreneur, founder and author',
  },
  ru: {
    hero: 'Люди. Технологии. Работающие системы.',
    title: 'Тимофей Ивайкин — предприниматель, основатель и автор',
    description: 'Тимофей Ивайкин, основатель Edge Ecosystem и создатель EdgeFocus вместе с командой. Соединяю программы, AI, инфраструктуру и людей для решения бизнес-задач.',
    intro: 'Соединяю программное обеспечение, AI, инфраструктуру и команду, чтобы превращать бизнес-задачи в цифровые продукты и услуги.',
    aboutLabel: 'Подробнее обо мне', profileLabel: 'Публичные профили',
    proofEyebrow: 'Совместная работа', proofTitle: 'Словами коллег.',
    proofNote: 'Переводы фрагментов профессиональных рекомендаций.', proofOriginal: 'Оригинал на английском',
    proofLink: 'Читать рекомендации в LinkedIn', proofAccess: 'LinkedIn может потребовать вход.',
    copyBrief: 'Скопировать бриф', copySuccess: 'Скопировано. Вставьте в сообщение и заполните.', copyError: 'Выделите и скопируйте текст ниже.',
    briefTitle: 'Бриф для письма или Telegram', briefNote: 'Достаточно нескольких строк. Если что-то пока неизвестно — так и напишите.',
    projectBrief: ['Компания и ваша роль', 'Что мешает и почему это важно сейчас', 'Нужный результат и для кого он', 'Текущий этап', 'Желаемый срок, если есть', 'Диапазон бюджета, если известен', 'Кто принимает решение и результат работы'],
    intents: ['Проект', 'Партнёрство', 'Интервью или выступление'],
    intentSubjects: ['Обсуждение проекта', 'Предложение о партнёрстве', 'Приглашение на интервью или выступление'],
    intentBodies: ['Что должно заработать:\nДля кого:\nТекущий этап:\n', 'Возможность:\nУчастники:\nЧто можем сделать вместе:\n', 'Тема:\nАудитория:\nФормат и предполагаемые даты:\n'],
    socialAlt: 'Тимофей Ивайкин — предприниматель, основатель и автор',
  },
  es: {
    hero: 'Personas. Tecnología. Sistemas que funcionan.',
    title: 'Timothy Ivaikin — emprendedor, fundador y autor',
    description: 'Timothy Ivaikin, fundador de Edge Ecosystem y creador de EdgeFocus con su equipo. Software, IA, infraestructura y personas unidos para crear productos digitales.',
    intro: 'Conecto software, IA, infraestructura y equipos para convertir las necesidades del negocio en productos y servicios digitales.',
    aboutLabel: 'Más sobre mí', profileLabel: 'Perfiles públicos',
    proofEyebrow: 'Trabajo en equipo', proofTitle: 'En palabras de colegas.',
    proofNote: 'Traducciones de extractos de recomendaciones profesionales.', proofOriginal: 'Original en inglés',
    proofLink: 'Leer las recomendaciones en LinkedIn', proofAccess: 'LinkedIn puede requerir iniciar sesión.',
    copyBrief: 'Copiar resumen del proyecto', copySuccess: 'Copiado. Pégalo en tu mensaje y complétalo.', copyError: 'Selecciona y copia el texto de abajo.',
    briefTitle: 'Resumen para correo o Telegram', briefNote: 'Bastan unas líneas. Puedes dejar abierto lo que todavía no sepas.',
    projectBrief: ['Empresa y tu función', 'Qué está bloqueado y por qué importa ahora', 'El resultado que necesitas y para quién', 'Situación actual', 'Fecha deseada, si existe', 'Rango de presupuesto, si se conoce', 'Quién decide y acepta el resultado'],
    intents: ['Un proyecto', 'Una colaboración', 'Una entrevista o evento'],
    intentSubjects: ['Hablemos de un proyecto', 'Propuesta de colaboración', 'Invitación a una entrevista o evento'],
    intentBodies: ['Qué debe funcionar:\nPara quién:\nSituación actual:\n', 'La oportunidad:\nPersonas involucradas:\nQué podemos hacer juntos:\n', 'Tema:\nPúblico:\nFormato y fechas propuestas:\n'],
    socialAlt: 'Timothy Ivaikin — emprendedor, fundador y autor',
  },
  zh: {
    hero: '人。技术。切实运转的系统。',
    title: 'Timothy Ivaikin — 企业家、创始人、作者',
    description: 'Timothy Ivaikin 是 Edge Ecosystem 创始人，与团队共同打造 EdgeFocus。他将软件、AI、基础设施和团队结合起来，把业务需求转化为数字产品与服务。',
    intro: '我将软件、AI、基础设施和团队结合起来，把业务需求转化为数字产品与服务。',
    aboutLabel: '进一步了解我', profileLabel: '公开个人资料',
    proofEyebrow: '合作经历', proofTitle: '同事的评价。',
    proofNote: '专业推荐摘录的中文翻译。', proofOriginal: '英文原文',
    proofLink: '在 LinkedIn 阅读推荐', proofAccess: 'LinkedIn 可能需要登录。',
    copyBrief: '复制项目说明', copySuccess: '已复制。请粘贴到消息中并填写。', copyError: '请选择并复制下方文字。',
    briefTitle: '用于邮件或 Telegram 的项目说明', briefNote: '简述几句即可。尚不确定的内容可以注明。',
    projectBrief: ['公司与您的职责', '目前的障碍，以及为什么现在需要解决', '所需结果及其目标用户', '目前阶段', '期望日期（如有）', '预算范围（如已知）', '谁负责决策及验收'],
    intents: ['项目', '合作', '采访或活动'],
    intentSubjects: ['项目讨论', '合作提议', '采访或活动邀请'],
    intentBodies: ['需要实现什么：\n面向哪些用户：\n目前阶段：\n', '合作机会：\n参与人员：\n我们可以共同做什么：\n', '主题：\n受众：\n形式与建议日期：\n'],
    socialAlt: 'Timothy Ivaikin — 企业家、创始人、作者',
  },
};

export const homeLocales = Object.fromEntries(Object.entries({ ...coreLocales, ...extraLocales }).map(([lang, copy]) => [lang, {
  ...copy, ...additions[lang], aboutPath: copy.path, path: homePaths[lang],
  intentBodies: [additions[lang].projectBrief.map(label => `${label}:`).join('\n') + '\n', ...additions[lang].intentBodies.slice(1)],
}]));

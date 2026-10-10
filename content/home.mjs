import { coreLocales } from './core.mjs';
import { extraLocales } from './extra.mjs';

export const homePaths = { en: '/', ru: '/ru/', es: '/es/', zh: '/zh/' };
const additions = {
  en: {
    hero: 'People. Technology. Systems that work.',
    title: 'Timothy Ivaikin — entrepreneur, founder & author',
    description: 'Timothy Ivaikin, founder of Edge Ecosystem and creator of EdgeFocus with his team. Software, AI, infrastructure and people, connected around a working result.',
    intro: 'I bring software, AI, infrastructure and teams together to turn business needs into digital products and services.',
    aboutLabel: 'More about me', profileLabel: 'Public profiles',
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
    intents: ['项目', '合作', '采访或活动'],
    intentSubjects: ['项目讨论', '合作提议', '采访或活动邀请'],
    intentBodies: ['需要实现什么：\n面向哪些用户：\n目前阶段：\n', '合作机会：\n参与人员：\n我们可以共同做什么：\n', '主题：\n受众：\n形式与建议日期：\n'],
    socialAlt: 'Timothy Ivaikin — 企业家、创始人、作者',
  },
};

export const homeLocales = Object.fromEntries(Object.entries({ ...coreLocales, ...extraLocales }).map(([lang, copy]) => [lang, {
  ...copy, ...additions[lang], aboutPath: copy.path, path: homePaths[lang],
}]));

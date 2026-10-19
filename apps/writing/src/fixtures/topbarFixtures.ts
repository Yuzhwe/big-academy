import type { BALocale, TaskProgressItem, TaskProgressStatus } from '@big-academy/design-system';

/**
 * Preview fixtures only.
 *
 * Activity titles for the 8-step lesson are copied from the G2-O lesson plan
 * embedded in `source/alex-original.html` so length is realistic.
 * Status arrays and `canOpen` are NOT `Pages.done`, `Skip.skipped`, or
 * `Pages.canOpen`. A production adapter still has to map lesson-local indexes
 * onto the canonical global screen index.
 */

export interface TopBarFixture {
  id: string;
  locale: BALocale;
  lessonNumber: string;
  lessonTitle: string;
  tags: string[];
  tasks: TaskProgressItem[];
  current: number;
  canOpen: (index: number) => boolean;
}

const lessonOneEn = [
  ['learn', 'Learn'],
  ['pick', 'Pick the topic sentence'],
  ['opinion-word', 'Find the opinion word'],
  ['opinion-fact', 'Opinion or fact?'],
  ['build', 'Build a topic sentence'],
  ['finish', 'Finish the sentence'],
  ['try', 'Try it in your own writing'],
  ['check', 'Check'],
] as const;

const lessonOneZh = [
  ['learn', '学一学'],
  ['pick', '选出主题句'],
  ['opinion-word', '找出观点词'],
  ['opinion-fact', '观点还是事实？'],
  ['build', '拼一个主题句'],
  ['finish', '把句子写完整'],
  ['try', '在自己的写作里试一试'],
  ['check', '小测'],
] as const;

function rows(
  source: readonly (readonly [string, string])[],
  statuses: readonly TaskProgressStatus[],
): TaskProgressItem[] {
  return source.map(([id, label], index) => ({
    id,
    label,
    status: statuses[index] ?? 'locked',
    number: index + 1,
  }));
}

/** Realistic preview gate: locked rows are closed; other statuses are open. Still a fixture. */
export function openUnlessLocked(tasks: readonly TaskProgressItem[]) {
  return (index: number) => tasks[index]?.status !== 'locked';
}

const mixedStatuses: TaskProgressStatus[] = [
  'done',
  'done',
  'skipped',
  'current',
  'available',
  'available',
  'locked',
  'locked',
];

function manyTasks(locale: BALocale): TaskProgressItem[] {
  const statuses: TaskProgressStatus[] = [
    'done',
    'done',
    'done',
    'skipped',
    'current',
    'available',
    'available',
    'available',
    ...Array.from({ length: 10 }, () => 'locked' as const),
  ];
  return statuses.map((status, index) => ({
    id: `many-${locale}-${index + 1}`,
    label: locale === 'zh' ? `活动 ${index + 1}` : `Activity ${index + 1}`,
    status,
    number: index + 1,
  }));
}

export const LONG_TITLE_EN =
  'Writing an opinion paragraph that tells the topic and what I think about school uniforms in our community';

export const LONG_TITLE_ZH =
  '我能写出说明话题和观点的主题句，并且把理由和例子写清楚给同学看的那一课';

export function getFixture(id: string, locale: BALocale = 'en'): TopBarFixture {
  if (id === 'many') {
    const tasks = manyTasks(locale);
    return {
      id,
      locale,
      lessonNumber: locale === 'zh' ? '第 4 课' : 'Lesson 4',
      lessonTitle: locale === 'zh' ? '连写句' : 'Run-on sentences',
      tags: locale === 'zh' ? ['G2-O', '观点段落'] : ['G2-O', 'Opinion'],
      tasks,
      current: 4,
      canOpen: openUnlessLocked(tasks),
    };
  }

  if (id === 'long') {
    const tasks = rows(locale === 'zh' ? lessonOneZh : lessonOneEn, mixedStatuses);
    return {
      id,
      locale,
      lessonNumber: locale === 'zh' ? '第 1 课' : 'Lesson 1',
      lessonTitle: locale === 'zh' ? LONG_TITLE_ZH : LONG_TITLE_EN,
      tags: locale === 'zh' ? ['G2-O', '观点段落'] : ['G2-O', 'Opinion'],
      tasks,
      current: 3,
      canOpen: openUnlessLocked(tasks),
    };
  }

  const tasks = rows(locale === 'zh' ? lessonOneZh : lessonOneEn, mixedStatuses);
  return {
    id: 'mixed',
    locale,
    lessonNumber: locale === 'zh' ? '第 1 课' : 'Lesson 1',
    lessonTitle: locale === 'zh' ? '主题句' : 'Topic sentences',
    tags: locale === 'zh' ? ['G2-O', '观点段落'] : ['G2-O', 'Opinion'],
    tasks,
    current: 3,
    canOpen: openUnlessLocked(tasks),
  };
}

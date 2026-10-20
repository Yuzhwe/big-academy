import type { BALocale, TaskProgressStatus } from '../types/task';

export interface TaskChrome {
  nav: string;
  busy: string;
  back: string;
  backShort: string;
  status: Record<TaskProgressStatus, string>;
  task: (number: number, label: string, status: string) => string;
}

const chrome: Record<BALocale, TaskChrome> = {
  en: {
    nav: 'Tasks in this lesson',
    busy: 'Busy',
    back: 'Back to my path',
    backShort: 'My path',
    status: {
      done: 'done',
      current: 'current',
      available: 'available',
      locked: 'locked',
      skipped: 'skipped',
    },
    task: (number, label, status) => `Task ${number}: ${label}, ${status}`,
  },
  zh: {
    nav: '本课任务',
    busy: '处理中',
    back: '回到我的学习路径',
    backShort: '我的路径',
    status: {
      done: '已完成',
      current: '当前',
      available: '可进入',
      locked: '未解锁',
      skipped: '已跳过',
    },
    task: (number, label, status) => `任务 ${number}：${label}，${status}`,
  },
};

export function taskChrome(locale: BALocale = 'en'): TaskChrome {
  return chrome[locale] ?? chrome.en;
}

export function localeTag(locale: BALocale = 'en'): 'en-US' | 'zh-CN' {
  return locale === 'zh' ? 'zh-CN' : 'en-US';
}

/**
 * UI permission check only.
 * A locked row never navigates. Any other status navigates only when the
 * injected `canOpen(index)` allows it. This is not an unlock rule.
 */
export function taskMayNavigate(
  status: TaskProgressStatus,
  index: number,
  canOpen: (index: number) => boolean,
): boolean {
  if (status === 'locked') return false;
  return canOpen(index) === true;
}

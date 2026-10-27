import { useEffect, useId, useSyncExternalStore } from 'react';
import { BAButton, BAIcon } from '@big-academy/design-system';
import { lessonSpeech } from './speech';

export function SpeechButton({ text, size = 36, className = '', locale = 'en', prompt = false }: {
  text: string | (() => string); size?: 36 | 50; className?: string; locale?: 'en' | 'zh'; prompt?: boolean;
}) {
  const id = useId();
  const active = useSyncExternalStore(lessonSpeech.subscribe, lessonSpeech.getSnapshot, () => null);
  const speaking = active === id;
  useEffect(() => () => { if (lessonSpeech.getSnapshot() === id) lessonSpeech.stop(); }, [id]);
  const zh = locale === 'zh';
  return <BAButton className={className} iconOnly size={size} variant="ghost" aria-pressed={speaking}
    aria-label={speaking ? (zh ? '停止朗读' : 'Stop listening') : prompt ? (zh ? '朗读题目' : 'Listen to the prompt') : (zh ? '朗读这张 Coach 卡片' : 'Listen to this Coach card')}
    onPress={() => lessonSpeech.toggle(id, typeof text === 'function' ? text() : text)}>
    <BAIcon name="speaker" size={size === 36 ? 20 : 24} />
  </BAButton>;
}

/** One speech owner for prompts and Coach cards. Never touches learning state. */
let active: string | null = null;
let utterance: SpeechSynthesisUtterance | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());
export const lessonSpeech = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  getSnapshot: () => active,
  stop() {
    active = null; utterance = null;
    try { window.speechSynthesis?.cancel(); } catch { /* unavailable device */ }
    emit();
  },
  toggle(id: string, text: string) {
    const stopping = active === id;
    this.stop();
    if (stopping || !text.trim() || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;
    try {
      const next = new SpeechSynthesisUtterance(text.trim());
      next.lang = /[\u3400-\u9fff]/.test(text) ? 'zh-CN' : 'en-US';
      next.onend = next.onerror = () => {
        if (utterance === next) { active = null; utterance = null; emit(); }
      };
      active = id; utterance = next; emit();
      window.speechSynthesis.speak(next);
    } catch { this.stop(); }
  },
};

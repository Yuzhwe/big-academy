import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CoachMessage, type CoachMessageTone } from '../../writing/src/components/writing/LessonWorkspace';
import { CoachNote } from '../../writing/src/components/writing/CoachNote';
import type { Scene } from './catalog';
import './CoachChatPlayground.css';

type MessageTurn = {
  id: string;
  kind: 'message';
  tone: CoachMessageTone;
  textEn: string;
  textZh: string;
};

type NoteTurn = {
  id: string;
  kind: 'note';
  tone: 'highlight' | 'improvement';
  titleEn: string;
  titleZh: string;
  textEn: string;
  textZh: string;
};

type Turn = MessageTurn | NoteTurn;

type PrependSnapshot = { beforeHeight: number; beforeTop: number };

const LIVE_EDGE_PX = 48;
const ANCHOR_PAD_PX = 12;

const SEED_TURNS: Turn[] = [
  {
    id: 't-orient',
    kind: 'message',
    tone: 'orientation',
    textEn: 'Read your draft, then check what is strong and what still needs work.',
    textZh: '先读一读你的草稿，再看看哪些地方写得好，哪些地方还可以改。',
  },
  {
    id: 't-hl',
    kind: 'note',
    tone: 'highlight',
    titleEn: 'Highlight',
    titleZh: '亮点',
    textEn: "Strong topic sentence: 'I believe our school should have a garden.'",
    textZh: '有力的主题句：“我认为学校应该有一座花园。”',
  },
  {
    id: 't-im',
    kind: 'note',
    tone: 'improvement',
    titleEn: 'Improvement',
    titleZh: '改进',
    textEn: 'Does every sentence tell me what you think? Use think, believe or should. Keep every sentence about a school garden.',
    textZh: '每一句都表达了你的看法吗？用 think、believe 或 should。另外：每句话都围绕学校花园。',
  },
  {
    id: 't-hint',
    kind: 'message',
    tone: 'hint',
    textEn: 'Try one clearer opinion word, then check again.',
    textZh: '试着用一个更清楚的观点词，然后再检查一次。',
  },
];

const APPEND_SCRIPT: Turn[] = [
  {
    id: 'a-orient-2',
    kind: 'message',
    tone: 'orientation',
    textEn: 'Next: revise one Improvement line, then ask me to check again.',
    textZh: '下一步：先改一处「改进」，再让我重新检查。',
  },
  {
    id: 'a-correct',
    kind: 'message',
    tone: 'correct',
    textEn: 'Nice — that opinion word makes your claim clearer.',
    textZh: '很好——这个观点词让你的主张更清楚了。',
  },
  {
    id: 'a-hl-2',
    kind: 'note',
    tone: 'highlight',
    titleEn: 'Highlight',
    titleZh: '亮点',
    textEn: 'You kept the garden focus in every sentence.',
    textZh: '你每一句都仍围绕学校花园。',
  },
  {
    id: 'a-hint-2',
    kind: 'message',
    tone: 'hint',
    textEn: 'Add one reason that starts with because.',
    textZh: '再补一句用 because 开头的理由。',
  },
];

const HISTORY_SCRIPT: Turn[] = [
  {
    id: 'h-orient',
    kind: 'message',
    tone: 'orientation',
    textEn: 'Earlier: we looked at topic sentences before you drafted.',
    textZh: '更早：动笔前我们先看了主题句。',
  },
  {
    id: 'h-hint',
    kind: 'message',
    tone: 'hint',
    textEn: 'Earlier hint: name the place you care about.',
    textZh: '更早的提示：说出你在意的那个地方。',
  },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneTurn(turn: Turn, prefix: string): Turn {
  return { ...turn, id: uid(prefix) };
}

function isNearBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= LIVE_EDGE_PX;
}

/**
 * BA-WR-018 · CoachChatPlayground (Library exploration only).
 * Minimal DIY MessageScroller-inspired viewport: height-limited scroll,
 * new-turn top anchor while following, stop follow on scroll-up,
 * Jump to latest, optional prepend-history. Not wired into Writing CourseApp.
 */
export function CoachChatPlayground({ scene }: { scene: Scene }) {
  const zh = scene.locale === 'zh';
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const pendingAnchorId = useRef<string | null>(null);
  const pendingPrepend = useRef<PrependSnapshot | null>(null);

  const [turns, setTurns] = useState<Turn[]>(() => SEED_TURNS.map((t) => ({ ...t })));
  const [appendIndex, setAppendIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [stickToLiveEdge, setStickToLiveEdge] = useState(true);
  const [showJump, setShowJump] = useState(false);

  const syncLiveEdge = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const near = isNearBottom(el);
    setShowJump(!near);
    setStickToLiveEdge(near);
  }, []);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const prepend = pendingPrepend.current;
    if (prepend) {
      const delta = el.scrollHeight - prepend.beforeHeight;
      el.scrollTop = prepend.beforeTop + delta;
      pendingPrepend.current = null;
      syncLiveEdge();
      return;
    }

    const anchorId = pendingAnchorId.current;
    if (!anchorId) return;
    pendingAnchorId.current = null;
    const item = itemRefs.current.get(anchorId);
    if (!item) return;
    el.scrollTop = Math.max(0, item.offsetTop - ANCHOR_PAD_PX);
    syncLiveEdge();
  }, [turns, syncLiveEdge]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setStickToLiveEdge(true);
    setShowJump(false);
  }, []);

  const appendTurn = () => {
    const template = APPEND_SCRIPT[appendIndex % APPEND_SCRIPT.length];
    const next = cloneTurn(template, 'append');
    setAppendIndex((i) => i + 1);
    if (stickToLiveEdge) pendingAnchorId.current = next.id;
    setTurns((prev) => [...prev, next]);
  };

  const prependHistory = () => {
    const el = viewportRef.current;
    pendingPrepend.current = {
      beforeHeight: el?.scrollHeight ?? 0,
      beforeTop: el?.scrollTop ?? 0,
    };
    const template = HISTORY_SCRIPT[historyIndex % HISTORY_SCRIPT.length];
    const next = cloneTurn(template, 'hist');
    setHistoryIndex((i) => i + 1);
    setTurns((prev) => [next, ...prev]);
  };

  const jumpToLatest = () => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setStickToLiveEdge(true);
    setShowJump(false);
  };

  const resetDemo = () => {
    pendingAnchorId.current = null;
    pendingPrepend.current = null;
    setTurns(SEED_TURNS.map((t) => ({ ...t })));
    setAppendIndex(0);
    setHistoryIndex(0);
    setStickToLiveEdge(true);
    requestAnimationFrame(() => {
      const el = viewportRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      setShowJump(false);
    });
  };

  const setItemRef = (id: string, node: HTMLElement | null) => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  };

  return (
    <div className="preview-example coach-chat-playground" data-testid="coach-chat-preview" data-component="BA-WR-018">
      <div className="coach-chat-playground__chrome">
        <div className="coach-chat-playground__toolbar" role="toolbar" aria-label={zh ? '聊天演示控制' : 'Chat demo controls'}>
          <button type="button" className="coach-chat-playground__btn" data-testid="coach-chat-append" onClick={appendTurn}>
            {zh ? '追加一轮' : 'Append turn'}
          </button>
          <button type="button" className="coach-chat-playground__btn" data-testid="coach-chat-prepend" onClick={prependHistory}>
            {zh ? '前置历史' : 'Prepend history'}
          </button>
          <button type="button" className="coach-chat-playground__btn" data-testid="coach-chat-reset" onClick={resetDemo}>
            {zh ? '重置' : 'Reset'}
          </button>
          <span className="coach-chat-playground__meta" data-testid="coach-chat-stick-state">
            {stickToLiveEdge
              ? (zh ? '跟随 · 贴底' : 'Following · live edge')
              : (zh ? '已停跟随 · 可回最新' : 'Unstuck · jump available')}
          </span>
        </div>

        <div className="coach-chat-playground__stage">
          <div
            ref={viewportRef}
            className="coach-chat-playground__viewport"
            data-testid="coach-chat-viewport"
            onScroll={syncLiveEdge}
          >
            <div className="coach-chat-playground__content" data-testid="coach-chat-content">
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  className="coach-chat-playground__item"
                  data-testid="coach-chat-item"
                  data-turn-id={turn.id}
                  data-kind={turn.kind}
                  ref={(node) => setItemRef(turn.id, node)}
                >
                  {turn.kind === 'message' ? (
                    <CoachMessage tone={turn.tone} locale={scene.locale}>
                      {zh ? turn.textZh : turn.textEn}
                    </CoachMessage>
                  ) : (
                    <CoachNote tone={turn.tone} title={zh ? turn.titleZh : turn.titleEn}>
                      {zh ? turn.textZh : turn.textEn}
                    </CoachNote>
                  )}
                </div>
              ))}
            </div>
          </div>

          {showJump ? (
            <button
              type="button"
              className="coach-chat-playground__jump"
              data-testid="coach-chat-jump"
              onClick={jumpToLatest}
            >
              {zh ? '跳到最新' : 'Jump to latest'}
            </button>
          ) : null}
        </div>
      </div>

      <p className="review04-caption">
        {zh
          ? 'BA-WR-018 · Library 探索标本：高度受限 Viewport + 轮次列表。追加时若仍在 live edge，新轮次锚在视口顶部附近；上滑停止自动跟随；可跳到最新；可前置历史。不接入 Writing 课程页。'
          : 'BA-WR-018 · Library exploration: height-limited Viewport + turn list. While at the live edge, a new turn anchors near the top of the viewport; scrolling up stops auto-follow; Jump to latest + optional prepend-history. Not wired into Writing CourseApp.'}
      </p>
    </div>
  );
}

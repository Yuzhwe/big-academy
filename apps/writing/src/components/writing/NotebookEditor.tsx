import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  bindCount,
  cssPx,
  COIL_SVG,
  type NotebookOrientation,
} from './notebookBind';
import './NotebookEditor.css';

export type { NotebookOrientation } from './notebookBind';
export { bindCount } from './notebookBind';

export interface NotebookEditorProps {
  /** Portrait = top binding; landscape = left binding. Controlled by Library Scene — no in-component toolbar. */
  orientation?: NotebookOrientation;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
  /** Expose hole/coil count for Library caption / tests. */
  onBindCountChange?: (count: number) => void;
}

export function NotebookEditor({
  orientation = 'portrait',
  value,
  defaultValue = '',
  placeholder = '在这里开始写…',
  className,
  onChange,
  onBindCountChange,
}: NotebookEditorProps) {
  const landscape = orientation === 'landscape';
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bindInnerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const text = value !== undefined ? value : uncontrolled;
  const [holeCount, setHoleCount] = useState(3);
  const [bindSpan, setBindSpan] = useState<number | undefined>(undefined);

  const grow = useCallback(() => {
    const editor = editorRef.current;
    const stage = stageRef.current;
    if (!editor || !stage) return;
    editor.style.height = 'auto';
    const min = landscape ? 520 : 600;
    editor.style.height = `${Math.max(min, editor.scrollHeight)}px`;
  }, [landscape]);

  const renderBind = useCallback(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    const bindInner = bindInnerRef.current;
    const root = rootRef.current;
    if (!stage || !sheet || !bindInner || !root) return;

    let span: number;
    if (landscape) {
      span = sheet.getBoundingClientRect().height || sheet.offsetHeight || 520;
      setBindSpan(span);
      bindInner.style.width = `${span}px`;
    } else {
      span = stage.getBoundingClientRect().width || stage.offsetWidth;
      setBindSpan(undefined);
      bindInner.style.width = '';
    }

    const side = cssPx(root, '--ne-side');
    const slot = cssPx(root, '--ne-bind-slot');
    const pitch = cssPx(root, '--ne-bind-pitch');
    const n = bindCount(span, side, slot, pitch);
    setHoleCount(n);
    onBindCountChange?.(n);
  }, [landscape, onBindCountChange]);

  useLayoutEffect(() => {
    grow();
    renderBind();
  }, [grow, renderBind, text, orientation]);

  useEffect(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      grow();
      renderBind();
    });
    ro.observe(stage);
    if (sheet) ro.observe(sheet);
    const onWin = () => {
      grow();
      renderBind();
    };
    window.addEventListener('resize', onWin);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWin);
    };
  }, [grow, renderBind]);

  const handleChange = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    onChange?.(next);
  };

  const bindInnerStyle: CSSProperties | undefined = landscape && bindSpan != null
    ? { ['--ne-bind-span' as string]: `${bindSpan}px`, width: bindSpan }
    : undefined;

  const holes = Array.from({ length: holeCount }, (_, i) => (
    <span className="notebook-editor__hole" key={`h-${i}`}>
      <i />
    </span>
  ));
  const coils = Array.from({ length: holeCount }, (_, i) => (
    <div className="notebook-editor__coil" key={`c-${i}`}>
      {COIL_SVG}
    </div>
  ));

  const hint = landscape
    ? `横本 · 左装订 · ${holeCount} 孔（间距优先）· 横线横写`
    : `竖本 · 顶装订 · ${holeCount} 孔（间距优先）· 首行顶空 +20`;

  return (
    <div
      ref={rootRef}
      className={['notebook-editor', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      data-testid="notebook-editor"
    >
      {/* NO demo toolbar — orientation is a prop from Library Preview / Scene / URL */}
      <div
        ref={stageRef}
        className={`notebook-editor__stage ${landscape ? 'is-landscape' : 'is-portrait'}`}
      >
        <div className="notebook-editor__notebook">
          <div className="notebook-editor__bind">
            <div className="notebook-editor__bind-inner" ref={bindInnerRef} style={bindInnerStyle}>
              <div className="notebook-editor__holes" aria-hidden="true">
                {holes}
              </div>
              <div className="notebook-editor__coils" aria-hidden="true">
                {coils}
              </div>
            </div>
          </div>
          <div className="notebook-editor__sheet" ref={sheetRef}>
            <div className="notebook-editor__ruled" aria-hidden="true" />
            <textarea
              ref={editorRef}
              className="notebook-editor__editor"
              spellCheck
              placeholder={placeholder}
              value={text}
              onChange={(e) => handleChange(e.target.value)}
              aria-label="Notebook editor"
            />
          </div>
        </div>
        <p className="notebook-editor__hint">{hint}</p>
      </div>
    </div>
  );
}

export default NotebookEditor;

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  bindCount,
  cssPx,
  COIL_SVG,
  type NotebookOrientation,
} from './notebookBind';
import './NotebookShell.css';

export type { NotebookOrientation } from './notebookBind';
export { bindCount } from './notebookBind';

export type NotebookShellProps = {
  children?: ReactNode;
  className?: string;
  /** Portrait = top binding; landscape = left binding. Library Scene / URL owns this — no in-component toolbar. */
  orientation?: NotebookOrientation;
  /** Expose hole/coil count for Library caption / tests. */
  onBindCountChange?: (count: number) => void;
};

/**
 * Notebook chrome: spiral holes + U-ring coils + paper frame + background ruled lines.
 * No built-in textarea — callers pass children (editor, WordGrid, etc.) stacked above lines.
 * Adaptation A: width 100% + max-width; paper/content flex:1; min-height:0 fill parent.
 */
export function NotebookShell({
  children,
  className,
  orientation = 'portrait',
  onBindCountChange,
}: NotebookShellProps) {
  const landscape = orientation === 'landscape';
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bindInnerRef = useRef<HTMLDivElement>(null);
  const [holeCount, setHoleCount] = useState(3);
  const [bindSpan, setBindSpan] = useState<number | undefined>(undefined);

  const renderBind = useCallback(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    const bindInner = bindInnerRef.current;
    const root = rootRef.current;
    if (!stage || !sheet || !bindInner || !root) return;

    let span: number;
    if (landscape) {
      span = sheet.getBoundingClientRect().height || sheet.offsetHeight || 320;
      setBindSpan(span);
      bindInner.style.width = `${span}px`;
    } else {
      span = stage.getBoundingClientRect().width || stage.offsetWidth;
      setBindSpan(undefined);
      bindInner.style.width = '';
    }

    const side = cssPx(root, '--ns-side');
    const slot = cssPx(root, '--ns-bind-slot');
    const pitch = cssPx(root, '--ns-bind-pitch');
    const n = bindCount(span, side, slot, pitch);
    setHoleCount(n);
    onBindCountChange?.(n);
  }, [landscape, onBindCountChange]);

  useLayoutEffect(() => {
    renderBind();
  }, [renderBind, orientation, children]);

  useEffect(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      renderBind();
    });
    ro.observe(stage);
    if (sheet) ro.observe(sheet);
    const onWin = () => renderBind();
    window.addEventListener('resize', onWin);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWin);
    };
  }, [renderBind]);

  const bindInnerStyle: CSSProperties | undefined =
    landscape && bindSpan != null
      ? { ['--ns-bind-span' as string]: `${bindSpan}px`, width: bindSpan }
      : undefined;

  const holes = Array.from({ length: holeCount }, (_, i) => (
    <span className="notebook-shell__hole" key={`h-${i}`}>
      <i />
    </span>
  ));
  const coils = Array.from({ length: holeCount }, (_, i) => (
    <div className="notebook-shell__coil" key={`c-${i}`}>
      {COIL_SVG}
    </div>
  ));

  return (
    <div
      ref={rootRef}
      className={['notebook-shell', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      data-testid="notebook-shell"
    >
      <div
        ref={stageRef}
        className={`notebook-shell__stage ${landscape ? 'is-landscape' : 'is-portrait'}`}
      >
        <div className="notebook-shell__notebook">
          <div className="notebook-shell__bind">
            <div className="notebook-shell__bind-inner" ref={bindInnerRef} style={bindInnerStyle}>
              <div className="notebook-shell__holes" aria-hidden="true">
                {holes}
              </div>
              <div className="notebook-shell__coils" aria-hidden="true">
                {coils}
              </div>
            </div>
          </div>
          <div className="notebook-shell__sheet" ref={sheetRef}>
            <div className="notebook-shell__ruled" aria-hidden="true" data-testid="notebook-shell-ruled" />
            <div className="notebook-shell__content">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotebookShell;

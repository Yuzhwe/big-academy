import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import './BAPageTransition.css';

/** BA-WR-012 — Review 04 Stage A candidate only. Independently implemented
 * Cross Blur pattern, not copied from Great UI's restricted source.
 * Receives view keys and renders the two pages through a caller-owned function;
 * it NEVER owns navigation state, persistence, scoring or lesson unlocks.
 */
export interface BAPageTransitionProps {
  viewKey: string;
  renderView: (key: string) => ReactNode;
  duration?: number;
  maxBlur?: number;
  reducedMotion?: boolean;
  className?: string;
  onSettled?: (key: string) => void;
}

export function BAPageTransition({
  viewKey, renderView, duration = 500, maxBlur = 12,
  reducedMotion = false, className, onSettled,
}: BAPageTransitionProps) {
  const [visibleKey, setVisibleKey] = useState(viewKey);
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const contentRef=useRef<HTMLDivElement>(null);
  const latestMarkup=useRef('');
  const latestHeight=useRef(0);
  const [outgoing,setOutgoing]=useState('');
  const [outgoingHeight,setOutgoingHeight]=useState(0);
  const [systemReduced, setSystemReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  const immediate = reducedMotion || systemReduced || duration <= 0;
  /* Freeze the previously painted view. The caller may mutate its product
   * session synchronously when navigating, so mounting that old view again
   * is not a valid outgoing visual. This snapshot is inert and aria-hidden. */
  useLayoutEffect(()=>{
    if(phase==='idle' && visibleKey===viewKey && contentRef.current){
      latestMarkup.current=contentRef.current.innerHTML;
      latestHeight.current=contentRef.current.getBoundingClientRect().height;
    }
  });
  useLayoutEffect(() => {
    if (immediate) {
      setVisibleKey(viewKey);
      setPhase('idle');
      setOutgoing('');
      onSettled?.(viewKey);
      return;
    }
    if (viewKey === visibleKey) return;
    const half = Math.max(1, Math.floor(duration / 2));
    setOutgoing(latestMarkup.current);
    setOutgoingHeight(latestHeight.current);
    setPhase('out');
    const switchId = window.setTimeout(() => {
      setVisibleKey(viewKey);
      setOutgoing('');
      setPhase('in');
    }, half);
    const doneId = window.setTimeout(() => {
      setPhase('idle');
      onSettled?.(viewKey);
    }, Math.max(2, duration));
    return () => {
      window.clearTimeout(switchId);
      window.clearTimeout(doneId);
    };
    // Changes are driven by target view and settings; the midpoint update
    // must not restart the transition (visibleKey is intentionally excluded).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey, duration, immediate]);

  const style = {
    '--ba-cross-blur-amount': `${Math.max(0, Math.min(30, maxBlur))}px`,
    '--ba-cross-blur-half': `${Math.max(0, duration / 2)}ms`,
  } as CSSProperties;
  return <div className={['ba-page-transition', className].filter(Boolean).join(' ')}
    data-component="BA-WR-012" data-phase={phase}
    aria-busy={phase !== 'idle'} style={{...style,minHeight:outgoing&&phase==='out'?outgoingHeight:undefined}}>
    <div ref={contentRef} className="ba-page-transition__content">{renderView(visibleKey)}</div>
    {phase==='out'&&outgoing?<div aria-hidden="true" className="ba-page-transition__snapshot"
       dangerouslySetInnerHTML={{__html:outgoing}}/>:null}
  </div>;
}

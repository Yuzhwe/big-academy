import { useLayoutEffect, useState, type RefObject } from 'react';

/** Shared Figma selection geometry for Tabs (tabpanel) and Segmented (radio).
 * Reads actual item widths so Equal/Hug, responsive sizing and language labels work.
 */
export function useBASelectionSurface(
  root: RefObject<HTMLElement | null>,
  selectedKey: string | undefined,
  size: number,
  distribution: string,
  optionKey: string,
) {
  const [rect, setRect] = useState<{x:number;width:number}|null>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const update = () => {
      const options = element.querySelectorAll<HTMLElement>('.ba-segmented__option');
      const active = Array.from(options).find(el => el.dataset.key === selectedKey);
      const rail = element.querySelector<HTMLElement>('.ba-segmented__track');
      if (!active || !rail) { setRect(null); return; }
      const a = active.getBoundingClientRect(), b = rail.getBoundingClientRect();
      setRect({x:a.left - b.left + rail.scrollLeft + 2, width:Math.max(0,a.width - 4)});
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    for (const option of element.querySelectorAll<HTMLElement>('.ba-segmented__option')) observer?.observe(option);
    const rail = element.querySelector<HTMLElement>('.ba-segmented__track');
    rail?.addEventListener('scroll',update,{passive:true});
    return () => { rail?.removeEventListener('scroll',update); observer?.disconnect(); };
  },[root,selectedKey,size,distribution,optionKey]);
  return rect;
}

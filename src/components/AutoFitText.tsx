// Text that shrinks its font size to always fit the container width.
// Used for money amounts in stats cards on narrow phone screens.

import React, { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";

interface AutoFitTextProps {
  /** exact string to render */
  text: string;
  /** starting (design) font size in px */
  baseFontSize: number;
  /** smallest allowed font size in px */
  minFontSize?: number;
  className?: string;
  style?: CSSProperties;
}

export function AutoFitText({
  text,
  baseFontSize,
  minFontSize = 10,
  className = "",
  style,
}: AutoFitTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      let size = baseFontSize;
      el.style.fontSize = `${size}px`;
      let guard = 0;
      // shrink in 0.5px steps until the text fits or we hit the floor
      while (
        el.scrollWidth > el.clientWidth &&
        size > minFontSize &&
        guard < 100
      ) {
        size -= 0.5;
        el.style.fontSize = `${size}px`;
        guard += 1;
      }
    };

    fit();

    // refit when the container width changes (rotation, modal layout, etc.)
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => fit());
      observer.observe(el.parentElement || el);
    }
    window.addEventListener("resize", fit);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [text, baseFontSize, minFontSize]);

  return (
    <div
      ref={ref}
      className={`overflow-hidden whitespace-nowrap ${className}`}
      style={{ fontSize: baseFontSize, ...style }}
    >
      {text}
    </div>
  );
}

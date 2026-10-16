// Долгое нажатие для мыши и тача: iOS не генерирует contextmenu при долгом
// тапе, а десктопная мышь не генерирует touch-события. Pointer events
// покрывают оба случая; для старых браузеров без них — touch-фолбэк.
// Правый клик (contextmenu) продолжает работать.
import { useCallback, useRef } from "react";

const supportsPointerEvents =
  typeof window !== "undefined" && "PointerEvent" in window;

export function useLongPress(onLongPress: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (clientX: number, clientY: number, button: number) => {
      // только основная кнопка мыши / палец; правый клик — через contextmenu
      if (button !== 0) return;
      firedRef.current = false;
      startPosRef.current = { x: clientX, y: clientY };
      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress();
        // флаг нужен только чтобы погасить клик сразу после долгого нажатия
        setTimeout(() => {
          firedRef.current = false;
        }, 1200);
      }, ms);
    },
    [clear, ms, onLongPress],
  );

  const move = useCallback(
    (clientX: number, clientY: number) => {
      const startPos = startPosRef.current;
      if (!startPos) return;
      // палец/мышь ушли — это не долгое нажатие (например, начало скролла)
      if (
        Math.abs(clientX - startPos.x) > 10 ||
        Math.abs(clientY - startPos.y) > 10
      ) {
        clear();
      }
    },
    [clear],
  );

  const onPointerDown = useCallback(
    (e: { button: number; clientX: number; clientY: number }) =>
      start(e.clientX, e.clientY, e.button),
    [start],
  );
  const onPointerMove = useCallback(
    (e: { clientX: number; clientY: number }) => move(e.clientX, e.clientY),
    [move],
  );
  const onPointerUp = useCallback(() => clear(), [clear]);

  // Фолбэк для браузеров без Pointer Events (старые iOS/Safari)
  const onTouchStart = useCallback(
    (e: { touches: TouchList }) => {
      const t = e.touches[0];
      if (t) start(t.clientX, t.clientY, 0);
    },
    [start],
  );
  const onTouchMove = useCallback(
    (e: { touches: TouchList }) => {
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    },
    [move],
  );
  const onTouchEnd = useCallback(() => clear(), [clear]);

  // После сработавшего долгого нажатия гасим последующий клик,
  // чтобы не переключился сам фильтр/кнопка.
  const onClickCapture = useCallback((e: {
    preventDefault: () => void;
    stopPropagation: () => void;
  }) => {
    if (firedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const style = {
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    userSelect: "none",
    touchAction: "manipulation",
  } as const;

  if (supportsPointerEvents) {
    return {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onPointerLeave: onPointerUp,
      onClickCapture,
      style,
    };
  }
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: onTouchEnd,
    onClickCapture,
    style,
  };
}
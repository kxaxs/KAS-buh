// Долгое нажатие для тач-устройств (iOS): событие contextmenu там при
// долгом тапе не срабатывает, поэтому распознаём его через touchstart/
// touchend. Обычный короткий тап остаётся кликом, iOS-вызов меню
// (текст-селекшн) отключается через style.
import { useCallback, useRef } from "react";

export function useLongPress(onLongPress: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(() => {
    firedRef.current = false;
    clear();
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
      // флаг нужен только чтобы погасить клик сразу после долгого тапа
      setTimeout(() => {
        firedRef.current = false;
      }, 1200);
    }, ms);
  }, [clear, ms, onLongPress]);

  const onTouchEnd = useCallback(() => {
    clear();
  }, [clear]);

  const onTouchMove = useCallback(() => {
    clear();
  }, [clear]);

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

  return {
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onTouchCancel: onTouchEnd,
    onClickCapture,
    style: {
      WebkitTouchCallout: "none",
      WebkitUserSelect: "none",
      userSelect: "none",
      touchAction: "manipulation",
    } as const,
  };
}
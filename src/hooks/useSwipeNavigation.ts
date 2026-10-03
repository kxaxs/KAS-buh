// Свайп для горизонтальной листалки (месяцы/годы в календарях).
// Свайп влево (палец вправо→влево) = вперёд, свайп вправо = назад.
// Вертикальный скролл не перехватывается: срабатывает только когда
// горизонтальное движение >= 60px и заметно больше вертикального.
import { useRef } from "react";
import type { TouchEvent } from "react";

const SWIPE_MIN_DX = 60;

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
} = {}) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) startRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: TouchEvent) => {
    const s = startRef.current;
    startRef.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < SWIPE_MIN_DX) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
    // свайп распознан — не пускаем событие выше (в <main> висит
    // обработчик свайп-переключения вкладок)
    e.stopPropagation();
    if (dx < 0) onSwipeLeft?.();
    else onSwipeRight?.();
  };

  return { onTouchStart, onTouchEnd };
}

// @ts-nocheck
// Entry point for KAS-buh React App

import React, { useRef, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './index.css';
import App from './App';

// PWA: service worker регистрируется только в браузере. Внутри APK
// (Capacitor) ассеты отдаёт WebView, и SW там не нужен.
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

const SCROLL_DURATION_MS = 250;
const SAFETY_MARGIN_PX = 16;

interface ScrollConfig {
  /** IDs of inputs that should trigger scroll */
  inputIds?: string[];
  /** Ref to the scrollable container (form wrapper) */
  scrollContainerRef: React.RefObject<HTMLElement>;
  /** Ref to the element to scroll to (button) */
  targetRef: React.RefObject<HTMLElement>;
}

export function useKeyboardScroll({ scrollContainerRef, targetRef }: ScrollConfig) {
  const rafIdRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef<number>(0);

  const getKeyboardHeight = useCallback((): number => {
    const v = window.visualViewport;
    if (!v) return 0;
    // Keyboard visible when visualViewport height drops
    const heightDiff = window.innerHeight - v.height;
    return Math.max(0, heightDiff);
  }, []);

  const scrollToTarget = useCallback(() => {
    const container = scrollContainerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    isScrollingRef.current = true;
    const now = performance.now();
    lastScrollTimeRef.current = now;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const startScrollTop = container.scrollTop;
    const containerRect = container.getBoundingClientRect();
    const containerTop = containerRect.top;

    // Target element position relative to the scrollable container
    const targetRect = target.getBoundingClientRect();
    const targetTopInViewport = targetRect.top - containerTop + startScrollTop;
    const targetBottom = targetTopInViewport + target.offsetHeight;

    // How far the target is from the visible bottom of the container
    const containerVisibleBottom = container.clientHeight - 0; // padding-bottom of container
    const overflowBelow = targetBottom - containerVisibleBottom;
    const keyboardHeight = getKeyboardHeight();

    // Only scroll if target is hidden below visible area OR keyboard pushes it out
    if (overflowBelow <= 0 && keyboardHeight === 0) return;

    // Calculate desired scroll position
    const extraScroll = Math.max(0, overflowBelow);
    const targetScrollY = startScrollTop + extraScroll + keyboardHeight + SAFETY_MARGIN_PX;

    const step = (timestamp: number) => {
      if (timestamp !== lastScrollTimeRef.current) return;
      const elapsed = timestamp - now;
      const progress = Math.min(elapsed / SCROLL_DURATION_MS, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScroll = startScrollTop + (targetScrollY - startScrollTop) * eased;
      container.scrollTop = currentScroll;
      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        isScrollingRef.current = false;
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, [scrollContainerRef, targetRef, getKeyboardHeight]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Focus handler for all inputs/textareas inside the container
    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Small delay to let keyboard animation start
        setTimeout(scrollToTarget, 50);
      }
    };

    container.addEventListener('focusin', onFocus, true);
    return () => container.removeEventListener('focusin', onFocus, true);
  }, [scrollContainerRef, scrollToTarget]);

  // Handle VisualViewport resize (keyboard appearing/disappearing)
  useEffect(() => {
    if (!window.visualViewport) return;

    const onResize = () => {
      if (isScrollingRef.current) return;
      // Debounce: only scroll if keyboard height changed significantly
      setTimeout(scrollToTarget, 100);
    };

    window.visualViewport.addEventListener('resize', onResize);
    window.visualViewport.addEventListener('scroll', onResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('scroll', onResize);
    };
  }, [scrollToTarget]);
}


window.onerror = function(msg, url, line, col, error) {
  const errDiv = document.createElement('div');
  errDiv.style.padding = '20px';
  errDiv.style.background = '#8b0000';
  errDiv.style.color = 'white';
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.width = '100vw';
  errDiv.style.height = '100vh';
  errDiv.style.zIndex = '999999';
  errDiv.innerHTML = '<h1>Global Crash</h1><pre>' + msg + '\n' + (error ? error.stack : '') + '</pre>';
  document.body.appendChild(errDiv);
};

window.addEventListener('unhandledrejection', function(event) {
  const errDiv = document.createElement('div');
  errDiv.style.padding = '20px';
  errDiv.style.background = '#8b0000';
  errDiv.style.color = 'white';
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.width = '100vw';
  errDiv.style.height = '100vh';
  errDiv.style.zIndex = '999999';
  errDiv.innerHTML = '<h1>Unhandled Promise Rejection</h1><pre>' + event.reason + '</pre>';
  document.body.appendChild(errDiv);
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#333', color: 'white', minHeight: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
          <h1>React Crash</h1>
          <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            {this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

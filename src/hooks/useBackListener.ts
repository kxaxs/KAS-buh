// Android/web back-button wiring (extracted from App.tsx)

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { App as CapApp } from "@capacitor/app";
import { BACK_DEBOUNCE, setCapacitorAppRef } from "../lib/app-core";

/**
 * Listens for the hardware back button (Capacitor) or browser popstate (web)
 * and routes it to the provided handler. Handler returns true when the app
 * should exit.
 */
export function useBackListener(
  onBack: () => boolean,
  onUnmount?: () => void,
): {
  backHandlerRef: MutableRefObject<(() => boolean) | null>;
  lastPopstateAtRef: MutableRefObject<number>;
} {
  const backHandlerRef = useRef<(() => boolean) | null>(onBack);
  const lastPopstateAtRef = useRef(0);

  useEffect(() => {
    backHandlerRef.current = onBack;
  });

  useEffect(() => {
    let isNative = false;
    try {
      if ((window as any)?.Capacitor?.isNativePlatform?.()) {
        isNative = true;
      }
    } catch (e) {}

    const pushBackState = () => {
      if (!isNative) {
        window.history.pushState({ kasBack: true }, "");
      }
    };

    pushBackState();

    const handlePopState = () => {
      if (isNative) return;
      const now = Date.now();
      if (now - lastPopstateAtRef.current < BACK_DEBOUNCE) {
        pushBackState();
        return;
      }
      lastPopstateAtRef.current = now;
      const shouldExit = backHandlerRef.current?.() === true;
      if (!shouldExit) pushBackState();
    };

    if (!isNative) {
      window.addEventListener("popstate", handlePopState);
    }

    let removeCapListener: (() => void) | null = null;

    if (isNative) {
      setCapacitorAppRef(CapApp);
      const subPromise = CapApp.addListener("backButton", () => {
        const now = Date.now();
        if (now - lastPopstateAtRef.current < BACK_DEBOUNCE) return;
        lastPopstateAtRef.current = now;
        const shouldExit = backHandlerRef.current?.() === true;
        if (shouldExit) {
          CapApp.exitApp();
        }
      });
      removeCapListener = () => {
        subPromise.then((sub: any) => sub.remove?.()).catch(() => {});
      };
    }

    return () => {
      removeCapListener?.();
      if (!isNative) {
        window.removeEventListener("popstate", handlePopState);
      }
      onUnmount?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { backHandlerRef, lastPopstateAtRef };
}

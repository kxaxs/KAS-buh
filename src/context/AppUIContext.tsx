import React, { createContext, useContext } from 'react';

export const AppUIContext = createContext<any>(null);

export const useAppUI = () => {
  const ctx = useContext(AppUIContext);
  if (!ctx) throw new Error("useAppUI must be used within AppUIProvider");
  return ctx;
};

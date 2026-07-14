"use client";

import { createContext, createElement, ReactNode, useContext, useMemo } from "react";

export interface SysConfig {
  configKey: string;
  configValue: string;
}

interface SysConfigContextValue {
  configs: SysConfig[];
  loading: boolean;
  isPageEnabled: (pageKey: string, defaultValue?: boolean) => boolean;
}

const defaultValue: SysConfigContextValue = {
  configs: [],
  loading: false,
  isPageEnabled: (_pageKey, fallback = true) => fallback,
};

const SysConfigContext = createContext<SysConfigContextValue>(defaultValue);

export function SysConfigProvider({
  initialConfigs,
  children,
}: {
  initialConfigs: SysConfig[];
  children: ReactNode;
}) {
  const value = useMemo<SysConfigContextValue>(() => ({
    configs: initialConfigs,
    loading: false,
    isPageEnabled: (pageKey: string, fallback = true) => {
      const config = initialConfigs.find((item) => item.configKey === pageKey);
      return config ? config.configValue === "true" : fallback;
    },
  }), [initialConfigs]);

  return createElement(SysConfigContext.Provider, { value }, children);
}

export function useSysConfig() {
  return useContext(SysConfigContext);
}

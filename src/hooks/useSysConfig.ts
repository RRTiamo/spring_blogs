import { useState, useEffect } from "react";
import { getPublicConfig } from "@/api/config";

export interface SysConfig {
  configKey: string;
  configValue: string;
}

export function useSysConfig() {
  const [configs, setConfigs] = useState<SysConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicConfig()
      .then((res) => res.data)
      .then((data) => {
        if (data.code === 200) {
          setConfigs(data.data || []);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch public configs:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const isPageEnabled = (pageKey: string, defaultValue = true) => {
    const cfg = configs.find((c) => c.configKey === pageKey);
    if (!cfg) return defaultValue;
    return cfg.configValue === "true";
  };

  return { configs, loading, isPageEnabled };
}

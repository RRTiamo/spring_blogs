import { useState, useEffect } from "react";

export interface SysConfig {
  configKey: string;
  configValue: string;
}

export function useSysConfig() {
  const [configs, setConfigs] = useState<SysConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/config/public")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP status " + res.status);
        return res.json();
      })
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

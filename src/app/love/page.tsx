import { notFound } from "next/navigation";
import LovePageClient from "@/components/love/LovePageClient";
import { getPublicConfig } from "@/api/config";

interface PublicConfig {
  configKey: string;
  configValue: string;
}

async function getPublicConfigs(): Promise<Record<string, string>> {
  try {
    const response = await getPublicConfig();
    const payload = response.data;
    if (payload?.code === 200 && Array.isArray(payload.data)) {
      const configMap: Record<string, string> = {};
      payload.data.forEach((item: any) => {
        configMap[item.configKey] = item.configValue;
      });
      return configMap;
    }
  } catch (error) {
    console.warn("Love page config unavailable, using empty fallback.", error);
  }
  return {};
}

export default async function LovePage() {
  const configs = await getPublicConfigs();
  const enabled = configs["page.love.enable"] !== "false";

  if (!enabled) {
    notFound();
  }

  return <LovePageClient configs={configs} />;
}

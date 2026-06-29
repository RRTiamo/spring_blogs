"use client";

import FooterPeekers from "@/components/ui/FooterPeekers";
import { useSysConfig } from "@/hooks/useSysConfig";

export default function Footer() {
  const { configs } = useSysConfig();

  const getConfigValue = (key: string, defaultValue = "") => {
    const cfg = configs.find((c) => c.configKey === key);
    return cfg ? cfg.configValue : defaultValue;
  };

  const icp = getConfigValue("site.beian.icp");
  const icpUrl = getConfigValue("site.beian.icpUrl", "https://beian.miit.gov.cn/");
  const police = getConfigValue("site.beian.police");
  const policeUrl = getConfigValue("site.beian.policeUrl");

  return (
    <footer
      data-footer-peekers-anchor
      className="relative z-10 mt-auto w-full overflow-visible border-t border-charcoal/5 bg-cream-dark dark:border-white/10"
    >
      <FooterPeekers />

      <div className="relative z-[3] mx-auto max-w-5xl py-12 px-6 text-center text-[10px] leading-relaxed text-charcoal/50 dark:text-cream/40 font-sans tracking-widest space-y-4">
        {/* 1. 禅意诗句 */}
        <p className="font-serif text-sm font-semibold tracking-[0.25em] text-charcoal dark:text-cream mb-4">
          春风不解别离意，今日方知我是春。
        </p>

        {/* 2. 强力驱动与版权声明 */}
        <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-medium">
          <span>© 2026 Rrtiamo. All rights reserved.</span>
          <span className="inline-block w-1 h-1 rounded-full bg-charcoal/10 dark:bg-cream/10" />
          <span>本网站由 Spring Breeze 强力驱动</span>
        </p>

        {/* 3. 政策合规备案信息 */}
        {(icp || police) && (
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 opacity-85">
            {icp && (
              <a
                href={icpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors underline underline-offset-2"
              >
                {icp}
              </a>
            )}
            {icp && police && (
              <span className="inline-block w-1 h-1 rounded-full bg-charcoal/10 dark:bg-cream/10" />
            )}
            {police && (
              <a
                href={policeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors inline-flex items-center gap-1 underline underline-offset-2"
              >
                <span className="i-mdi-shield-check-outline text-xs"></span>
                {police}
              </a>
            )}
          </p>
        )}

        {/* 4. 免责声明与声明 */}
        <p className="opacity-60 max-w-2xl mx-auto leading-loose">
          本网站部分内容来源于网络，仅供学习与参考。本网站一切内容不代表本站立场，并不代表本站赞同其观点和对其真实性负责。
        </p>
      </div>
    </footer>
  );
}

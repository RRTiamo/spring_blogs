"use client";

import { useEffect } from "react";
import { useSysConfig } from "@/hooks/useSysConfig";

export default function ThemeApplier() {
  const { configs } = useSysConfig();

  useEffect(() => {
    function applyTheme() {
      try {
        const configMap: Record<string, string> = {};
        configs.forEach((item) => {
          configMap[item.configKey] = item.configValue;
        });

        // 检查是否启用了自定义主题
        if (configMap["page.theme.enabled"] !== "true") {
          const oldStyle = document.getElementById("custom-theme-style");
          if (oldStyle) oldStyle.remove();
          return;
        }

        const getValidVal = (key: string, fallback: string) => {
          const val = configMap[key];
          if (!val) return fallback;
          const lower = val.trim().toLowerCase();
          if (lower === "null" || lower === "undefined" || lower === "none" || lower === "") {
            return fallback;
          }
          return val;
        };

        // 提取亮色配置 (未配置则退回到默认系统色值)
        const accent = getValidVal("page.theme.accentColor", "#D9865F");
        const accentSoft = getValidVal("page.theme.accentSoftColor", "#F1B894");
        const bg = getValidVal("page.theme.bgColor", "#F7F8F1");
        const bgSoft = getValidVal("page.theme.bgSoftColor", "#EAF0E5");

        // 提取暗色配置
        const darkAccent = getValidVal("page.theme.darkAccentColor", "#F1A77C");
        const darkAccentSoft = getValidVal("page.theme.darkAccentSoftColor", "#F5C6A8");
        const darkBg = getValidVal("page.theme.darkBgColor", "#17211B");
        const darkBgSoft = getValidVal("page.theme.darkBgSoftColor", "#203027");

        // 其它外观配置
        const grainOpacity = configMap["page.theme.grainOpacity"] || "3.8";
        const glowsEnabled = configMap["page.theme.glowsEnabled"] === "true";
        const bgImageUrl = configMap["page.theme.bgImageUrl"] || "";
        const bgImageStyle = configMap["page.theme.bgImageStyle"] || "cover";
        const bgImageBlur = configMap["page.theme.bgImageBlur"] || "0";
        const bgImageOpacity = configMap["page.theme.bgImageOpacity"] || "10";
        const darkBgImageOpacity = configMap["page.theme.darkBgImageOpacity"] || "5";
        const customCss = configMap["page.theme.customCss"] || "";

        // 构造覆盖 CSS
        let css = `
          /* 覆盖系统自带的 5 种风格变量以实现全主题同步 */
          :root, 
          .style-life, 
          .style-swiss, 
          .style-minimalist, 
          .style-glass, 
          .style-brutalist {
            --accent-color: ${accent} !important;
            --accent-light-color: ${accentSoft} !important;
            --bg-color: ${bg} !important;
            --bg-dark-color: ${bgSoft} !important;
          }

          .dark, 
          .dark.style-life, 
          .dark.style-swiss, 
          .dark.style-minimalist, 
          .dark.style-glass, 
          .dark.style-brutalist {
            --accent-color: ${darkAccent} !important;
            --accent-light-color: ${darkAccentSoft} !important;
            --bg-color: ${darkBg} !important;
            --bg-dark-color: ${darkBgSoft} !important;
          }
        `;

        // 噪点图层透明度覆盖
        const opacityVal = parseFloat(grainOpacity) / 100;
        // 暗模式下，噪点常态较小，等比缩小为 0.63 倍，以防暗处噪点过于违和；同时确保亮/暗模式在用户调节后按比例同步
        const darkOpacityVal = opacityVal * 0.63;
        css += `
          .film-grain {
            opacity: ${opacityVal} !important;
          }
          .dark .film-grain {
            opacity: ${darkOpacityVal} !important;
          }
        `;

        // 霓虹背光发光层
        if (glowsEnabled) {
          css += `
            .glass-glows {
              opacity: 1 !important;
            }
          `;
        } else {
          css += `
            .glass-glows {
              opacity: 0 !important;
            }
          `;
        }

        // 高定背景图覆盖
        if (bgImageUrl) {
          let backgroundStyleCss = '';
          if (bgImageStyle === 'tile') {
            backgroundStyleCss = `
              background-size: auto !important;
              background-repeat: repeat !important;
              background-position: top left !important;
            `;
          } else if (bgImageStyle === 'contain') {
            backgroundStyleCss = `
              background-size: contain !important;
              background-repeat: no-repeat !important;
              background-position: center !important;
            `;
          } else {
            // default 'cover'
            backgroundStyleCss = `
              background-size: cover !important;
              background-repeat: no-repeat !important;
              background-position: center !important;
            `;
          }

          css += `
            .bg-image-layer {
              background-image: url('${bgImageUrl}') !important;
              filter: blur(${bgImageBlur}px) !important;
              opacity: ${parseFloat(bgImageOpacity) / 100} !important;
              ${backgroundStyleCss}
            }
            .dark .bg-image-layer {
              opacity: ${parseFloat(darkBgImageOpacity) / 100} !important;
            }
          `;
        }

        // 自定义 CSS 拼接
        if (customCss) {
          css += `\n/* Custom User Style Inject */\n${customCss}`;
        }

        // 查找或创建 Style 节点
        let styleElement = document.getElementById("custom-theme-style");
        if (!styleElement) {
          styleElement = document.createElement("style");
          styleElement.id = "custom-theme-style";
          document.head.appendChild(styleElement);
        }
        styleElement.innerHTML = css;

      } catch (error) {
        console.warn("主题配置格式无效:", error instanceof Error ? error.message : "unknown error");
      }
    }

    applyTheme();
  }, [configs]);

  return null;
}

import * as OpenCC from 'opencc-js';

const converterHK = OpenCC.Converter({ from: 'hk', to: 'cn' });
const converterTW = OpenCC.Converter({ from: 'tw', to: 'cn' });

/**
 * 工业级 OpenCC 繁简转换器
 * 全量覆盖香港繁体(HK)、台湾繁体(TW)到大陆简体(CN)的词汇与文字转换
 */
export function toSimplifiedChinese(text: string): string {
  if (!text) return '';
  try {
    const resHK = converterHK(text);
    return converterTW(resHK);
  } catch {
    return text;
  }
}

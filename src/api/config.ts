import request, { getServerApiURL } from './request'
import { cache } from 'react'

export interface PublicConfigItem {
  configKey: string
  configValue: string
}

export function getPublicConfig() {
  return request.get('/config/public')
}

export async function fetchPublicConfigForServer(init?: Parameters<typeof fetch>[1]) {
  try {
    const response = await fetch(getServerApiURL('/config/public'), {
      ...init,
      // 容错超时防刷屏
      signal: AbortSignal.timeout(3000)
    })
    if (!response.ok) {
      return { code: response.status, data: [] }
    }
    return await response.json()
  } catch {
    // 静默兜底，避免打印庞大的 Socket 异常日志
    return { code: 500, data: [] }
  }
}

export const getPublicConfigSnapshot = cache(async (): Promise<PublicConfigItem[]> => {
  const payload = await fetchPublicConfigForServer({ next: { revalidate: 10 } })
  if (payload.code !== 200 || !Array.isArray(payload.data)) return []
  return payload.data.filter((item: unknown): item is PublicConfigItem => {
    if (!item || typeof item !== 'object') return false
    const candidate = item as Partial<PublicConfigItem>
    return typeof candidate.configKey === 'string' && typeof candidate.configValue === 'string'
  })
})

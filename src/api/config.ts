import request, { getServerApiURL } from './request'

export function getPublicConfig() {
  return request.get('/config/public')
}

export async function fetchPublicConfigForServer(init?: Parameters<typeof fetch>[1]) {
  const response = await fetch(getServerApiURL('/config/public'), init)
  return response.json()
}

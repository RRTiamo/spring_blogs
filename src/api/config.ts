import request from './request'

export function getPublicConfig() {
  return request.get('/config/public')
}

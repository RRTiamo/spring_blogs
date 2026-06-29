import request from './request'

export function getAchievementsList() {
  return request.get('/achievements/list')
}

export function getAchievementMetasList() {
  return request.get('/achievement-metas/list')
}

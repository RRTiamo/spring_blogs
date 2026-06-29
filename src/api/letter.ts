import request from './request'

export function getTimeLetterList() {
  return request.get('/time-letter/list')
}

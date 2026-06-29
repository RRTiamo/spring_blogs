import request from './request'

export function getLoveList() {
  return request.get('/love/list')
}

export function getLoveBucketList() {
  return request.get('/love/bucket/list')
}

export function getLoveCapsuleList() {
  return request.get('/love/capsule/list')
}

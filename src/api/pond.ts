import request from './request'

export function getFeedbackList(params: { page: number; pageSize: number; category: string }) {
  return request.get('/pond/feedback', { params })
}

export function createFeedback(payload: any) {
  return request.post('/pond/feedback', payload)
}

export function likeFeedback(id: number | string) {
  return request.post(`/pond/feedback/${id}/like`)
}

export function getFeedbackTypes() {
  return request.get('/pond/feedback-type/list')
}

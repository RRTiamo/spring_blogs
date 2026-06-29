import request from './request'

export function getNotesList() {
  return request.get('/notes/list')
}

export function createNote(payload: any) {
  return request.post('/notes/create', payload)
}

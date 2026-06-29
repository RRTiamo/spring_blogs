import request from './request'

export function getBlogsList() {
  return request.get('/blogs/list')
}

export function getBlogDetailBySlug(slug: string) {
  return request.get(`/blogs/detail/by-slug/${slug}`)
}

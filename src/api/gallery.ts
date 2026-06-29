import request from './request'

export function getGalleryList() {
  return request.get('/gallery/list')
}

export function getFootprintCategoryList() {
  return request.get('/footprint-category/list')
}

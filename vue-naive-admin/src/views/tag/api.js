import { request } from '@/utils'
export default {
  getTagList: (data) => request.post('/system/tag/list', data),
  editTagById: (data) => request.post(`/system/tag/editTagById`, data),
  deleteTagById: (ids) => {
    if (typeof ids === 'number') {
      ids = ids + ''
    }
    return request.get('/system//tag/deleteTagByIds', { params: { ids: ids } })
  },
  addTag: (data) => request.post(`/system/tag/add`, data),
}

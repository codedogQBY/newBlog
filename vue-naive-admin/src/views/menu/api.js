import { request } from '@/utils'

export default {
  getMenuList: (data) => request.post('/system/menu/list', data),
  editMenuById: (data) => request.post(`/system/menu/edit`, data),
  deleteMenuById: (ids) => {
    if (typeof ids === 'number') {
      ids = ids + ''
    }
    return request.get('/system/menu/delete', { params: { ids: ids } })
  },
  addMenu: (data) => request.post(`/system/menu/add`, data),
  getMenuMap: () => request.get('/system/menu/getMenuMap'),
}

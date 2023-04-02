import { request } from '@/utils'

export default {
  getRoleList: (data) => request.post('/system/role/list', data),
  editRoleById: (data) => request.post(`/system/role/edit`, data),
  deleteRoleById: (ids) => {
    if (typeof ids === 'number') {
      ids = ids + ''
    }
    return request.get('/system/role/delete', { params: { ids: ids } })
  },
  addRole: (data) => request.post(`/system/role/add`, data),
  getRoleMap: () => request.get('/system/role/getRoleMap'),
  editPermission: (data) => request.post('/system/role/editPermission', data),
}

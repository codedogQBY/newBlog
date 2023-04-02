import { request } from '@/utils'

export default {
  getUserList: (data) => request.post('/system/user/list', data),
  editUserById: (data) => request.post(`/system/user/editUserById`, data),
  deleteUserById: (ids) => {
    if (typeof ids === 'number') {
      ids = ids + ''
    }
    return request.get('/system/user/deleteUserByIds', { params: { ids: ids } })
  },
  addUser: (data) => request.post(`/system/user/add`, data),
}

import { request } from '@/utils'

export default {
  getUserInfo: () => request.get('/system/user/getUserInfo'),
  editInfo: (data) => request.post(`/system/user/editInfo`, data),
  editPasswordEmail: (data) => request.post(`/system/menu/add`, data),
  editPassword: (data) => request.get('/system/menu/getMenuMap', data),
}

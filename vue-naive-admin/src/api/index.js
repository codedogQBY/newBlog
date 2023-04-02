import { request } from '@/utils'

export default {
  getUser: () => request.get('/system/user/query'),
  getUserMenu: () => request.post('/system/user/getUserMenu'),
  getRoleMap: () => request.get('/system/role/getRoleMap'),
  refreshToken: () => request.post('/system/auth/refreshToken', null, { noNeedTip: true }),
  uploadImg: (data) => request.post('/system/common/upload/img', data),
}

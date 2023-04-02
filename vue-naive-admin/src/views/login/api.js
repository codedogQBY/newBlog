import { request } from '@/utils'

export default {
  login: (data) => request.post('/system/auth/login', data, { noNeedToken: true }),
}

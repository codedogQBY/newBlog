import { request } from '@/utils'

export default {
  getErrorList: (data) => request.post('/monitor/getErrorList', data),
  getRecordScreenById: (id) => request.get('/monitor/getRecordScreenById', { params: { id } }),
}

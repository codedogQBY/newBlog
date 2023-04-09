import { request } from '@/utils'

export default {
  getAnswer: (data) => request.post('/common/chatgpt/answer', data),
}

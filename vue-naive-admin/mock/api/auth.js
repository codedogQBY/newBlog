import { resolveToken } from '../utils'

const token = {
  admin: 'admin',
  editor: 'editor',
}

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }) => {
      if (['admin', 'editor'].includes(body?.userName)) {
        return {
          code: 0,
          data: {
            token: token[body.userName],
          },
        }
      } else {
        return {
          code: -1,
          message: '没有此用户',
        }
      }
    },
  },
  {
    url: '/api/auth/refreshToken',
    method: 'post',
    response: ({ headers }) => {
      return {
        code: 0,
        data: {
          token: resolveToken(headers?.authorization),
        },
      }
    },
  },
]

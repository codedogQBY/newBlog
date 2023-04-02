const Layout = () => import('@/layout/index.vue')

export const basicRoutes = [
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    isHidden: true,
  },

  {
    name: '500',
    path: '/500',
    component: () => import('@/views/error-page/500.vue'),
    isHidden: true,
  },

  {
    name: '403',
    path: '/403',
    component: () => import('@/views/error-page/403.vue'),
    isHidden: true,
  },

  {
    name: 'Login',
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    isHidden: true,
    meta: {
      title: '登录页',
    },
  },
  {
    name: 'Workbench',
    path: '/',
    component: Layout,
    redirect: '/workbench',
    serialNum: 0,
    children: [
      {
        name: 'Workbench',
        path: 'workbench',
        component: () => import('@/views/workbench/index.vue'),
        meta: {
          title: '个人工作台',
          icon: 'mdi:home',
          serialNum: 0,
        },
      },
    ],
  },
]

export const NOT_FOUND_ROUTE = {
  name: 'NotFound',
  path: '/:pathMatch(.*)*',
  redirect: '/404',
  isHidden: true,
}

export const EMPTY_ROUTE = {
  name: 'Empty',
  path: '/:pathMatch(.*)*',
  component: null,
}

import { defineStore } from 'pinia'
import { basicRoutes } from '@/router/routes'
import { useUserStore } from '@/store'
import { markRaw } from 'vue'

const Layout = () => import('@/layout/index.vue')

function hasPermission(route, role) {
  // * 不需要权限直接返回true
  if (!route.meta?.requireAuth) return true

  const routeRole = route.meta?.role ? route.meta.role : []

  // * 登录用户没有角色或者路由没有设置角色判定为没有权限
  if (!role.length || !routeRole.length) return false

  // * 路由指定的角色包含任一登录用户角色则判定有权限
  return role.some((item) => routeRole.includes(item))
}

function filterAsyncRoutes(routes = [], role) {
  const ret = []
  routes.forEach((route) => {
    if (hasPermission(route, role)) {
      const curRoute = {
        ...route,
        children: [],
      }
      if (route.children && route.children.length) {
        curRoute.children = filterAsyncRoutes(route.children, role)
      } else {
        Reflect.deleteProperty(curRoute, 'children')
      }
      ret.push(curRoute)
    }
  })
  return ret
}

const generator = (constantRouterComponents, routerMap, parent) => {
  return routerMap.map((item) => {
    const { component, meta, key, permission, type, serialNum } = item
    const { title, show, hideChildren, hiddenHeaderContent, icon } = meta
    const currentRouter = {
      // 如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/my-dashboard
      path: item.path || `${parent?.path || ''}/${key}`,
      // 路由名称，建议唯一
      name: item?.path?.replace('/', ''),
      // 该路由对应页面的组件
      component: constantRouterComponents[component],
      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title,
        icon,
        hiddenHeaderContent,
        permission,
        type,
        actions: (item.children || []).filter((action) => action.type === 3),
      },
      // 是否设置了隐藏菜单
      hidden: show === false,
      // 是否设置了隐藏子菜单
      hideChildrenInMenu: !!hideChildren,
      children: [],
      redirect: '',
      serialNum,
    }
    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/')
    }
    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      currentRouter.children = generator(constantRouterComponents, item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 数组转树形结构
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
function listToTree(list, tree, parentId) {
  list.forEach((item) => {
    // 判断是否为父级菜单
    if (item.parentId === parentId) {
      const child = {
        ...item,
        id: item.id,
        key: item.id || item.name,
        children: [],
        serialNum: item.serialNum,
        parentId: item.parentId,
      }
      // 迭代 list， 找到当前菜单相符合的所有子菜单
      listToTree(list, child.children, item.id)
      // 加入到树中
      tree.push(child)
    }
  })
}

export const usePermissionStore = defineStore('permission', {
  state() {
    return {
      accessRoutes: [],
      constantRouterComponents: {},
    }
  },
  getters: {
    routes() {
      return basicRoutes.concat(this.accessRoutes)
    },
    menus() {
      return this.routes.filter((route) => route.name && !route.isHidden)
    },
  },
  actions: {
    generateRoutes(role = []) {
      const userStore = useUserStore()
      const page = import.meta.glob('@/views/**/*.vue', { eager: true })
      const constantRouterComponents = {
        Layout: markRaw(Layout),
      }
      Object.keys(page).forEach((key) => {
        const file = page[key].default
        if (file.isPage) {
          constantRouterComponents[file.name] = () => import(key)
        }
      })
      const userMenu = userStore.menu
      const nav = []
      // 后端数据, 根级树数组,  根级 PID
      listToTree(userMenu, nav, 0)
      const routers = generator(constantRouterComponents, nav)
      this.accessRoutes = routers
      return this.accessRoutes
    },
    resetPermission() {
      this.$reset()
    },
  },
})

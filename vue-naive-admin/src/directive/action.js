import { useUserStore } from '@/store'

/**
 * Action 权限指令
 * 指令用法：
 *  - 在需要控制 action 级别权限的组件上使用 v-action="[methods]" , 如下：
 *    <i-button v-action="system:menu:add" >添加用户</a-button>
 *    <a-button v-action="system:menu:delete">删除用户</a-button>
 *    <a v-action="system:menu:edit" @click="edit(record)">修改</a>
 *
 *  - 当前用户没有权限时，组件上使用了该指令则会被隐藏
 *  - 当后台权限跟 pro 提供的模式不同时，只需要针对这里的权限过滤进行修改即可
 *
 */
const directive = {
  mounted: (el, binding) => {
    // string  object
    const item = binding.value || binding.value
    let actionName = ''
    let action = 'display'
    const userStore = useUserStore()
    const role = userStore.roles
    const permissions = role.permissions || []
    const actions = permissions.reduce((allActions, permission) => {
      allActions.push(...permission.actions)
      return allActions
    }, [])
    if (typeof item === 'string') {
      actionName = item
    } else if (typeof item === 'object') {
      actionName = item.name
      action = item.action || action
    }
    if (!actions.find((action) => action.permission === actionName) && actionName !== '*:*:*') {
      if (action === 'display') {
        ;(el.parentNode && el.parentNode.removeChild(el)) || (el.style.display = 'none')
      } else if (action === 'disabled') {
        el.setAttribute('disabled', true)
      }
    }
  },
}

export default function initAction(app) {
  app.directive('action', directive)
}

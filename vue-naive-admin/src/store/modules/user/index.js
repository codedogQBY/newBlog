import { defineStore } from 'pinia'
import { resetRouter } from '@/router'
import { usePermissionStore, useTagsStore } from '@/store'
import { removeToken, toLogin } from '@/utils'
import api from '@/api'

export const useUserStore = defineStore('user', {
  state() {
    return {
      userInfo: {},
      menu: [],
      roles: {},
    }
  },
  getters: {
    userId() {
      return this.userInfo?.id || 0
    },
    name() {
      return this.userInfo?.userName
    },
    avatar() {
      return this.userInfo?.info?.avatar
    },
    nickName() {
      return this.userInfo?.info?.nickName
    },
    profile() {
      return this.userInfo?.info?.profile
    },
    role() {
      return this.userInfo?.role
    },
  },
  actions: {
    async getUserInfo() {
      try {
        const res = await api.getUser()
        const { email, info, role, userName } = res.data
        this.userInfo = { email, info, userName }
        this.roles = role
        return Promise.resolve(res.data)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async getUserMenu() {
      try {
        const res = await api.getUserMenu()
        const menu = res.data
        this.menu = menu
        return Promise.resolve(res.data)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    async logout() {
      const { resetTags } = useTagsStore()
      const { resetPermission } = usePermissionStore()
      removeToken()
      resetTags()
      resetPermission()
      resetRouter()
      this.$reset()
      toLogin()
    },
    setUserInfo(userInfo = {}) {
      this.userInfo = { ...this.userInfo, ...userInfo }
    },
  },
})

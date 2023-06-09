<template>
  <AppPage :show-footer="true" bg-cover :style="{ backgroundImage: `url(${bgImg})` }">
    <div
      style="transform: translateY(25px)"
      class="m-auto p-15 f-c-c min-w-345 max-w-700 rounded-10 card-shadow bg-white bg-opacity-60"
    >
      <div w-380 hidden md:block px-20 py-35>
        <img src="@/assets/images/login_banner.webp" w-full alt="login_banner" />
      </div>

      <div w-320 flex-col px-20 py-35>
        <h5 f-c-c text-24 font-normal color="#6a6a6a">
          <icon-custom-logo mr-10 text-50 color-primary />
          {{ title }}
        </h5>
        <div mt-30>
          <n-input
            v-model:value="loginInfo.userName"
            autofocus
            class="text-16 items-center h-50 pl-10"
            placeholder="admin"
            :maxlength="20"
          />
        </div>
        <div mt-30>
          <n-input
            v-model:value="loginInfo.password"
            class="text-16 items-center h-50 pl-10"
            type="password"
            show-password-on="mousedown"
            placeholder="123456"
            :maxlength="20"
          />
        </div>
        <div mt-30 flex>
          <n-input
            v-model:value="loginInfo.code"
            class="text-16 items-center h-50 pl-10 mr-30"
            show-password-on="mousedown"
            placeholder="请输入验证码"
            :maxlength="20"
            @keydown.enter="handleLogin"
          />
          <img cursor-pointer :src="code" @click="handleUpdateCode" />
        </div>
        <div mt-20>
          <n-checkbox :checked="isRemember" label="记住我" :on-update:checked="(val) => (isRemember = val)" />
        </div>

        <div mt-20>
          <n-button w-full h-50 rounded-5 text-16 type="primary" :loading="loading" @click="handleLogin">
            登录
          </n-button>
        </div>
      </div>
    </div>
  </AppPage>
</template>

<script setup>
import { lStorage, setToken } from '@/utils'
import { useStorage } from '@vueuse/core'
import bgImg from '@/assets/images/login_bg.webp'
import api from './api'
import { addDynamicRoutes } from '@/router'
import md5 from 'md5'

const title = import.meta.env.VITE_TITLE

const router = useRouter()
const { query } = useRoute()

const loginInfo = ref({
  userName: '',
  password: '',
  code: '',
})

initLoginInfo()

function initLoginInfo() {
  const localLoginInfo = lStorage.get('loginInfo')
  if (localLoginInfo) {
    loginInfo.value.userName = localLoginInfo.userName || ''
    loginInfo.value.password = localLoginInfo.password || ''
  }
}

const isRemember = useStorage('isRemember', false)
const loading = ref(false)

async function handleLogin() {
  const { userName, password, code } = loginInfo.value
  if (!userName || !password) {
    $message.warning('请输入用户名和密码')
    return
  }
  try {
    loading.value = true
    $message.loading('正在验证...')
    const res = await api.login({ userName, password: md5(password.toString()), code })
    $message.success('登录成功')
    setToken(res.data)
    if (isRemember.value) {
      lStorage.set('loginInfo', { userName, password })
    } else {
      lStorage.remove('loginInfo')
    }
    await addDynamicRoutes()
    if (query.redirect) {
      const path = query.redirect
      Reflect.deleteProperty(query, 'redirect')
      router.push({ path, query })
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error(error)
    $message.removeMessage()
  }
  loading.value = false
}

const getCode = () => `/api/system/common/code?v=${Math.random()}`
const code = ref(getCode())

function handleUpdateCode() {
  code.value = getCode()
}
</script>

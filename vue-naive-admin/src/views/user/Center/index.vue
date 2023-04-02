<template>
  <AppPage :show-footer="true">
    <n-grid cols="3" :x-gap="24" item-responsive>
      <n-gi span="1">
        <n-card rounded-10>
          <div justify-center flex mb-20>
            <img rounded-20 width="72" :src="userStore.avatar" />
          </div>
          <div justify-center flex mb-20 font-600 text-18 color-primary>
            <span>{{ userStore.nickName }}</span>
          </div>
          <div justify-center flex mb-10>
            <span>{{ userStore.profile }}</span>
          </div>
        </n-card>
      </n-gi>
      <n-gi span="2">
        <n-card rounded-10>
          <n-tabs
            class="card-tabs"
            default-value="info"
            size="large"
            animated
            style="margin: 0 -4px"
            pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
          >
            <n-tab-pane name="info" tab="基本信息">
              <n-grid cols="8" :x-gap="24" item-responsive>
                <n-gi span="6" :offset="1">
                  <n-form
                    ref="infoFormRef"
                    :rules="inFormRule"
                    label-placement="left"
                    label-align="left"
                    :label-width="80"
                    :model="infoForm"
                  >
                    <n-form-item path="avatar">
                      <n-upload
                        action="/api/system/common/upload/img"
                        :headers="{
                          Authorization: getToken(),
                        }"
                        :custom-request="customRequest"
                        list-type="image-card"
                        :max="1"
                        accept="image"
                        :default-file-list="[
                          {
                            id: 'image',
                            name: 'avatar',
                            status: 'finished',
                            url: infoForm.avatar,
                          },
                        ]"
                      ></n-upload>
                    </n-form-item>
                    <n-form-item label="昵称" path="nickName">
                      <n-input v-model:value="infoForm.nickName" placeholder="请输入昵称" />
                    </n-form-item>
                    <n-form-item label="简介" path="profile">
                      <n-input v-model:value="infoForm.profile" type="textarea" placeholder="请输入简介" />
                    </n-form-item>
                    <n-form-item>
                      <n-button type="primary" @click="saveInfo">保 存</n-button>
                    </n-form-item>
                  </n-form>
                </n-gi>
              </n-grid>
            </n-tab-pane>
            <n-tab-pane name="password" tab="修改密码">
              <n-grid cols="8" :x-gap="24" item-responsive>
                <n-gi span="6" :offset="1">
                  <n-form
                    :rules="passwordFormRule"
                    label-placement="left"
                    label-align="left"
                    :label-width="120"
                    :model="passwordForm"
                  >
                    <n-form-item label="旧密码" path="oldPassword">
                      <n-input
                        v-model:value="passwordForm.oldPassword"
                        class="items-center h-30 pl-10"
                        type="password"
                        placeholder="请输入旧密码"
                      />
                    </n-form-item>
                    <n-form-item label="新密码" path="password">
                      <n-input
                        v-model:value="passwordForm.password"
                        class="items-center h-30 pl-10"
                        type="password"
                        placeholder="请输入新密码"
                      />
                    </n-form-item>
                    <n-form-item class="flex mb-20" label="验证码" path="code">
                      <n-input
                        v-model:value="passwordForm.code"
                        class="items-center h-30 pl-10 mr-30"
                        placeholder="请输入验证码"
                      />
                      <img h-35 cursor-pointer :src="code" @click="handleUpdateCode" />
                    </n-form-item>
                    <n-form-item label="邮箱验证码" path="emailCode">
                      <n-input
                        v-model:value="passwordForm.emailCode"
                        class="items-center h-30 pl-10 mr-30"
                        placeholder="请输入邮箱验证码"
                      />
                      <n-button>发送验证码</n-button>
                    </n-form-item>
                    <n-form-item>
                      <n-button rounded-5 text-16 type="primary">保 存</n-button>
                    </n-form-item>
                  </n-form>
                </n-gi>
              </n-grid>
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-gi>
    </n-grid>
  </AppPage>
</template>

<script setup>
import { useUserStore } from '@/store'
import { getToken } from '@/utils'
import { ref } from 'vue'
import commonApi from '@/api/index'
import { useMessage } from 'naive-ui'
import api from './api'

defineOptions({ name: 'UserCenter', isPage: true, src: '@/views/user/Center/index.vue' })

const userStore = useUserStore()
const message = useMessage()
const infoFormRef = ref(null)
const { avatar, nickName, profile } = userStore
const infoForm = ref({
  avatar,
  nickName,
  profile,
})

const passwordForm = ref({
  oldPassword: '',
  password: '',
  cpde: '',
  emailCode: '',
})
const saveInfo = async () => {
  const isValidate = await validateForm(infoFormRef)
  if (isValidate) {
    const res = await api.editInfo(infoForm.value)
    if (!!res.data) {
      message.success(res?.msg)
      await userStore.getUserInfo()
    } else {
      message.error(res?.msg)
    }
  }
}

const savePassword = () => {}

const validateForm = (formRef) => {
  return new Promise((resolve, reject) => {
    formRef.value?.validate((errors) => {
      if (!errors) {
        resolve(true)
      } else {
        reject(false)
        message.error('保存信息失败')
      }
    })
  })
}

const inFormRule = {
  nickName: [
    {
      required: true,
      validator(rule, value) {
        if (!value) {
          return new Error('请输入昵称')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],

  avatar: [
    {
      required: true,
      message: '请上传头像',
      validator(rule, value) {
        if (!value) {
          return new Error('请上传头像')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
  profile: [
    {
      required: true,
      message: '请输入简介',
      trigger: ['input', 'blur'],
    },
  ],
}
const passwordFormRule = {
  oldPassword: [
    {
      required: true,
      message: '请输入旧密码',
      trigger: ['input', 'blur'],
    },
  ],
  password: [
    {
      required: true,
      message: '请输入新密码',
      trigger: ['input', 'blur'],
    },
  ],
  code: [
    {
      required: true,
      message: '请输入图形验证码',
      trigger: ['input', 'blur'],
    },
  ],
  emailCode: [
    {
      required: true,
      message: '请输入邮箱验证码',
      trigger: ['input', 'blur'],
    },
  ],
}

// 自定义上传
const customRequest = ({ file, data, onFinish, onError }) => {
  const formData = new FormData()
  if (data) {
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })
  }
  formData.append(file.name, file.file)
  commonApi
    .uploadImg(formData)
    .then((res) => {
      const data = res.data
      infoForm.value.avatar = data.path
    })
    .catch((err) => {
      onError()
    })
}

const getCode = () => `/api/system/common/code?v=${Math.random()}`
const code = ref(getCode())

function handleUpdateCode() {
  code.value = getCode()
}
</script>

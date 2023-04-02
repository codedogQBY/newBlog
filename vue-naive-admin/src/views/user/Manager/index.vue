<template>
  <CommonPage show-footer title="用户管理">
    <template #action>
      <div>
        <n-button v-action="'system:user:add'" type="primary" class="mr-10" @click="handleAdd">
          <TheIcon icon="material-symbols:add" :size="18" class="mr-5" />
          新增用户
        </n-button>
        <n-button v-action="'system:user:delete'" type="error" class="mr-10" @click="handleDeleteByIds">
          <TheIcon icon="material-symbols:delete-outline-sharp" :size="18" class="mr-5" />
          批量删除
        </n-button>
      </div>
    </template>

    <CrudTable
      ref="$table"
      v-model:query-items="queryItems"
      :extra-params="extraParams"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.getUserList"
      @on-checked="onChecked"
    >
      <template #queryBar>
        <QueryBarItem label="用户名" :label-width="50">
          <n-input
            v-model:value="queryItems.params.name"
            type="text"
            placeholder="请输入用户名"
            @keydown.enter="$table?.handleSearch"
          />
        </QueryBarItem>
      </template>
    </CrudTable>

    <!-- 新增/编辑/查看 -->
    <CrudModal
      v-model:visible="modalVisible"
      :title="modalTitle"
      :loading="modalLoading"
      :show-footer="modalAction !== 'view'"
      @on-save="handleSave"
    >
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
        :rules="rules"
      >
        <n-form-item v-if="modalAction !== 'edit'" label="用户名" path="userName">
          <n-input v-model:value="modalForm.userName" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item label="昵称" path="nickName">
          <n-input v-model:value="modalForm.nickName" placeholder="请输入昵称" />
        </n-form-item>
        <n-form-item label="角色" path="roleIds">
          <n-tree-select
            v-model:value="modalForm.roleIds"
            placeholder="请选择角色"
            multiple
            :options="roleOption"
            label-field="name"
            key-field="id"
            children-field="children"
          />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="modalForm.email" placeholder="请输入邮箱" />
        </n-form-item>
        <n-form-item v-if="modalAction === 'add'" label="密码" path="password">
          <n-input v-model:value="modalForm.password" type="password" placeholder="请输入密码" />
        </n-form-item>
        <n-form-item label="头像" path="avatar">
          <n-upload
            action="/api/system/common/upload/img"
            :headers="{
              Authorization: getToken(),
            }"
            :custom-request="customRequest"
            list-type="image-card"
            :max="1"
            accept="image"
            :default-file-list="
              modalForm.avatar
                ? [
                    {
                      id: 'image',
                      name: 'avatar',
                      status: 'finished',
                      url: modalForm.avatar,
                    },
                  ]
                : []
            "
          ></n-upload>
        </n-form-item>
        <n-form-item label="简介" path="profile">
          <n-input v-model:value="modalForm.profile" type="textarea" placeholder="请输入简介" />
        </n-form-item>
      </n-form>
    </CrudModal>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, useMessage } from 'naive-ui'
import { onMounted, ref, resolveDirective, watch, withDirectives } from 'vue'
import api from './api'
import commonApi from '@/api/index'
import { useCRUD } from '@/composables'
import { getToken, renderIcon } from '@/utils'
import md5 from 'md5'
import TheIcon from '@/components/icon/TheIcon.vue'

defineOptions({ name: 'UserManager', isPage: true })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({ params: { name: '' } })
/** 补充参数（可选） */
const extraParams = ref({})
const roleOption = ref([])
const selectIds = ref('')
const message = useMessage()

const rules = {
  userName: [
    {
      required: true,
      message: '请输入用户名',
      trigger: ['input', 'blur'],
    },
  ],
  roleIds: [
    {
      required: true,
      message: '角色不能为空',
      validator(rule, value) {
        if (!value || !value?.length) {
          return new Error('角色不能为空')
        }
        return true
      },
      trigger: ['input', 'blur'],
    },
  ],
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
  email: [
    {
      required: true,
      validator(rule, value) {
        if (!value) {
          return new Error('请输入邮箱')
        } else if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
          return new Error('请输入符合格式的邮箱')
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
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: ['input', 'blur'],
    },
  ],
}
const columns = [
  { type: 'selection', fixed: 'left' },
  {
    title: '昵称',
    key: 'nickName',
    width: 80,
    render(row) {
      return h('span', row['nickName'])
    },
  },
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render(row) {
      return h(NAvatar, {
        size: 64,
        src: row['avatar'],
      })
    },
  },
  { title: '用户名', key: 'userName', width: 80 },
  { title: '邮箱', key: 'email', width: 80 },
  { title: '角色', key: 'roleNames', width: 80 },
  { title: '更新时间', key: 'updatedAt', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'center',
    fixed: 'right',
    render(row) {
      return [
        withDirectives(
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              secondary: true,
              onClick: () => handleView(row),
            },
            { default: () => '查看', icon: renderIcon('majesticons:eye-line', { size: 14 }) }
          ),
          [[resolveDirective('action'), 'system:user:query']]
        ),
        withDirectives(
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              style: 'margin-left: 15px;',
              onClick: () => handleEdit(row),
            },
            { default: () => '编辑', icon: renderIcon('material-symbols:edit-outline', { size: 14 }) }
          ),
          [[resolveDirective('action'), 'system:user:edit']]
        ),
        withDirectives(
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              style: 'margin-left: 15px;',
              vAction: 'system:user:delete',
              onClick: () => handleDelete(row.id),
            },
            { default: () => '删除', icon: renderIcon('material-symbols:delete-outline', { size: 14 }) }
          ),
          [[resolveDirective('action'), 'system:user:delete']]
        ),
      ]
    },
  },
]
onMounted(() => {
  $table.value?.handleSearch()
  commonApi.getRoleMap().then((res) => {
    roleOption.value = res?.data
  })
})

// 选中事件
function onChecked(rowKeys) {
  if (rowKeys.length) {
    selectIds.value = rowKeys.join(',')
  } else {
    selectIds.value = ''
  }
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
      modalForm.value.avatar = data.path
    })
    .catch((err) => {
      onError()
    })
}

// 批量删除
const handleDeleteByIds = () => {
  let ids = selectIds.value
  if (!ids.length) {
    message.error('请选择节点')
    return
  }
  $dialog.confirm({
    content: '确定删除？',
    async confirm() {
      try {
        await api.deleteUserById(ids)
        $message.success('删除成功')
        $table.value?.handleSearch()
      } catch (error) {
        $message.success('删除失败')
      }
    },
  })
}
const {
  modalVisible,
  modalAction,
  modalTitle,
  modalLoading,
  handleAdd,
  handleDelete,
  handleEdit,
  handleView,
  handleSave,
  modalForm,
  modalFormRef,
} = useCRUD({
  name: '用户',
  initForm: {
    email: '',
    userName: '',
    password: '',
    avatar: '',
    nickName: '',
    profile: '',
    roleIds: '',
  },
  doCreate: (value) => {
    value.roleIds = value.roleIds.join(',')
    value.password = md5(value.password)
    api.addUser(value)
  },
  doDelete: api.deleteUserById,
  doUpdate: (row) => {
    row.roleIds = row.roleIds.join(',')
    return api.editUserById(row)
  },
  refresh: () => $table.value?.handleSearch(),
})

watch(modalForm, (val) => {
  if (val.roleIds) {
    val.roleIds = val.roleIds.split(',').map((id) => Number(id))
  }
})
</script>

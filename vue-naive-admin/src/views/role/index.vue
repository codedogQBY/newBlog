<template>
  <CommonPage show-footer title="角色管理">
    <template #action>
      <div>
        <n-button v-action="'system:role:add'" type="primary" class="mr-10" @click="handleAdd">
          <TheIcon icon="material-symbols:add" :size="18" class="mr-5" />
          新增角色
        </n-button>
        <n-button v-action="'system:role:delete'" type="error" class="mr-10" @click="handleDeleteByIds">
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
      :get-data="api.getRoleList"
      @on-checked="onChecked"
    ></CrudTable>

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
        <n-form-item label="角色名称" path="name">
          <n-input v-model:value="modalForm.name" placeholder="请输入角色名称" />
        </n-form-item>
        <n-form-item label="上级角色" path="parentId">
          <n-tree-select
            v-model:value="modalForm.parentId"
            placeholder="请选择父级菜单"
            :options="roleOptions"
            label-field="name"
            key-field="id"
            children-field="children"
          />
        </n-form-item>
        <n-form-item label="角色排序" path="serialNum">
          <n-input-number v-model:value="modalForm.serialNum" placeholder="请输入角色排序" />
        </n-form-item>
        <n-form-item label="角色备注" path="describe">
          <n-input v-model:value="modalForm.describe" type="textarea" placeholder="请输入角色备注" />
        </n-form-item>
      </n-form>
    </CrudModal>

    <CrudModal
      v-model:visible="permissionVisible"
      title="菜单权限"
      :loading="permissionLoading"
      :show-footer="true"
      @on-save="handleSavePermission"
    >
      <n-tree
        block-line
        :data="menuMap"
        checkable
        :selectable="false"
        multiple
        key-field="id"
        label-field="name"
        :checked-keys="checkedPermissionKeys"
        @update:checked-keys="handleSelectedPermission"
      />
    </CrudModal>
  </CommonPage>
</template>

<script setup>
import { NButton, useMessage } from 'naive-ui'
import { onMounted, ref, resolveDirective, withDirectives } from 'vue'
import api from './api'
import menuApi from '@/views/menu/api'
import { useCRUD } from '@/composables'
import { renderIcon } from '@/utils'

defineOptions({ name: 'RoleManager', isPage: true, src: '@/views/role/index.vue' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({ params: { name: '' } })
/** 补充参数（可选） */
const extraParams = ref({})
const roleOptions = ref([])
const selectIds = ref('')
const message = useMessage()

// 权限设置相关数据 start
const permissionVisible = ref(false)
const permissionLoading = ref(false)
const menuMap = ref([])
const permissionRow = ref({})
const checkedPermissionKeys = ref([])
const showPermissionModal = (row) => {
  permissionVisible.value = true
  permissionRow.value = row
  const menuIds = row.menuIds
  checkedPermissionKeys.value = menuIds.split(',').map((id) => Number(id))
}
const handleSavePermission = async () => {
  try {
    await api.editPermission({ ids: checkedPermissionKeys.value.join(','), roleId: permissionRow.value.id })
    $message.success('设置权限成功')
    $table.value?.handleSearch()
    permissionVisible.value = false
  } catch (error) {
    $message.success('设置权限失败')
  }
}
const handleSelectedPermission = (keys) => {
  checkedPermissionKeys.value = keys
}
// 权限设置相关数据 end

const rules = {
  name: [
    {
      required: true,
      message: '角色名字不能为空',
      trigger: ['input', 'blur'],
    },
  ],
  serialNum: [
    {
      type: 'number',
      required: true,
      message: '角色排序不能为空',
      trigger: ['input', 'blur'],
    },
  ],
}
const columns = [
  { type: 'selection', fixed: 'left' },
  { title: '角色名', key: 'name', width: 180 },
  { title: '描述', key: 'describe', width: 200 },
  { title: '排序', key: 'serialNum', width: 80 },
  { title: '更新时间', key: 'updatedAt', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 300,
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
          [[resolveDirective('action'), 'system:role:query']]
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
          [[resolveDirective('action'), 'system:role:edit']]
        ),
        withDirectives(
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              style: 'margin-left: 15px;',
              secondary: true,
              onClick: () => showPermissionModal(row),
            },
            { default: () => '权限设置', icon: renderIcon('fluent-mdl2:permissions', { size: 14 }) }
          ),
          [[resolveDirective('action'), 'system:role:editPermission']]
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
          [[resolveDirective('action'), 'system:role:delete']]
        ),
      ]
    },
  },
]

onMounted(() => {
  $table.value?.handleSearch()
  getRoleMap()
  menuApi.getMenuMap().then((res) => {
    if (res?.data && res.data.length) {
      menuMap.value = res.data
    }
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

const getRoleMap = () => {
  api.getRoleMap().then((res) => {
    if (res?.data && res.data.length) {
      roleOptions.value = res.data
    }
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
        await api.deleteRoleById(ids)
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
  name: '角色',
  initForm: {
    name: '',
    serialNum: 0,
    parentId: 0,
    describe: '',
  },
  doCreate: (value) => {
    api.addRole(value)
    getRoleMap()
  },
  doDelete: (value) => {
    api.deleteRoleById(value)
    getRoleMap()
  },
  doUpdate: (value) => {
    api.editRoleById(value)
    getRoleMap()
  },
  refresh: () => $table.value?.handleSearch(),
})
</script>

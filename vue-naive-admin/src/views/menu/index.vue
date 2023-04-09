<template>
  <CommonPage show-footer title="菜单管理">
    <template #action>
      <div>
        <n-button v-action="'system:menu:add'" type="primary" class="mr-10" @click="handleAdd">
          <TheIcon icon="material-symbols:add" :size="18" class="mr-5" />
          新增菜单
        </n-button>
        <n-button v-action="'system:menu:delete'" type="error" class="mr-10" @click="handleDeleteByIds">
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
      :get-data="api.getMenuList"
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
        <n-form-item label="菜单名" path="name">
          <n-input v-model:value="modalForm.name" placeholder="请输入菜单名" />
        </n-form-item>
        <n-form-item label="菜单类型" path="type">
          <n-radio-group v-model:value="modalForm.type" name="radioGroup">
            <n-radio v-for="menu in menuType" :key="menu.value" :value="menu.value">
              {{ menu.label }}
            </n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="modalForm.type !== 1" label="父级菜单" path="parentId">
          <n-tree-select
            v-model:value="modalForm.parentId"
            placeholder="请选择父级菜单"
            :options="menuOptions"
            label-field="name"
            key-field="id"
            children-field="children"
          />
        </n-form-item>
        <n-form-item label="菜单排序" path="serialNum">
          <n-input-number v-model:value="modalForm.serialNum" placeholder="请输入菜单排序" />
        </n-form-item>
        <n-form-item label="菜单图标" path="icon">
          <n-input v-model:value="modalForm.icon" placeholder="请输入菜单图标" />
          <div v-if="modalForm.icon">
            <TheIcon :icon="modalForm.icon" :size="32" class="ml-10" />
          </div>
        </n-form-item>
        <n-form-item label="渲染组件" path="component">
          <n-input v-model:value="modalForm.component" placeholder="请输入渲染组件，目录组件请输入Layout" />
        </n-form-item>
        <n-form-item v-if="modalForm.type !== 1" label="权限标识" path="permission">
          <n-input v-model:value="modalForm.permission" placeholder="请输入权限标识" />
        </n-form-item>
        <n-form-item v-if="modalForm.type !== 3" label="菜单地址" path="path">
          <n-input v-model:value="modalForm.path" placeholder="请输入菜单地址" />
        </n-form-item>
        <n-form-item label="是否显示" path="show">
          <n-radio-group v-model:value="modalForm.show" name="radioGroup">
            <n-radio :value="1"> 显示</n-radio>
            <n-radio :value="2"> 隐藏</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
    </CrudModal>
  </CommonPage>
</template>

<script setup>
import { NButton, useMessage } from 'naive-ui'
import { onMounted, ref, resolveDirective, watch, withDirectives } from 'vue'
import api from './api'
import { useCRUD } from '@/composables'
import { foreachTree, renderIcon } from '@/utils'
import TheIcon from '@/components/icon/TheIcon.vue'

defineOptions({ name: 'MenuManager', isPage: true })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
/** 补充参数（可选） */
const extraParams = ref({})
const menuOptions = ref([])
const filterMenuOptions = ref([])
const selectIds = ref('')
const menuType = [
  {
    value: 1,
    label: '目录',
  },
  {
    value: 2,
    label: '菜单',
  },
  {
    value: 3,
    label: '按钮',
  },
]
const message = useMessage()

const rules = {
  name: [
    {
      required: true,
      message: '菜单名字不能为空',
      trigger: ['input', 'blur'],
    },
  ],
  serialNum: [
    {
      type: 'number',
      required: true,
      message: '菜单排序不能为空',
      trigger: ['input', 'blur'],
    },
  ],
}
const columns = [
  { type: 'selection', fixed: 'left' },
  {
    title: '菜单名',
    key: 'name',
    width: 180,
  },
  {
    title: '菜单图标',
    key: 'icon',
    width: 80,
    render(row) {
      return h(TheIcon, { icon: row.icon, size: 32 })
    },
  },
  { title: '排序', key: 'serialNum', width: 80 },
  { title: '权限标识', key: 'permission', width: 180 },
  {
    title: '是否显示',
    key: 'show',
    width: 50,
    render(row) {
      return h('span', !!row['show'] ? '是' : '否')
    },
  },
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
          [[resolveDirective('action'), 'system:menu:query']]
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
          [[resolveDirective('action'), 'system:menu:edit']]
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
          [[resolveDirective('action'), 'system:menu:delete']]
        ),
      ]
    },
  },
]
onMounted(() => {
  $table.value?.handleSearch()
  getMenuMap()
})
const getMenuMap = () => {
  api.getMenuMap().then((res) => {
    if (res?.data && res.data.length) {
      menuOptions.value = res.data
    }
  })
}

// 选中事件
function onChecked(rowKeys) {
  if (rowKeys.length) {
    selectIds.value = rowKeys.join(',')
  } else {
    selectIds.value = ''
  }
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
        await api.deleteMenuById(ids)
        $message.success('删除成功')
        getMenuMap()
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
  name: '菜单',
  initForm: {
    name: '',
    type: 1,
    serialNum: null,
    show: 1,
    component: '',
    icon: '',
    parentId: 0,
    permission: '',
    path: '',
  },
  doCreate: (value) => {
    api.addMenu(value)
    getMenuMap()
  },
  doDelete: (value) => {
    api.deleteMenuById(value)
    getMenuMap()
  },
  doUpdate: (value) => {
    api.editMenuById(value)
    getMenuMap()
  },
  refresh: () => $table.value?.handleSearch(),
})


watch(
  modalForm,
  (val, oldValue) => {
    foreachTree(menuOptions.value, (node) => {
      node.disabled = val.id === node.id
    })
    if (val.type === 1) {
      filterMenuOptions.value = []
    } else if (val.type === 2) {
      foreachTree(menuOptions.value, (node) => {
        node.disabled = node.type !== 1
      })
      filterMenuOptions.value = menuOptions.value
    } else {
      foreachTree(menuOptions.value, (node) => {
        node.disabled = node.type !== 2
      })
      filterMenuOptions.value = menuOptions.value
    }
  },
  {
    deep: true,
  }
)
</script>

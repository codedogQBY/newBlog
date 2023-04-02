<template>
  <CommonPage show-footer title="标签管理">
    <template #action>
      <div>
        <n-button v-action="'system:tag:add'" type="primary" class="mr-10" @click="handleAdd">
          <TheIcon icon="material-symbols:add" :size="18" class="mr-5" />
          新增标签
        </n-button>
        <n-button v-action="'system:tag:delete'" type="error" class="mr-10" @click="handleDeleteByIds">
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
      :get-data="api.getTagList"
      @on-checked="onChecked"
    >
      <template #queryBar>
        <QueryBarItem label="名字" :label-width="50">
          <n-input
            v-model:value="queryItems.params.name"
            type="text"
            placeholder="请输入名字"
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
        <n-form-item label="名字" path="name">
          <n-input v-model:value="modalForm.name" placeholder="请输入名字" /> </n-form-item
        ><n-form-item label="描述" path="descript">
          <n-input v-model:value="modalForm.descript" placeholder="请输入描述" />
        </n-form-item>
      </n-form>
    </CrudModal>
  </CommonPage>
</template>

<script setup>
import { NButton, useMessage } from 'naive-ui'
import { onMounted, ref, resolveDirective, withDirectives } from 'vue'
import api from './api'
import commonApi from '@/api/index'
import { useCRUD } from '@/composables'
import { renderIcon } from '@/utils'

defineOptions({ name: 'TagManager', isPage: true })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({ params: {} })
/** 补充参数（可选） */
const extraParams = ref({})
const roleOption = ref([])
const selectIds = ref('')
const message = useMessage()

const rules = {
  name: [
    {
      required: true,
      message: '请输入名字',
      trigger: ['input', 'blur'],
    },
  ],
  descript: [
    {
      required: true,
      message: '请输入描述',
      trigger: ['input', 'blur'],
    },
  ],
}
const columns = [
  { type: 'selection', fixed: 'left' },
  { title: '名字', key: 'name' },
  { title: '描述', key: 'descript' },
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
          [[resolveDirective('action'), 'system:tag:query']]
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
          [[resolveDirective('action'), 'system:tag:edit']]
        ),
        withDirectives(
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              style: 'margin-left: 15px;',
              vAction: 'system:tag:delete',
              onClick: () => handleDelete(row.id),
            },
            { default: () => '删除', icon: renderIcon('material-symbols:delete-outline', { size: 14 }) }
          ),
          [[resolveDirective('action'), 'system:tag:delete']]
        ),
      ]
    },
  },
]
onMounted(() => {
  $table.value?.handleSearch()
})

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
        await api.deleteTagById(ids)
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
  name: '标签',
  initForm: {
    name: '',
    descript: '',
  },
  doCreate: (value) => {
    api.addTag(value)
  },
  doDelete: api.deleteTagById,
  doUpdate: (row) => {
    return api.editTagById(row)
  },
  refresh: () => $table.value?.handleSearch(),
})
</script>

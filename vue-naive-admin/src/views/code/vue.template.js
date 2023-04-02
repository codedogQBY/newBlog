// 首字母大写
const firstStrCase = (str) => {
  let tmp = str.toLowerCase()
  tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1)
  return tmp
}

// 生成vue代码模板
export const getVueBaseTemplate = (modelName, modelCnName, formItem) => {
  // 搜索bar
  const searchBars = formItem.reduce((pre, cur) => {
    if (cur.isSelect) {
      pre += `
        <QueryBarItem label="${cur.cnName}" :label-width="50">
          ${
            cur.type === 'INTEGER'
              ? `
              <n-input-number 
                v-model:value="queryItems.params.${cur.name}" 
                clearable 
                placeholder="请输入${cur.cnName}"
                @keydown.enter="$table?.handleSearch"
              />
              `
              : `<n-input
            v-model:value="queryItems.params.${cur.name}"
            type="text"
            placeholder="请输入${cur.cnName}"
            @keydown.enter="$table?.handleSearch"
          />`
          }
        </QueryBarItem>\n`
    }
    return pre
  }, '')

  // formItem组件生成
  const fromItemHtml = formItem.reduce((pre, cur) => {
    if (cur.type === 'STRING') {
      pre += `<n-form-item label="${cur.cnName}" path="${cur.name}">
          <n-input v-model:value="modalForm.${cur.name}" placeholder="请输入${cur.cnName}" />
        </n-form-item>`
    }

    if (cur.type === 'BIGINT' || cur.type === 'INTEGER') {
      pre += `<n-form-item label="${cur.cnName}" path="${cur.name}">
          <n-input-number v-model:value="modalForm.${cur.name}" placeholder="请输入${cur.cnName}" />
        </n-form-item>`
    }

    if (cur.type === 'TEXT') {
      pre += `<n-form-item label="${cur.cnName}" path="${cur.name}">
          <n-input type="textarea" v-model:value="modalForm.${cur.name}" placeholder="请输入${cur.cnName}" />
        </n-form-item>`
    }

    if (cur.type === 'DATE') {
      pre += `<n-form-item label="${cur.cnName}" path="${cur.name}">
          <n-date-picker v-model:value="modalForm.${cur.name}" type="date" placeholder="${cur.cnName}"/>
        </n-form-item>`
    }

    return pre
  }, '')

  // formRules生成
  const formRules = formItem.reduce((pre, cur) => {
    if (cur.isNotNull) {
      pre += `${cur.name}: [
    {
      required: true,
      message: '请输入${cur.cnName}',
      trigger: ['input', 'blur'],
    },
  ],\n`
    } else {
      pre += `\t${cur.name}: [ {} ],\n`
    }
    return pre
  }, '')

  // tableCols生成
  const tableCols = formItem.reduce((pre, cur) => {
    if (cur.isShow) {
      pre += `\t{ title: '${cur.cnName}', key: '${cur.name}'},\n`
    }
    return pre
  }, '')

  // initForm生成
  const initForm = formItem.reduce((pre, cur) => {
    const map = {
      TEXT: `''`,
      STRING: `''`,
      INTEGER: `0`,
      BIGINT: `0`,
      DATE: `new Date()`,
    }
    pre += `\t${cur.name}: ${map[cur.type]},\n`
    return pre
  }, '')

  return {
    language: 'html',
    fileName: `${modelName}\\index.vue`,
    content: `<template>
  <CommonPage show-footer title="${modelCnName}管理">
    <template #action>
      <div>
        <n-button v-action="'system:${modelName.toLowerCase()}:add'" type="primary" class="mr-10" @click="handleAdd">
          <TheIcon icon="material-symbols:add" :size="18" class="mr-5" />
          新增${modelCnName}
        </n-button>
        <n-button v-action="'system:${modelName.toLowerCase()}:delete'" type="error" class="mr-10" @click="handleDeleteByIds">
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
      :get-data="api.get${firstStrCase(modelName)}List"
      @on-checked="onChecked"
    >
      <template #queryBar>
        ${searchBars}
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
        ${fromItemHtml}
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

defineOptions({ name: '${firstStrCase(modelName)}Manager', isPage: true })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({ params: {} })
/** 补充参数（可选） */
const extraParams = ref({})
const roleOption = ref([])
const selectIds = ref('')
const message = useMessage()

const rules = {
  ${formRules}
}
const columns = [
  { type: 'selection', fixed: 'left' },
  ${tableCols}
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
          [[resolveDirective('action'), 'system:${modelName.toLowerCase()}:query']]
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
          [[resolveDirective('action'), 'system:${modelName.toLowerCase()}:edit']]
        ),
        withDirectives(
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              style: 'margin-left: 15px;',
              vAction: 'system:${modelName.toLowerCase()}:delete',
              onClick: () => handleDelete(row.id),
            },
            { default: () => '删除', icon: renderIcon('material-symbols:delete-outline', { size: 14 }) }
          ),
          [[resolveDirective('action'), 'system:${modelName.toLowerCase()}:delete']]
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
        await api.delete${firstStrCase(modelName)}ById(ids)
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
  name: '${modelCnName}',
  initForm: {
      ${initForm}
  },
  doCreate: (value) => {
    api.add${firstStrCase(modelName)}(value)
  },
  doDelete: api.delete${firstStrCase(modelName)}ById,
  doUpdate: (row) => {
    return api.edit${firstStrCase(modelName)}ById(row)
  },
  refresh: () => $table.value?.handleSearch(),
})
</script>
`,
  }
}

// 生成api代码模版
export const getApiBaseTemplate = (modelName) => {
  return {
    language: 'javascript',
    fileName: `${modelName}\\api.js`,
    content: `
    import { request } from '@/utils'
    export default {
      get${firstStrCase(modelName)}List: (data) => request.post('/system/${modelName.toLowerCase()}/list', data),
      edit${firstStrCase(
        modelName
      )}ById: (data) => request.post(\`/system/${modelName.toLowerCase()}/edit${firstStrCase(modelName)}ById\`, data),
      delete${firstStrCase(modelName)}ById: (ids) => {
        if (typeof ids === 'number') {
          ids = ids + ''
        }
        return request.get('/system//${modelName.toLowerCase()}/delete${firstStrCase(
      modelName
    )}ByIds', { params: { ids: ids } })
      },
      add${firstStrCase(modelName)}: (data) => request.post(\`/system/${modelName.toLowerCase()}/add\`, data),
    }
    `,
  }
}

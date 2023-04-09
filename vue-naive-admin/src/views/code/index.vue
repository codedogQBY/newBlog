<template>
  <CommonPage show-footer title="菜单管理">
    <div p-15 flex items-start b-1 bc-ccc rounded-8 m-b-25 items-center bg="#fafafc">
      <n-form
        ref="formRef"
        :model="model"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        size="medium"
        inline
        :style="{
          maxWidth: '640px',
        }"
      >
        <n-form-item label="模块名" path="modelName">
          <n-input v-model:value="model.modelName" placeholder="请输入模块名" />
        </n-form-item>
        <n-form-item label="模块中文名" path="modelCnName">
          <n-input v-model:value="model.modelCnName" placeholder="请输入模块中文名" />
        </n-form-item>
      </n-form>
    </div>
    <template #action>
      <div>
        <n-button type="primary" class="mr-10" @click="handleAddCol">
          <TheIcon icon="material-symbols:add" :size="18" class="mr-5" />
          新增一列
        </n-button>
        <n-button type="info" class="mr-10" @click="handlePreview">
          <TheIcon icon="fluent-mdl2:see-do" :size="18" class="mr-5" />
          预览代码
        </n-button>
        <n-button color="#ff69b4" class="mr-10">
          <TheIcon icon="material-symbols:download" :size="18" class="mr-5" />
          下载代码
        </n-button>
      </div>
    </template>

    <n-grid cols="5" :x-gap="24" item-responsive>
      <n-gi span="5">
        <n-card rounded-10>
          <n-table :bordered="false" :single-line="false">
            <thead>
              <tr>
                <th v-for="col in cols">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in formItems" :key="index">
                <td>
                  <n-input v-model:value="item.name" placeholder="请输入字段名"></n-input>
                </td>
                <td>
                  <n-input v-model:value="item.cnName" placeholder="请输入字段中文名"></n-input>
                </td>
                <td>
                  <n-select v-model:value="item.type" mr-24 :options="typeOptions" />
                </td>
                <td>
                  <n-input v-model:value="item.remark" type="textarea" placeholder="请输入字段说明"></n-input>
                </td>
                <td>
                  <n-switch v-model:value="item.isSelect" />
                </td>
                <td>
                  <n-switch v-model:value="item.isNotNull" />
                </td>
                <td>
                  <n-switch v-model:value="item.isShow" />
                </td>
                <td>
                  <n-button type="error" size="medium" circle @click="handleDelCol">
                    <template #icon>
                      <TheIcon icon="maki:cross" :size="16"></TheIcon>
                    </template>
                  </n-button>
                </td>
              </tr>
            </tbody>
          </n-table>
        </n-card>
      </n-gi>
    </n-grid>
  </CommonPage>
  <preview-modal
    v-model:visible="showModal"
    v-model:model-cn-name="model.modelCnName"
    v-model:model-name="model.modelName"
    :form-items="formItems"
    @on-close="handleCloseModal"
  >
  </preview-modal>
</template>

<script setup>
import { ref } from 'vue'
import TheIcon from '@/components/icon/TheIcon.vue'
import PreviewModal from '@/views/code/previewModal.vue'
import { useMessage } from 'naive-ui'

defineOptions({ name: 'Code', isPage: true, keepAlive: true })
const message = useMessage()
const formRef = ref('formRef')
const model = ref({
  modelName: '',
  modelCnName: '',
})
const rules = ref({
  modelName: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入 模块英文名',
  },
  modelCnName: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入 模块中文名',
  },
})
const cols = ref(['字段名', '字段中文名字', '字段类型', '字段说明', '是否筛选', '是否必选', '是否展示', '删除'])
const showModal = ref(false)
const formItems = ref([
  {
    name: '',
    cnName: '',
    type: 'STRING',
    remark: '',
    isSelect: false,
    isNotNull: true,
    isShow: false,
  },
])
const handleAddCol = () => {
  formItems.value.push({
    name: '',
    cnName: '',
    type: 'STRING',
    remark: '',
    isSelect: false,
    isNotNull: true,
    isShow: false,
  })
}

const handleDelCol = (index) => {
  formItems.value.splice(index, 1)
}

const handleCloseModal = () => {
  showModal.value = false
}

const handlePreview = () => {
  if (handleCheck()) {
    showModal.value = true
  }
}

const handleCheck = () => {
  let isPass = false
  const items = formItems.value
  const cModel = model.value

  if (!cModel.modelName || !cModel.modelCnName) {
    message.error('模块名或模块中文名未填写')
    isPass = false
  } else {
    isPass = true
  }

  if (!isPass) return false

  for (const i in items) {
    if (!items[i].name) {
      message.error(`第${+i + 1}行字段名未填写`)
      return false
    }
    if (!items[i].cnName) {
      message.error(`第${+i + 1}行字段中文名未填写`)
      return false
    }
    if (!items[i].remark) {
      message.error(`第${+i + 1}行字段描述未填写`)
      return false
    }
  }
  return isPass
}
const typeOptions = [
  {
    label: '字符串',
    value: 'STRING',
  },
  {
    label: '文本',
    value: 'TEXT',
  },
  {
    label: '整数',
    value: 'INTEGER',
  },
  {
    label: '超大整数',
    value: 'BIGINT',
  },
  {
    label: '日期',
    value: 'DATE',
  },
]
</script>

<style></style>

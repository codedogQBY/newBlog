<template>
  <div>
    <n-modal v-model:show="show" title="代码预览" :style="{ width: '80%' }" preset="card" size="huge" :bordered="false">
      <n-tabs
        class="card-tabs"
        :default-value="codeTabPanes[0].fileName"
        size="large"
        animated
        type="line"
        style="margin: 0 -4px"
        pane-style="padding-left: 4px; padding-right: 4px; box-sizing: border-box;"
      >
        <n-tab-pane v-for="tab in codeTabPanes" :name="tab.fileName" :tab="tab.fileName">
          <n-card title="生成代码" :style="{ maxHeight: '640px', overflowY: 'scroll' }">
            <template #header-extra>
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button strong secondary circle @click="handleCopyCode(tab.content)">
                    <TheIcon icon="material-symbols:content-copy" :size="16"></TheIcon>
                  </n-button>
                </template>
                点击复制当前代码
              </n-tooltip>
            </template>
            <n-code :code="tab.content" :language="tab.language" />
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </n-modal>
  </div>
</template>

<script setup>
import {
  getControllerBaseTemplate,
  getMigrationsBaseTemplate,
  getModelBaseTemplate,
  getRouteBaseTemplate,
} from './egg.template'
import { getApiBaseTemplate, getVueBaseTemplate } from './vue.template'
import { useMessage } from 'naive-ui'

const message = useMessage()

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  formItems: {
    type: Array,
    default: () => [],
  },
  modelName: {
    type: String,
    default: '',
  },
  modelCnName: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:visible', 'onClose', 'update:modelName', 'update:modelCnName'])
const vueTemplate = computed(() => getVueBaseTemplate(props.modelName, props.modelCnName, props.formItems))
const apiTemplate = computed(() => getApiBaseTemplate(props.modelName))
const migrationsTemplate = computed(() => getMigrationsBaseTemplate(props.modelName, props.formItems))
const controllerTemplate = computed(() =>
  getControllerBaseTemplate(props.modelName, props.modelCnName, props.formItems)
)
const routeTemplate = computed(() => getRouteBaseTemplate(props.modelName, props.modelCnName))
const modelTemplate = computed(() => getModelBaseTemplate(props.modelName, props.formItems))

const show = computed({
  get() {
    return props.visible
  },
  set(v) {
    emit('update:visible', v)
  },
})

const handleCopyCode = (content) => {
  navigator.clipboard.writeText(content).then(
    () => {
      message.success('复制当前代码成功！')
    },
    () => {
      message.error('复制当前代码失败！')
    }
  )
}

const codeTabPanes = computed(() => {
  return [
    vueTemplate.value,
    apiTemplate.value,
    routeTemplate.value,
    migrationsTemplate.value,
    modelTemplate.value,
    controllerTemplate.value,
  ]
})
</script>

<style scoped>
.card-tabs .n-tabs-nav--bar-type {
  padding-left: 4px;
}
</style>

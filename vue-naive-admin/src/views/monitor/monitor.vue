<template>
  <CommonPage show-footer title="错误监控">
    <CrudTable
      ref="$table"
      v-model:query-items="queryItems"
      :extra-params="extraParams"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.getErrorList"
      @on-checked="onChecked"
    ></CrudTable>

    <!-- 新增/编辑/查看 -->
    <CrudModal v-model:visible="modalVisible" width="auto" :title="modalTitle" :show-footer="false">
      <div v-if="modalType != 'viewUserActions'" id="revert" :ref="$revert"></div>
      <n-timeline v-else :icon-size="20">
        <n-timeline-item v-for="item in activities" :color="item.color" :content="item.content">
          <template #icon>
            <TheIcon :icon="item.icon" size="20" />
          </template>
        </n-timeline-item>
      </n-timeline>
    </CrudModal>
  </CommonPage>
</template>

<script setup>
import { onMounted, ref, withDirectives, nextTick } from 'vue'
import api from './api'
import { NButton } from 'naive-ui'
import { formatDateTime, renderIcon, unzip } from '@/utils'
import rrwebPlayer from 'rrweb-player'
import 'rrweb-player/dist/style.css'

defineOptions({ name: 'Monitor', isPage: true })

const $table = ref(null)
const $revert = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
/** 补充参数（可选） */
const extraParams = ref({})
const selectIds = ref('')
const modalVisible = ref(false)
const modalTitle = ref('查看用户行为')
const modalType = ref('viewUserActions')
const activities = ref([])

const columns = [
  {
    title: '错误信息',
    key: 'message',
    width: 180,
  },
  {
    title: '报错页面',
    key: 'pageUrl',
    width: 180,
  },
  {
    title: '报错时间',
    key: 'time',
    width: 80,
    render(row) {
      return formatDateTime(row.time)
    },
  },
  {
    title: '项目编号',
    key: 'apikey',
    width: 80,
  },
  {
    title: '设备信息',
    key: 'deviceInfo',
    width: 180,
  },
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
              type: 'warning',
              style: 'margin-left: 15px;margin-bottom: 15px;',
              onClick: () => {

              },
            },
            { default: () => '查看源码', icon: renderIcon('material-symbols:code-blocks-outline', { size: 18 }) }
          ),
          []
        ),
        withDirectives(
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              style: 'margin-left: 15px;margin-bottom: 15px;',
              onClick: () => {
                showModal('播放录屏', 'playRecord')
                playRecord(row.recordScreenId)
              },
            },
            { default: () => '播放录屏', icon: renderIcon('material-symbols:play-circle-outline', { size: 18 }) }
          ),
          []
        ),
        withDirectives(
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              style: 'margin-left: 15px;margin-bottom: 15px;',
              onClick: () => {
                showModal('查看用户行为', 'viewUserActions')
                revertBehavior(row)
              },
            },
            { default: () => '查看用户行为', icon: renderIcon('ic:baseline-remove-red-eye', { size: 18 }) }
          ),
          []
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

function showModal(title, type) {
  modalType.value = type
  modalTitle.value = title
  modalVisible.value = true
}

function revertBehavior({ breadcrumb }) {
  breadcrumb = breadcrumb && JSON.parse(breadcrumb)
  breadcrumb.forEach((item) => {
    item.color = item.status == 'ok' ? '#5FF713' : '#F70B0B'
    item.icon = item.status == 'ok' ? 'clarity:success-standard-solid' : 'ic:outline-error'
    if (item.category == 'Click') {
      item.content = `用户点击dom: ${item.data}`
    } else if (item.category == 'Http') {
      item.content = `调用接口: ${item.data.url}, ${
        item.status == 'ok' ? '请求成功' : `请求失败，请求数据为${item.data.request.data}`
      }`
    } else if (item.category == 'Code_Error') {
      item.content = `代码报错：${item.data.message}`
    } else if (item.category == 'Resource_Error') {
      item.content = `加载资源报错：${item.message}`
    } else if (item.category == 'Route') {
      item.content = `路由变化：从 ${item.data.from}页面 切换到 ${item.data.to}页面`
    }
    item.content = `${formatDateTime(item.time)}  ${item.content}`
  })
  activities.value = breadcrumb
}

async function playRecord(id) {
  const res = await api.getRecordScreenById(id)
  const events = unzip(res.data)
  await nextTick(() => {
    new rrwebPlayer({
      target: document.getElementById('revert'),
      props: {
        events,
        UNSAFE_replayCanvas: true,
      },
    })
  })
}
</script>

<style>
.rr-player {
  margin: 0 auto;
}
#revert {
  width: 100%;
  display: flex;
}
</style>

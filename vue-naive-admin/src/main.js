/** 重置样式 */
import '@/styles/reset.css'
import 'uno.css'
import '@/styles/global.scss'
import 'virtual:svg-icons-register'

import { createApp } from 'vue'
import { setupRouter } from '@/router'
import { setupStore } from '@/store'
import App from './App.vue'
import initAction from '@/directive/action'
import webSee from 'web-see'

async function setupApp() {
  const app = createApp(App)
  initAction(app)
  setupStore(app)
  app.use(webSee, {
    dsn: '/api/monitor/monitorReport', // 上报的地址
    apikey: '管理后台', // 项目唯一的id
    silentRecordScreen: true, // 开启录屏
    // useImgUpload: true,
  })

  await setupRouter(app)

  app.mount('#app')
}

setupApp()

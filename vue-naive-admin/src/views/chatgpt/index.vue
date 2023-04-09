<template>
  <div class="chat-container">
    <div class="chat-box">
      <template v-for="(message, index) in messageList" :key="message + index">
        <message
          :send-by-user="message.sendByUser"
          :content="message.content"
          :index="index"
          @copy="handleCopyAnswer"
          @resend="handleResend"
        ></message>
      </template>
      <n-spin v-if="loading" size="small" />
    </div>
    <n-form class="send-form">
      <div class="options">
        <n-tooltip trigger="hover">
          清空记录
          <template #trigger>
            <n-button text class="button" @click="handleClear">
              <TheIcon icon="mdi:null-off" :size="22" />
            </n-button>
          </template>
        </n-tooltip>
        <n-tooltip trigger="hover">
          下载MD文件
          <template #trigger>
            <n-button text class="button">
              <TheIcon icon="material-symbols:sim-card-download-outline" :size="22" />
            </n-button>
          </template>
        </n-tooltip>
      </div>
      <div>
        <n-input
          v-model:value="inputValue"
          placeholder="请输入内容，Enter键发送，Ctrl+Enter换行"
          type="textarea"
          class="message-input"
          :disabled="loading"
          clearable
          @keydown.enter="handleEnter"
        />
      </div>
    </n-form>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import Message from './messge.vue'
import { useMessage } from 'naive-ui'
import API from './api'

defineOptions({ name: 'Chatgpt', isPage: true, keepAlive: true })

const messageList = ref([])
const inputValue = ref('')
const loading = ref(false)
const aMessage = useMessage()

const fetchAnswer = async () => {
  loading.value = true
  API.getAnswer({ prompt: inputValue.value })
    .then((res) => {
      messageList.value.push({
        content: res.content,
        sendByUser: false,
      })
      localStorage.setItem('messageList', JSON.stringify(messageList.value))
    })
    .catch((error) => {
      aMessage.error(error)
    })
    .finally(() => {
      inputValue.value = ''
      loading.value = false
    })
}
const handleSend = () => {
  const message = inputValue.value
  if (message) {
    messageList.value.push({
      content: message,
      sendByUser: true,
    })
    fetchAnswer()
  }
}

const handleEnter = (e) => {
  const keyCode = e.keyCode || e.which || e.charCode
  const ctrlKey = e.ctrlKey || e.metaKey
  if (ctrlKey && keyCode == 13) {
    inputValue.value += '\n'
  } else {
    handleSend()
  }
  e.preventDefault()
}

const handleCopyAnswer = ({ index }) => {
  navigator.clipboard.writeText(messageList.value[index].content).then(
    () => {
      aMessage.success('复制回答内容成功！')
    },
    () => {
      aMessage.error('复制回答内容失败！')
    }
  )
}

const handleResend = ({ index }) => {
  inputValue.value = messageList.value[index].content
}

const handleClear = () => {
  messageList.value = []
  localStorage.removeItem('messageList')
  aMessage.success('清空记录成功')
}

onMounted(() => {
  const list = localStorage.getItem('messageList')
  if (list) {
    messageList.value = JSON.parse(list)
  }
})
</script>
<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.top-container {
  align-items: center;
  background-color: #f5f6f7;
  display: flex;
  padding: 10px;
  .greeting {
    font-size: 18px;
    margin-left: 10px;
  }
}
.chat-box {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: scroll;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
}
.message-item {
  margin-top: 5px;
  margin-bottom: 5px;
  .n-message {
    max-width: 100%;
  }
  &.send-by-user {
    text-align: right;
    .n-message {
      display: inline-block;
      max-width: 90%;
    }
  }
}
.send-form {
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 10px;
  background-color: #f5f6f7;
  border-top: 1px solid #eee;

  .message-input {
    min-width: 100%;
  }
}
.options {
  margin-bottom: 5px;
  .button {
    margin: 0 8px;
  }
}
</style>

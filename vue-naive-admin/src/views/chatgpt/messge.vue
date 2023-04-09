<template>
  <div class="message-box" :style="sendByUser ? { backgroundColor: '#c5d9dc' } : { backgroundColor: '#d4ebee' }">
    <div class="avatar">
      <n-avatar
        v-if="sendByUser"
        :style="{
          color: 'white',
          backgroundColor: '#02aabb',
          fontSize: '16px',
        }"
        size="medium"
        >U</n-avatar
      >
      <n-avatar v-else src="http://www.mi-gpt.com/template/images/ai.png" size="medium" />
    </div>
    <div class="content">
      <section>
        <p v-html="content"></p>
      </section>
    </div>
    <div class="option">
      <n-tooltip v-if="sendByUser" trigger="hover">
        重新发送
        <template #trigger>
          <n-button text @click="handleResend">
            <TheIcon icon="ic:round-replay" :size="20" class="ml-10" />
          </n-button>
        </template>
      </n-tooltip>
      <n-tooltip v-else trigger="hover">
        复制回答
        <template #trigger>
          <n-button text @click="handleCopy">
            <TheIcon icon="material-symbols:content-copy-outline-rounded" :size="20" class="ml-10" />
          </n-button>
        </template>
      </n-tooltip>
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(['copy', 'resend'])
const props = defineProps({
  sendByUser: {
    type: Boolean,
    required: true,
    default: false,
  },
  content: {
    type: String,
    default: '',
  },
  index: {
    type: Number,
    default: 0,
  },
})
const handleResend = () => {
  emit('resend', { index: props.index })
}
const handleCopy = () => {
  emit('copy', { index: props.index })
}
</script>
<style scoped lang="scss">
.message-box {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  margin: 12px 4px;
  border-radius: 8px;
  font-size: 16px;
  .avatar {
    margin-right: 24px;
  }
  .content {
    flex: 1;
    padding-top: 4px;
  }
  .option {
    margin-left: 24px;
  }
}
</style>

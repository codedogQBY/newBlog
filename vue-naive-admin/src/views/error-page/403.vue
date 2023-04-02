<template>
  <AppPage>
    <n-result m-auto status="403" title="403 禁止访问" description="总有些门是对你关闭的">
      <template #footer>
        <n-button @click="replace('/')">放轻松</n-button>
      </template>
    </n-result>
  </AppPage>
</template>

<script setup>
defineOptions({ name: '403', isPage: true })
const { replace } = useRouter()
</script>

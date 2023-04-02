<template>
  <AppPage :show-footer="true">
    <div flex-1>
      <n-card rounded-10>
        <div flex items-center>
          <img rounded-full width="60" :src="userStore.avatar" />
          <div ml-20>
            <p text-16>Hello, {{ userStore.name }}</p>
            <p mt-5 text-12 op-60>{{ userStore?.userInfo?.info?.profile }}</p>
          </div>
          <div ml-auto flex items-center>
            <n-statistic label="待办" :value="4">
              <template #suffix> / 10</template>
            </n-statistic>
          </div>
        </div>
      </n-card>
    </div>
  </AppPage>
</template>

<script setup>
defineOptions({ name: 'WorkBench', isPage: true, src: '@/views/workbench/index.vue' })
import { useUserStore } from '@/store'

const userStore = useUserStore()
</script>

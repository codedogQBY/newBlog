<template>
  <div>
    <n-button @click="test">测试</n-button>
  </div>
</template>

<script setup>
defineOptions({ name: 'Performance', isPage: true })
const test = () => {
  console.log([].test.yyyy)
}
</script>

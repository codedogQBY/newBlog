<template>
  <div>
    <n-button @click="resourceError">加载资源测试</n-button>
  </div>
</template>

<script setup>
defineOptions({ name: 'MyDashboard', isPage: true })
const test = () => {
  console.log([].test.yyyy)
}

const resourceError = () => {
  let script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://abc.com/index.js'
  document.body.appendChild(script)
}
</script>

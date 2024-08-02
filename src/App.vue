<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useUserStore } from '@/stores'
const useStore = useUserStore()
// 设置一个1000毫秒后执行的定时器
setTimeout(function() {
    useStore.removeToken()
  }, 1000*8*3600);
  
// window.addEventListener('beforeunload', (event) => {
// // 执行清理工作
// useStore.removeToken()
// });
</script>

<template>
  <div>
    <!-- App.vue只需要留一个路由出口 router-view即可 -->
    <el-config-provider :locale="zhCn">
      <router-view></router-view>
    </el-config-provider>
  </div>
</template>

<style scoped></style>

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

// createRouter 创建路由实例
// 配置 history 模式
// 1. history模式：createWebHistory     地址栏不带 #
// 2. hash模式：   createWebHashHistory 地址栏带 #
// console.log(import.meta.env.DEV)

// vite 中的环境变量 import.meta.env.BASE_URL  就是 vite.config.js 中的 base 配置项
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: () => import('@/views/login/LoginPage.vue') }, // 登录页
    {
      path: '/',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/stock/overview',
      children: [
        {
          name:'select',
          path: '/stock/select',
          component: () => import('@/views/select/SelectStock.vue'),
          meta:{
            keepAlive:true
          }
        },
        {
          path: '/stock/overview',
          component: () => import('@/views/overall/overall.vue'),
          meta:{
            keepAlive:false
          }
        },
        {
          path: '/user/profile',
          component: () => import('@/views/user/userInfo.vue'),
          meta:{
            keepAlive:false
          }
        },
        {
          path: '/user/addinfo',
          component: () => import('@/views/user/addInfo.vue'),
          meta:{
            keepAlive:true
          }
        },
        {
          path: '/user/resetpasswd',
          component: () => import('@/views/user/resetPasswd.vue'),
          meta:{
            keepAlive:true
          }
        },
        {
          path: '/stock/analysis',
          component: () => import('@/views/analysis/stockAnalysis.vue'),
          meta:{
            keepAlive:true
          }
        },
        {
          path: '/backtrade/start',
          component: () => import('@/views/backtrade/backtrade.vue'),
          meta:{
            keepAlive:true
          }
        },
        {
          path: '/backtrade/record',
          component: () => import('@/views/backtrade/backtradeRecord.vue'),
          meta:{
            keepAlive:true
          }
        },
        {
          path: '/stock/select_by_hisory',
          component: () => import('@/views/select/SelectByHistory.vue'),
          meta:{
            keepAlive:true
          }
        }
      ]
    }
  ]
})

// 登录访问拦截 => 默认是直接放行的
// 根据返回值决定，是放行还是拦截
// 返回值：
// 1. undefined / true  直接放行
// 2. false 拦回from的地址页面
// 3. 具体路径 或 路径对象  拦截到对应的地址
//  '/login'   { name: 'login' }
router.beforeEach((to) => {
  const useStore = useUserStore()
  if (useStore.getToken() != null && to.path == '/login') return '/';
  if (!useStore.getToken() && to.path !== '/login') return '/login'
})



export default router

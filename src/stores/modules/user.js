import { defineStore } from 'pinia'
import { ref } from 'vue'
import Cookies from 'js-cookie'

// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'smart-stock-user',
  () => {
    const token = ref({})
    const setToken = (newToken, remeber) => {
      if (remeber) {
        Cookies.set('token', newToken, {expires: 7})
      } else {
        Cookies.set('token', newToken)
      }
    }
    const removeToken = () => {
      Cookies.remove('token')
    }

    const getToken = () => {
      return Cookies.get('token');
    }

    const user = ref({})
    const getUser = () => {
      // const res = await userGetInfoService() // 请求获取数据
      // user.value = res.data.data
      return user.value;
    }
    const setUser = (obj) => {
      user.value = obj
    }

    return {
      getToken,
      setToken,
      removeToken,
      user,
      getUser,
      setUser
    }
  },
  {
    persist: true
  }
)
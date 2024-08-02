import request from '@/utils/request'

// 注册接口
export const userRegisterService = (params) =>
  request.post('/user/registry', params)

// 登录接口
export const userLoginService = (params) =>
  request.post('/user/login', params)

// 重置密码
export const userResetPassword = (params) =>
  request.post('/user/reset_password', params)

export default {}
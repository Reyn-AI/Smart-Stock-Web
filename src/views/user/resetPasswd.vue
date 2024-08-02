<script setup>
import { userResetPassword } from '@/api/user.js'
import { User, Lock } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

const form = ref()
// 整个的用于提交的form数据对象
const userStore = useUserStore()

const formModel = ref({
  password: '',
  newpassword: '',
  repassword: ''
})

const loadding = ref()

// 整个表单的校验规则
// 1. 非空校验 required: true      message消息提示，  trigger触发校验的时机 blur change
// 2. 长度校验 min:xx, max: xx
// 3. 正则校验 pattern: 正则规则    \S 非空字符
// 4. 自定义校验 => 自己写逻辑校验 (校验函数)
//    validator: (rule, value, callback)
//    (1) rule  当前校验规则相关的信息
//    (2) value 所校验的表单元素目前的表单值
//    (3) callback 无论成功还是失败，都需要 callback 回调
//        - callback() 校验成功
//        - callback(new Error(错误信息)) 校验失败
const rules = {
  username: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^\d{11,}$/,
      message: '请输入11位数字',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是 6-15位 的非空字符',
      trigger: 'blur'
    }
  ],
  newpassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是 6-15位 的非空字符',
      trigger: 'blur'
    }
  ],
  repassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是 6-15位 的非空字符',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        // 判断 value 和 当前 form 中收集的 password 是否一致
        if (value !== formModel.value.newpassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback() // 就算校验成功，也需要callback
        }
      },
      trigger: 'blur'
    }
  ]
}

const router = useRouter()
console.log("userid=", userStore.getUser())
const reset = async () => {
  await form.value.validate()
  let params = {
    'userID':userStore.getUser(),
    'password':formModel.value.password,
    'newPassword':formModel.value.newpassword
  }

  loadding.value = true;
  const res = await userResetPassword(params)
  loadding.value = false;
  if(res){
    if(res.data.status!=1){
      ElMessage.error(res.data.msg)
    }
    else{
      userStore.removeToken()
      userStore.setUser({})
      ElMessage.success('密码修改成功，请重新登录！')
      router.push('/login')
    }
  }
}

</script>

<template>
  <!-- 
    1. 结构相关
      el-row表示一行，一行分成24份 
       el-col表示列  
       (1) :span="12"  代表在一行中，占12份 (50%)
       (2) :span="6"   表示在一行中，占6份  (25%)
       (3) :offset="3" 代表在一行中，左侧margin份数

       el-form 整个表单组件
       el-form-item 表单的一行 （一个表单域）
       el-input 表单元素（输入框）
    2. 校验相关
       (1) el-form => :model="ruleForm"      绑定的整个form的数据对象 { xxx, xxx, xxx }
       (2) el-form => :rules="rules"         绑定的整个rules规则对象  { xxx, xxx, xxx }
       (3) 表单元素 => v-model="ruleForm.xxx" 给表单元素，绑定form的子属性
       (4) el-form-item => prop配置生效的是哪个校验规则 (和rules中的字段要对应)
  -->
  <el-row class="reset-passwd-page">
    <el-col :span="3" class="bg"></el-col>
    <el-col :span="12" :offset="2" class="form">

      <!-- 登录相关表单 -->
      <el-form :model="formModel" :rules="rules" ref="form" size="large" autocomplete="off" >

      <h2 style="text-align: center;">重置密码</h2>

        
      <el-form-item prop="password">
        <el-input v-model="formModel.password" name="password" :prefix-icon="Lock" type="password"
          placeholder="请输入原密码"><template #prepend>原密码：</template></el-input>
      </el-form-item>

      <el-form-item prop="newpassword">
        <el-input v-model="formModel.newpassword" name="newpassword" :prefix-icon="Lock" type="password"
          placeholder="请输入新密码"><template #prepend>新密码：</template></el-input>
      </el-form-item>
      <el-form-item prop="repassword">
        <el-input v-model="formModel.repassword" name="repassword" :prefix-icon="Lock" type="password"
          placeholder="请重复新密码"><template #prepend>重复密码：</template></el-input>
      </el-form-item>
      <el-form-item class="flex">

      </el-form-item>
      <el-form-item>
        <el-button @click="reset" class="button" type="primary" auto-insert-space>提交</el-button>
      </el-form-item>
      <el-form-item class="flex">
      </el-form-item>
    </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.reset-passwd-page {
  height: 100vh;
  background-color: #fff;

  .form {
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .title {
      margin: 0 auto;
    }

    .button {
      width: 100%;
    }
  }
}
</style>
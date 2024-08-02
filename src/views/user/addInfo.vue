<script setup>

import { User, Lock } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { addOrder } from "@/api/orderApi";
const router = useRouter()

const form = ref()
// 整个的用于提交的form数据对象
const userStore = useUserStore()

const date = ref(new Date())
const formModel = ref({
  'userID': userStore.getUser(),
  'stockName': '',
  'tradeDate': "2024-05-13 11:00:00",
  'volume': 0,
  'price': 0.0,
  'stockStatus': 0
})

const status = [{
  label: "买入",
  value: 0,
}, {
  label: "卖出",
  value: 1,
},]

const addItem = async () => {
  // 执行新增项目功能
  console.log('新增所选项目:', formModel.value)
  const res = await addOrder(formModel.value)
  if(res){
    if(res.data.status!=1){
      ElMessage.error(res.data.msg)
    }
    else{
      ElMessage.success('添加成功！')
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
  <el-row class="add-info-page">
    <el-col :span="1" class="bg"></el-col>
    <el-col :span="30" :offset="0" class="form">
      <h2>交割单信息录入</h2>
      <el-form label-width="100px">
        <el-form-item label="股票名称："> 
          <el-input v-model="formModel.stockName" placeholder="请输入股票名称"></el-input>
        </el-form-item>
        <el-form-item label="交易时间："> 
          <el-date-picker
            v-model="formModel.tradeDate"
            type="formMode.tradeDate"
            placeholder="选择日期"
            format="YYYY年MM月DD日"
            value-format="YYYY-MM-DD HH:mm:ss">
          </el-date-picker>
          <el-time-picker
            arrow-control
            v-model="formModel.tradeDate"
            :picker-options="{
              selectableRange: '09:30:00 - 15:30:00'
            }"
            placeholder="选择时间"
            format="HH时mm分ss秒"
            value-format="YYYY-MM-DD HH:mm:ss">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="成交价："> 
          <el-input v-model="formModel.price" placeholder="请输入成交价"></el-input>
        </el-form-item>
        <el-form-item label="成交量："> 
          <el-input v-model="formModel.volume" placeholder="请输入成交量"></el-input>
        </el-form-item>
        <el-form-item label="状态："> 
          <el-select v-model="formModel.stockStatus" placeholder="请选择状态">
            <el-option
              v-for="item in status"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form label-width="100px" style="text-align: right;">
        <el-button type="primary" @click="addItem">添加</el-button>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.add-info-page {
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

<style type="text/css">
div {
  font-size: 20px;
  color: #000000;
  display: inline
}

</style>
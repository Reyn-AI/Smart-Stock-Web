<script setup>
import { computed, onActivated, onMounted, ref } from 'vue';
import { _queryOrder, _queryOrderByIndex, deleteOrder, updateOrder } from '@/api/orderApi';
import { useUserStore } from "@/stores";
import { useRouter } from 'vue-router'
import moment from 'moment'
import { ElMessage } from 'element-plus';
import {utils, writeFile} from 'xlsx'

const router = useRouter();
const userStore = useUserStore();
const uuidStr = ref()
const tableData = ref({
  columns: [],
  data: [],
  pageSize: 100, //每页显示数量
  currentPage: 0, //当前页码
  totalNumbers: 0, //总条数
});

async function queryOrder() {
  let params = {
    userID: userStore.getUser(),
    analysis: false,
  };
  const result = await _queryOrder(params);
  if (result) {
    tableData.value.data = result.data.data;
    tableData.value.columns = result.data.columns;
    tableData.value.currentPage = 0;
    tableData.value.totalNumbers = result.data.totalNumbers;
    uuidStr.value = result.data.uuidStr;
  }
}

async function pageCurrentChange(page) {
  tableData.value.currentPage = page - 1; //page从1开始
  let params = {
    uuidStr: uuidStr.value,
    currentPage: tableData.value.currentPage,
    pageSize: tableData.value.pageSize,
    userID: userStore.getUser(),
  };
  const result = await _queryOrderByIndex(params);
  if (result) {
    tableData.value.data = result.data.data;
  }
}

const columnsView = computed(() => {
  let filterColumns = tableData.value.columns.filter((item) => item != "id");
  return filterColumns;
});

const selectedItems = ref([])

const handleSelectionChange = (item) => {
  selectedItems.value = item
  console.log("选中", item)
}

onActivated(async () => {
  await queryOrder();
});

const searchText = ref("")

const search = () => {
  return searchText
}

const handleDelete = async () => {
  if (selectedItems.value.length == 0) {
    ElMessage.error("请至少选择一个删除！")
  }
  selectedItems.value.forEach( async function(item) {
    let param = {
      'id': item.id,
      'userID': userStore.getUser()
    };
    console.log('删除', param)
   await deleteOrder(param);
  });
  await queryOrder();
}

const formModel = ref({
  'userID': userStore.getUser(),
  'stockName': '',
  'tradeDate': '',
  'volume': 0,
  'price': 0.0,
  'stockStatus': 0,
  'id': 0
})

const status = [{
  label: "买入",
  value: 0,
}, {
  label: "卖出",
  value: 1,
},]

const handleAdd = async () => {
  router.push('/user/addinfo')
}

const centerDialogVisible = ref()
const handleEdit = () => {
  if (selectedItems.value.length != 1) {
    ElMessage.error('每次只能修改一个，请选择要修改的股票')
  } else {
    formModel.value.stockName = selectedItems.value[0]['股票名']
    formModel.value.tradeDate = selectedItems.value[0]['交易日期'].replace('T', ' ')
    formModel.value.volume = selectedItems.value[0]['成交量(股)']
    formModel.value.price = selectedItems.value[0]['价格']
    formModel.value.id = selectedItems.value[0]['id']
    if (selectedItems.value[0]['状态'] == 'buy') {
      formModel.value.stockStatus = 0
    } else {
      formModel.value.stockStatus = 1
    }
    console.log('修改', formModel)
    centerDialogVisible.value = true
  }
  
  //console.log('修改', item)
}

const editItem = async () => {
  console.log('修改', formModel.value)
  formModel.value.tradeDate = moment(formModel.value.tradeDate).format("YYYY-MM-DD HH:mm:ss")
  const res = await updateOrder(formModel.value)
  console.log("res: ", res)
  if (res) {
    if (res.status == 200) {
      ElMessage.success("修改成功！");
      await queryOrder();
      centerDialogVisible.value = false;
    } else {
      ElMessage.error(res.msg);
    }
  }
}

const exportExcel = () => {
  const ws = utils.json_to_sheet(tableData.value.data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet1');
  writeFile(wb, 'data.xlsx');
}

</script>

<template>
  <h3>交割单列表</h3>
  <div class="items-center">
    <el-input style="width: 240px; margin-right: 10px;" type="text" v-model="searchText" placeholder="请输入搜索文本"></el-input>
    <el-button  type="primary" @click="search">搜索</el-button>
    <el-button  type="primary" @click="handleAdd">新增</el-button>
    <el-button  type="primary" @click="handleEdit">
      修改
    </el-button>

    <el-button  type="primary" @click="handleDelete">删除</el-button>
    <el-button  type="primary" @click="exportExcel">导出为Excel</el-button>
    <el-dialog
      v-model="centerDialogVisible"
      title="修改交割单"
      width="500"
      align-center
    >
      <el-form label-width="100px">
        <el-form-item label="股票名称："> 
          <el-input v-model="formModel.stockName" placeholder="请输入股票名称"></el-input>
        </el-form-item>
        <el-form-item label="交易时间："> 
          <el-date-picker v-model="formModel.tradeDate" type="date" placeholder="选择日期"/>
          <el-time-picker v-model="formModel.tradeDate" placeholder="选择时间" />
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
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editItem">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  <el-table
    :columns="tableData.columns"
    :data="tableData.data"
    style="width: 100%"
    max-height="1024"
    highlight-current-row
    border
    :fit="true"
    v-loading="tableData.loading"
    @selection-change="handleSelectionChange"
  >
    <el-table-column type="selection" width="55" />
    <el-table-column
      :prop="row"
      :label="row"
      v-for="(row, i) in columnsView"
      width="120"
      sortable
      :key="i"
    ></el-table-column>
  </el-table>
  <el-pagination
    background
    layout="prev, pager, next"
    :total="tableData.totalNumbers"
    style="width: 100%; padding-top: 10px"
    :page-size="tableData.pageSize"
    :current-page="tableData.currentPage + 1"
    @current-change="pageCurrentChange"
  >
  </el-pagination>
</template>


<style scoped>
.container {
  max-width: 100%;
  margin: 0 auto;
}

.wrapper {
  display: flex;
  flex-direction: column;
}

h2 {
  margin-bottom: 20px;
}

.button-group {
  display: flex;
}

.divider {
  width: 100%;
  border-bottom: 2px solid #ccc;
  margin-bottom: 20px;
}

.item-list {
  padding: 10px; /* 添加内边距 */
}

.item-list table {
  width: 100%;
  border-collapse: collapse;
}

.item-list th, .item-list td {
  border: 1px solid #ccc;
  padding: 8px;
}

.items-center {
  text-align: center;
  margin-bottom: 10px;
}

</style>

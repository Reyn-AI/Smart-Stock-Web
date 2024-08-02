<script setup>
import { computed, onActivated, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { _get_record, _get_record_by_id, _delete_record_by_id} from "@/api/backtradeApi";
import "element-plus/dist/index.css";
import { viewKLineEchart } from "@/utils/kecharts";
import * as echarts from "echarts";
import { useUserStore } from "@/stores";

var fullscreenLoading = ref(false);
var strategyList = ref({
  buyStrategys: [], //买入策略
  sellStrategys: [], //卖出策略
  buyChoice: [], //买策略索引
  sellChoice: [], //卖策略索引
  buyChoiceStrategy: [], //实际选择的策略
  sellChoiceStrategy: [],
  code: "",
  dialogFormVisible: false, //参数设置
  defaultParams: [], //回测基础参数配置
  buySizeStrategys: [], //买仓位控制策略
  sellSizeStrategys: [], //卖仓位控制策略
  buyCombineType: {}, //买入策略组合方式
  sellCombineType: {}, //卖出策略组合方式
  sellSizeChoice: 0, //选择的卖出仓位控制策略
  buySizeChoice: 0, // 选择的卖出仓位控制策略
  choiceBuyCombineType: 0, //选择的买入策略组合方式
  choiceSellCombineType: 0, //选择的卖出策略组合方式
});
const getBuyStrategyParams = computed(() => {
  //获取选择的买入策略参数配置
  return strategyList.value.buyChoiceStrategy
});
const getSellStrategyParams = computed(() => {
  //获取选择的卖出策略参数配置
  return strategyList.value.sellChoiceStrategy;
});

const getBuySizeChoice = computed(() => {
  //获取选择的买入仓位策略参数
  let params = {'params':[]}
  params = strategyList.value.buySizeChoice
  return params
});
const getSellSizeChoice = computed(() => {
  //获取选择的卖出仓位策略参数
  let params = {'params':[]}
  params =  strategyList.value.sellSizeChoice
  return params
});
var dateIndex = ref({
  data: [],
});
var plotData = ref({
  dayReturns: [], //日收益率
  benchmark: [], //benchmark收益曲线
  cash: [], //现金曲线
  totalAssets: [], //总资产
  orderInfos: {}, //买卖点信息 {'code':{'sell':[], 'buy':[]}}
  orderStockNames: [], //回测买卖的股票池
});
var returnsTable = ref({
  data: [],
}); //收益指标
var tradeLog = ref({
  logQueen: [], //回测日志
});
const publishedBooksMessage = computed(() => {
  return tradeLog.value.logQueen.join("\n");
});

const dayKLine = ref({
  rawData: [], //k线数据
  nYear: 2, // 年数
  code: "",
}); //存储日线数据
async function viewOrder() {
  //买卖点可视化
  var code = dayKLine.value.code
  var data = [];
  var dates = [];
  var volumes = [];
  dayKLine.value.rawData.forEach((x) => {
    var open = x["open"];
    var high = x["high"];
    var low = x["low"];
    var close = x["close"];
    var date = x["date"];
    var volume = x["volume"];
    data.push([open, close, low, high]);
    dates.push(date);
    volumes.push(volume);
  });
  var orderChart = document.getElementById("order-chart");
  var myChart = echarts.init(orderChart);
  var option = viewKLineEchart(dates, data, volumes, code);
  var orderData = plotData.value.orderInfos[code];
  option.series[1]["markLine"] = {
    symbol: ["none", "none"],
    lineStyle: {
      type: "dashed",
      width: 0.5,
    },
    data: [],
  };
  orderData["buy"].forEach((item) => {
    let date = item["date"];
    let price = item["price"];
    let volume = item["volume"];
    option.series[1]["markLine"]["data"].push({
      name: "[buy] price:" + price + " volume:" + volume,
      xAxis: date,
      lineStyle: { color: "red" },
    });
  });
  orderData["sell"].forEach((item) => {
    let date = item["date"];
    let price = item["price"];
    let volume = item["volume"];
    option.series[1]["markLine"]["data"].push({
      name: "[sell] price:" + price + " volume:" + volume,
      xAxis: date,
      lineStyle: { color: "green" },
    });
  });
  myChart.setOption(option);
  window.addEventListener("resize", function () {
    myChart.resize();
  });
  return myChart
}

function initCashEcharts() {
  //总资产曲线
  var cashChart = document.getElementById("cash-charts");
  var myChart = echarts.init(cashChart);
  myChart.clear();
  var option;
  option = {
    title: {
      text: "资产分析",
    },
    legend: {
      data: ["现金", "总资产"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dateIndex.value.data,
      min: "dataMin",
      max: "dataMax",
    },
    yAxis: {
      type: "value",
      axisLabel: { show: true },
      axisLine: { show: true },
      axisTick: { show: true },
      splitLine: { show: true },
    },
    dataZoom: [
      {
        type: "slider",
        start: 20,
        end: 70,
        top: 65,
        height: 20,
        handleIcon:
          "path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "120%",
      },
      {
        type: "inside",
        start: 40,
        end: 70,
        top: 30,
        height: 20,
      },
    ],
    series: [
      {
        name: "现金",
        type: "line",
        data: plotData.value.cash,
      },
      {
        name: "总资产",
        type: "line",
        data: plotData.value.totalAssets,
      },
    ],
  };
  option && myChart.setOption(option);
  window.addEventListener("resize", function () {
    myChart.resize();
  });
  return myChart
}

function initReturnsCharts() {
  //收益率曲线
  console.log("plotData:", plotData.value);
  var chartDom = document.getElementById("dayReturns-chart");
  var myChart = echarts.init(chartDom);
  myChart.clear();
  var option;
  option = {
    title: {
      text: "日收益率曲线",
    },
    legend: {
      data: ["日收益率", "上证指数收益率"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dateIndex.value.data,
      min: "dataMin",
      max: "dataMax",
    },
    yAxis: {
      type: "value",
      axisLabel: { show: true },
      axisLine: { show: true },
      axisTick: { show: true },
      splitLine: { show: true },
    },
    dataZoom: [
      {
        type: "slider",
        start: 20,
        end: 70,
        top: 65,
        height: 20,
        handleIcon:
          "path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
        handleSize: "120%",
      },
      {
        type: "inside",
        start: 40,
        end: 70,
        top: 30,
        height: 20,
      },
    ],
    series: [
      {
        name: "日收益率",
        type: "line",
        data: plotData.value.dayReturns,
      },
      {
        name: "上证指数收益率",
        type: "line",
        data: plotData.value.benchmark,
      },
    ],
  };
  option && myChart.setOption(option);
  window.addEventListener("resize", function () {
    myChart.resize();
  });
  return myChart
}
var tableData = ref({
  rowData: [],
  data: {}, //全部数据
  colNames: [],
  currentRowID: "", //选中行id
});
async function getRecordById() {
  var params = {
    userID: useUserStore().getUser(),
    id: tableData.value.currentRowID,
  };
  var ressult = await _get_record_by_id(params);
  var res = ressult.data
  if (res) {
    returnsTable.value.data = res.data.returnsTable;
    dayKLine.value.nYear = res.data.dayKLine.nYear;
    dayKLine.value.rawData = res.data.dayKLine.rawData;
    dayKLine.value.code = res.data.code;
    plotData.value.benchmark = res.data.benchmark;
    plotData.value.dayReturns = res.data.dayReturns;
    plotData.value.cash = res.data.cash;
    plotData.value.orderInfos = res.data.orderInfos;
    plotData.value.orderStockNames = res.data.orderStockNames;
    strategyList.value.buyStrategys = res.data.buyStrategys;
    strategyList.value.sellStrategys = res.data.sellStrategys;
    tradeLog.value.logQueen = res.data.logQueen;
  }
}
var otherShow = ref(false); //选中后才显示其他组件
async function handleCurrentChange(val) {
  tableData.value.currentRowID = val["id"];
  await getRecordById();
  otherShow.value = true;
  let chart1 = await initCashEcharts()
  let chart2 = await initReturnsCharts()
  let chart3 = await viewOrder()
  chart1.resize()
  chart2.resize()
  chart3.resize()
}
async function delete_record_by_id(){
  if(tableData.value.currentRowID===""){
    ElMessage.warning('请点击需要删除的行!')
    return
  }
  let params = {'userID': useUserStore().getUser(),
      'id': tableData.value.currentRowID}
  let res = await _delete_record_by_id(params)
  if(res){
    if(res.data.status===1){
      ElMessage.success(res.data.msg)
      window.location.reload();
    }
    else{
      ElMessage.error(res.data.msg)
    }
  }
}
async function getBackTradeRecord() {
  //获取回测记录
  var params = { userID: useUserStore().getUser() };
  const res = await _get_record(params);
  if (res) {
    if (res.data["status"] === 1) {
      tableData.value.rowData = res.data.data;
      tableData.value.colNames = res.data.colNames;
      tableData.value.data = res.data.rawData;
    } else {
      ElMessage.error(res.data.msg);
    }
  }
}
const idShow = computed((key) => {
  return key != "id";
});
onActivated(async () => {
  //界面切换时调用
  getBackTradeRecord();
});
onMounted(async () => {
  //挂载页面时调用
  getBackTradeRecord();
});
function setParams() {
  //回测参数配置
  strategyList.value.dialogFormVisible = !strategyList.value.dialogFormVisible;
}
function viewParams(){
  //查看当前策略参数
  let id = tableData.value.currentRowID
  let paramsData = tableData.value.data[id]
  strategyList.value.defaultParams = paramsData['defaultParams']
  strategyList.value.buyChoiceStrategy = paramsData['buyStrategys']
  strategyList.value.sellChoiceStrategy = paramsData['sellStrategys']
  strategyList.value.buySizeChoice = paramsData['buySizeStrategys']
  strategyList.value.sellSizeChoice = paramsData['sellSizeStrategys']
  setParams()
}
</script>

<template>
  <div class="main-container" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="my-strategy">
      <h3>回测记录</h3>
      <el-row>
        <el-col :span="2" :offset="20">
          <el-button @click="viewParams" type="primary">查看参数</el-button>
        </el-col>
        <el-col :span="2">
          <el-button @click="delete_record_by_id" type="primary">删除记录</el-button>
        </el-col>
      </el-row>
      <el-table
        :columns="tableData.colNames"
        :data="tableData.rowData"
        highlight-current-row
        @current-change="handleCurrentChange"
        style="width: 100%"
      >
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column
          v-for="(item, index) in tableData.colNames"
          :key="index"
          :prop="item"
          :label="item"
        ></el-table-column>
      </el-table>
    </div>
    <div :hidden="!otherShow">
      <div class="backtrader-log">
        <h3>回测日志</h3>
        <el-scrollbar height="500px">
          <textarea
            v-model="publishedBooksMessage"
            style="width: 100%; height: 500px; padding-left: 10px"
          ></textarea>
        </el-scrollbar>
      </div>
      <div class="return-overall">
        <el-descriptions
          class="margin-top"
          title="收益概述"
          :column="3"
          :size="400"
          border
        >
          <el-descriptions-item
            v-for="(item, index) in returnsTable.data"
            :key="index"
            :label="item.name"
          >
            {{ item.value }}
          </el-descriptions-item>
        </el-descriptions>
        <div id="dayReturns-chart" style="width: 100%; height: 300px"></div>
      </div>
      <div>
        <div id="cash-charts" style="width: 100%; height: 300px"></div>
      </div>
      <div style="padding-top:20px">
        <h3>买卖点可视化</h3>
        <div id="order-chart" style="width: 100%; height: 1000px"></div>
      </div>
    </div>
    <el-dialog
      v-model="strategyList.dialogFormVisible"
      title="回测参数设置"
      width="850"
      style="overflow: auto; height: 800px"
    >
      <div style="overflow: auto">
        <h3>基础参数配置</h3>
        <el-form :model="strategyList" style="display: inline">
          <el-form-item
            :label="item.name"
            v-for="(item, index) in strategyList.defaultParams"
            :key="index"
          >
            <el-tooltip class="box-item" effect="dark" :content="item.desc">
              <el-input-number
                v-model="item.default"
                :precision="5"
                :step="0.0001"
                :max="1"
                v-if="item.code === 'commission'"
              />
              <el-input-number
                v-model="item.default"
                :precision="5"
                :step="0.0001"
                :max="1"
                v-if="item.code === 'stamp_duty'"
              />
              <el-input
                v-model="item.default"
                v-if="item.code === 'benchmark'"
              />
              <el-input-number
                v-model="item.default"
                :precision="4"
                :step="0.001"
                :max="1"
                v-if="item.code === 'slippage_perc'"
              />
              <el-input-number
                v-model="item.default"
                :step="100"
                v-if="item.code === 'size'"
              />
              <el-input-number
                v-model="item.default"
                :step="100"
                v-if="item.code === 'cash'"
              />
              <el-date-picker
                v-model="item.default"
                type="date"
                placeholder="Pick a day"
                format="YYYY-MM-DD"
                size="100"
                v-if="item.uiType === 'date'"
              />
            </el-tooltip>
          </el-form-item>
        </el-form>
        <div v-if="getBuyStrategyParams.length > 0">
          <h3>买入策略参数配置</h3>
          <el-form :model="strategyList" style="display: inline">
            <el-row v-for="(item, index) in getBuyStrategyParams" :key="index">
              <el-col> {{ item.name }}: </el-col>
              <el-col>
                <el-form-item
                  v-for="(p, index) in item.params"
                  :label="p.name"
                  :key="index"
                  style="padding: 5px"
                  ><el-tooltip class="box-item" effect="dark" :content="p.desc">
                    <el-input type="number" v-model="p.default"></el-input>
                  </el-tooltip>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div v-if="getSellStrategyParams.length > 0">
          <h3>卖出策略参数配置</h3>
          <el-form :model="strategyList" style="display: inline">
            <el-row v-for="(item, index) in getSellStrategyParams" :key="index">
              <el-col> {{ item.name }}: </el-col>
              <el-col>
                <el-form-item
                  v-for="(p, index) in item.params"
                  :label="p.name"
                  :key="index"
                  style="padding: 5px"
                  ><el-tooltip class="box-item" effect="dark" :content="p.desc">
                    <el-input type="number" v-model="p.default"></el-input>
                  </el-tooltip>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
      <div v-if="getBuySizeChoice.params.length > 0">
        <h3>买入仓位策略参数配置</h3>
        <el-form :model="strategyList" style="display: inline">
          <el-row v-for="(item, index) in getBuySizeChoice.params" :key="index">
            <el-col> {{ item.name }}: </el-col>
            <el-col>
              <el-form-item
                v-for="(p, index) in item.params"
                :label="p.name"
                :key="index"
                style="padding: 5px"
                ><el-tooltip class="box-item" effect="dark" :content="p.desc">
                  <el-input type="number" v-model="p.default"></el-input>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div v-if="getSellSizeChoice.params.length > 0">
        <h3>卖出仓位策略参数配置</h3>
        <el-form :model="strategyList" style="display: inline">
          <el-row
            v-for="(item, index) in getSellSizeChoice.params"
            :key="index"
          >
            <el-col> {{ item.name }}: </el-col>
            <el-col>
              <el-form-item
                v-for="(p, index) in item.params"
                :label="p.name"
                :key="index"
                style="padding: 5px"
                ><el-tooltip class="box-item" effect="dark" :content="p.desc">
                  <el-input type="number" v-model="p.default"></el-input>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="setParams">取消</el-button>
          <el-button type="primary" @click="setParams"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>

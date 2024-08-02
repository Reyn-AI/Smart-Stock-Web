<script setup>
import { computed, onActivated, onMounted, ref } from "vue";

import { ElMessage, arrowMiddleware } from "element-plus";
import {
  _get_default_params,
  _save_record,
  _get_size_strategy_list,
  _get_strategy_list,
} from "@/api/backtradeApi";
import { getDayKLineByCode } from "@/api/kLineApi";
import "element-plus/dist/index.css";
import { viewKLineEchart } from "@/utils/kecharts";
import * as echarts from "echarts";
import { useUserStore } from "@/stores";

var fullscreenLoading = ref(false);
var finished = ref(false);
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
  let params = [];
  for (let i = 0; i < strategyList.value.buyChoice.length; i++) {
    let index = strategyList.value.buyChoice[i];
    params.push(strategyList.value.buyStrategys[index]);
  }
  strategyList.value.buyChoiceStrategy = params;
  return params;
});
const getSellStrategyParams = computed(() => {
  //获取选择的卖出策略参数配置
  let params = [];
  for (let i = 0; i < strategyList.value.sellChoice.length; i++) {
    let index = strategyList.value.sellChoice[i];
    params.push(strategyList.value.sellStrategys[index]);
  }
  strategyList.value.sellChoiceStrategy = params;
  return params;
});

const getBuySizeChoice = computed(() => {
  //获取选择的买入仓位策略参数
  let params = {'params':[]} 
  params = strategyList.value.buySizeStrategys[strategyList.value.buySizeChoice]
  return params
});
const getBuyCombineTypeChoice = computed(() => {
  //获取买入组合类型
  let params =  strategyList.value.buyCombineType[strategyList.value.choiceBuyCombineType]
  return params
});
const getSellCombineTypeChoice = computed(() => {
  //获取卖出组合类型
  let params =  strategyList.value.sellCombineType[strategyList.value.choiceSellCombineType]
  return params
});
const getSellSizeChoice = computed(() => {
  //获取选择的卖出仓位策略参数
  let params = {'params':[]} 
  params =  strategyList.value.sellSizeStrategys[strategyList.value.sellSizeChoice]
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
function setParams() {
  //回测参数配置
  strategyList.value.dialogFormVisible = !strategyList.value.dialogFormVisible;
}
const dayKLine = ref({
  rawData: [], //k线数据
  nYear: 2, // 年数
}); //存储日线数据
var viewOrderInfosData = ref({
  code: "", //股票代码
  startDate: "2023-01-01", //开始日期
  endDate: new Date(), //结束日期
});
async function viewOrder() {
  //买卖点可视化
  var code = viewOrderInfosData.value.code;
  var startDate = viewOrderInfosData.value.startDate; //开始日期
  var endDate = viewOrderInfosData.value.endDate; //结束日期
  var res = await getDayKLineByCode(startDate, endDate, code);
  if (res) {
    dayKLine.value.rawData = res.data["rawData"];
  }
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
  console.log("order option:", option);
  myChart.setOption(option);
  window.addEventListener("resize", function () {
    myChart.resize();
  });
}

function initCashEcharts() {
  //总资产曲线
  console.log("plotData:", plotData.value);
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
}
function get_choiced_params(){
  console.log('buySizeChoice', strategyList.value.buySizeChoice)
  console.log('sellSizeChoice', strategyList.value.sellSizeChoice)
  console.log('buyCombine', strategyList.value.choiceBuyCombineType)
  console.log('buyStrategy', strategyList.value.buyChoiceStrategy)
}

function start() {
  //开始回测
  try {
    get_choiced_params()
    fullscreenLoading.value = true;
    tradeLog.value.logQueen = [];
    var params = {
      params: strategyList.value.defaultParams,
      code: strategyList.value.code,
      buyStrategys: getBuyStrategyParams.value,
      sellStrategys: getSellStrategyParams.value,
      sellSizeStrategy: getSellSizeChoice.value,
      buySizeStrategy: getBuySizeChoice.value,
      buyCombineType: getBuyCombineTypeChoice.value,
      sellCombineType: getSellCombineTypeChoice.value,
    };
    console.log('backtrader params:', params)
    if (strategyList.value.code === "") {
      ElMessage.warning("请输入股票代码!");
      fullscreenLoading.value = false;
      return;
    }
    if (strategyList.value.buyChoiceStrategy.length===0 || strategyList.value.sellChoiceStrategy.length===0) {
      ElMessage.warning("请选择买卖策略!");
      fullscreenLoading.value = false;
      return;
    }
    var base_url = "ws://"+import.meta.env.VITE_SERVER_IP+":"+import.meta.env.VITE_SERVER_PORT+"/backtrade/start/";
    var ws = new WebSocket(base_url);
    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify(params));
    };
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      ws.close();
    };
    ws.onmessage = (event) => {
      fullscreenLoading.value = false;
      var data = JSON.parse(event.data);
      if (data["type"] === "msg") {
        //日志
        tradeLog.value.logQueen.push(data["data"]);
      }
      if (data["type"] === "metrics") {
        //指标
        plotData.value.dayReturns = data["dayReturns"]["value"];
        returnsTable.value.data = data["data"];
        plotData.value.benchmark = data["benchmark"];
      }
      if (data["type"] === "plot") {
        //绘制的曲线
        console.log("plot:", data);
        plotData.value.cash = data["cash"];
        plotData.value.totalAssets = data["totalAssets"];
        plotData.value.orderInfos = data["orderInfos"];
        plotData.value.orderStockNames = data["orderStockNames"];
      }
      if (data["type"] === "dateIndex") {
        //dateIndex
        dateIndex.value.data = data["dateIndex"];
      }
      if (data["type"] === "end") {
        initReturnsCharts();
        initCashEcharts();
        ws.close();
        finished.value = true;
      }
      if (data["type"] === "error") {
        ElMessage.error(data['data'])
        fullscreenLoading.value = false;
      }
    };
  } catch (e) {
    fullscreenLoading.value = false;
  }
}
var recordName = ref("");
var showRecordName = ref(false);
async function saveRecord() {
  //保存回测记录
  showRecordName.value = false;
  var data = {
    userID: useUserStore().getUser(),
    logQueen: tradeLog.value.logQueen,
    recordName: recordName.value,
    cash: plotData.value.cash,
    code: strategyList.value.code,
    defaultParams: strategyList.value.defaultParams,
    dayReturns: plotData.value.dayReturns,
    benchmark: plotData.value.benchmark,
    totalAssets: plotData.value.totalAssets,
    dayKLine: { nYear: dayKLine.value.nYear, rawData: dayKLine.value.rawData },
    returnsTable: returnsTable.value.data,
    orderInfos: plotData.value.orderInfos,
    orderStockNames: plotData.value.orderStockNames,
    buyStrategys: strategyList.value.buyChoiceStrategy,
    sellStrategys: strategyList.value.sellChoiceStrategy,
    buySizeStrategys: getBuySizeChoice.value,
    sellSizeStrategys: getSellSizeChoice.value,
    buyCombineType:getBuyCombineTypeChoice.value,
    sellCombineType:getSellCombineTypeChoice.value
    
  };
  console.log("record:", data);
  const res = await _save_record(data);
  if (res) {
    if (res.data["status"] === 1) {
      ElMessage.success(res.data["msg"]);
    } else {
      ElMessage.error(res.data["msg"]);
    }
  }
}

async function get_strategy_list() {
  //获取策略列表
  const res = await _get_strategy_list();
  console.log("strategyList:", res.data);
  if (res) {
    strategyList.value.buyStrategys = res.data.buyStrategys;
    strategyList.value.sellStrategys = res.data.sellStrategys;
    strategyList.value.buyCombineType = res.data.buyCombineType;
    strategyList.value.sellCombineType = res.data.sellCombineType;
  }
}

async function get_default_params() {
  //获取默认回测参数
  const res = await _get_default_params();
  if (res) {
    strategyList.value.defaultParams = res.data.data;
  }
}
async function get_size_strategy() {
  const res = await _get_size_strategy_list();
  if (res) {
    strategyList.value.buySizeStrategys = res.data.buySizeStrategys;
    strategyList.value.sellSizeStrategys = res.data.sellSizeStrategys;
  }
}

onMounted(async () => {
  //挂载页面时调用
  get_default_params();
  get_strategy_list();
  get_size_strategy();
});
</script>

<template>
  <div class="main-container" v-loading="fullscreenLoading">
    <div class="my-strategy">
      <h3>我的策略</h3>
    </div>
    <div class="backtrader-menu">
      <el-form :inline="true" :model="strategyList">
        <el-form-item label="买入策略">
          <el-select
            v-model="strategyList.buyChoice"
            multiple
            style="width: 300px"
            placeholder="Please select"
          >
            <div
              v-for="(item, index) in strategyList.buyStrategys"
              :key="index"
              :value="index"
            >
              <el-tooltip class="box-item" effect="dark" :content="item.desc">
                <el-option :label="item.name" :value="index" />
              </el-tooltip>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="卖出策略">
          <el-select
            v-model="strategyList.sellChoice"
            multiple
            style="width: 300px"
            placeholder="Please select"
          >
            <div
              v-for="(item, index) in strategyList.sellStrategys"
              :key="index"
              :value="index"
            >
              <el-tooltip class="box-item" effect="dark" :content="item.desc">
                <el-option :label="item.name" :value="index" />
              </el-tooltip>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="卖出仓位控制策略">
          <el-select
            v-model="strategyList.sellSizeChoice"
            style="width: 300px"
            placeholder="Please select"
          >
            <div
              v-for="(item, index) in strategyList.sellSizeStrategys"
              :key="index"
              :value="index"
            >
              <el-tooltip class="box-item" effect="dark" :content="item.desc">
                <el-option :label="item.name" :value="index" />
              </el-tooltip>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="买入仓位控制策略">
          <el-select
            v-model="strategyList.buySizeChoice"
            style="width: 300px"
            placeholder="Please select"
          >
            <div
              v-for="(item, index) in strategyList.buySizeStrategys"
              :key="index"
              :value="index"
            >
              <el-tooltip class="box-item" effect="dark" :content="item.desc">
                <el-option :label="item.name" :value="index" />
              </el-tooltip>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="买入策略组合方式">
          <el-select
            v-model="strategyList.choiceBuyCombineType"
            style="width: 300px"
            placeholder="Please select"
          >
            <div
              v-for="(item, index) in strategyList.buyCombineType"
              :key="index"
              :value="index"
            >
              <el-tooltip class="box-item" effect="dark" :content="item.desc">
                <el-option :label="item.name" :value="index" />
              </el-tooltip>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="卖出策略组合方式">
          <el-select
            v-model="strategyList.choiceSellCombineType"
            style="width: 300px"
            placeholder="Please select"
            ><div
              v-for="(item, index) in strategyList.sellCombineType"
              :key="index"
              :value="index"
            >
              <el-tooltip class="box-item" effect="dark" :content="item.desc">
                <el-option :label="item.name" :value="index" />
              </el-tooltip>
            </div>
          </el-select>
        </el-form-item>
        <el-form-item label="股票代码">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="回测股票代码，多个股票间用逗号隔开"
          >
            <el-input
              v-model="strategyList.code"
              placeholder="请输入股票代码"
              style="width: 200px"
            ></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button @click="setParams" type="primary">
            回测参数配置
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="start" type="primary"> 开始回测 </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="showRecordName = true"
            type="primary"
            v-if="finished"
          >
            保存记录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
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
      <h3>资产分析</h3>
      <div id="cash-charts" style="width: 100%; height: 300px"></div>
    </div>
    <div>
      <h3>买卖点可视化</h3>
      <el-form :inline="true">
        <el-form-item label="股票代码">
          <el-select
            v-model="viewOrderInfosData.code"
            style="width: 120px"
            placeholder="选择股票"
          >
            <el-option
              v-for="item in plotData.orderStockNames"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="viewOrderInfosData.startDate"
            type="date"
            placeholder="Pick a day"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            size="100"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="viewOrderInfosData.endDate"
            type="date"
            placeholder="Pick a day"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            size="100"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="viewOrder" type="primary">
            可视化回测买卖点
          </el-button>
        </el-form-item>
      </el-form>
      <div id="order-chart" style="width: 100%; height: 1000px"></div>
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
                value-format="YYYY-MM-DD"
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
            <el-col>
              <el-form-item
                :label="item.name"
                style="padding: 5px"
                ><el-tooltip class="box-item" effect="dark" :content="item.desc">
                  <el-input type="number" v-model="item.default"></el-input>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div v-if="getSellSizeChoice.params.length > 0">
        <h3>卖出仓位策略参数配置</h3>
        <el-form :model="strategyList" style="display: inline">
          <el-row v-for="(item, index) in getSellSizeChoice.params" :key="index">
            <el-col>
              <el-form-item
                :label="item.name"
                :key="index"
                style="padding: 5px"
                ><el-tooltip class="box-item" effect="dark" :content="item.desc">
                  <el-input type="number" v-model="item.default"></el-input>
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
    <el-dialog v-model="showRecordName" title="策略名称" width="400">
      <el-form :model="strategyList">
        <el-form-item label="保存的策略名">
          <el-input v-model="recordName"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRecordName = false">取消</el-button>
          <el-button type="primary" @click="saveRecord"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>

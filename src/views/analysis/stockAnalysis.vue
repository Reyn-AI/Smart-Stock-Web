<script setup>
import { computed, onActivated, onMounted, ref } from "vue";
import { _queryOrder, _queryOrderByIndex} from "@/api/orderApi";
import { _queryFSKLine, _getKLineByFreq } from "@/api/kLineApi";
import { useUserStore } from "@/stores";
import { viewKLineEchart } from "@/utils/kecharts";
import { _taLibCompute, _queryTaLibList } from "@/api/analysisApi";
import moment from 'moment'

// echarts k线图
import * as echarts from "echarts";
import { ElMessage } from "element-plus";

var loadding = ref({
  value: false,
});
var strategyList = ref({
  items: [],
  choice: "",
  descMapping: {},
});
const props = {
  expandTrigger: "hover",
};
async function queryTaLibList() {
  const res = await _queryTaLibList();
  if (res) {
    strategyList.value.items = res.data.data;
    strategyList.value.descMapping = res.data.mappingData;
  }
}
var showContent = ref({
  value: "选择策略",
});
const selectHandleChange = (value) => {
  showContent.value.value =
    strategyList.value.descMapping[value[0] + "_" + value[1]];
};

var kType = ref({
  name: "分时",
  code: "fenshi",
});
var uuidStr = ref({});
const userStore = useUserStore();
const tableData = ref({
  columns: [],
  data: [],
  pageSize: 100, //每页显示数量
  currentPage: 0, //当前页码
  totalNumbers: 0, //总条数
});
const currentRow = ref({
  code: "",
});

async function queryOrderAndAnalysis() {
  let params = {
    userID: userStore.getUser(),
    analysis: true,
    summary: true
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

function handleCurrentChange(val) {
  currentRow.value.code = val["代码"]; //选中的行
}
const columnsView = computed(() => {
  let filterColumns = tableData.value.columns.filter((item) => item != "id");
  return filterColumns;
});
onActivated(async () => {
  queryOrderAndAnalysis();
});

onMounted(async () => {
  //挂载页面时调用
  queryTaLibList();
});

async function getFenShiData() {
  var params = {
    code: currentRow.value.code,
  };
  const res = await _queryFSKLine(params);
  if (res) {
    chartData.value.klineData = res.data.data;
    chartData.value.hourData = res.data.hourData;
    chartData.value.xData = res.data.date;
    chartData.value.meanData = res.data.meanData;
  }
}

const chartData = ref({
  upcolor: "#FF0000", //增长颜色
  upBorderColor: "#8A0000",
  downColor: "#008000", // 下跌颜色
  downBorderColor: "#008F28",
  klineData: [], //k线图数据
  hourData: [], //charts表格小时数据
  xData: [],
  culomnColor: [], //颜色
  culomnValue: [],
  meanData: [], //均线
});

// 初始化交易数据和交易柱状图颜色参数
function initCulomnColor() {
  chartData.value.culomnColor[0] =
    chartData.value.klineData[0]["价格变动"] > 0 ? 1 : -1;
  chartData.value.culomnValue[0] = [
    0,
    chartData.value.klineData[0]["成交量"],
    -1,
  ];
  for (let i = 1; i < chartData.value.klineData.length; i++) {
    chartData.value.culomnColor[i] =
      chartData.value.klineData[i]["成交价格"] >
      chartData.value.klineData[i - 1]["成交价格"]
        ? 1
        : -1;
    chartData.value.culomnValue[i] = [
      i,
      chartData.value.klineData[i]["成交量"],
      chartData.value.culomnColor[i],
      chartData.value.klineData[i]["成交时间"],
    ];
  }
}

const dayKLine = ref({
  rawData: [], //k线数据
  nYear: 2, // 年数
  startDate:'', //k线开始日期
  endDate:new Date(), //k线结束日期
  metricData: [], //talib计算结果
  markPointData: [], //talib指标存储
  viewType: "", //可视化类型 subChart(子图)|overlap(k线图重叠)|markPoint
  returnName: [],
}); //存储日线数据
async function viewDayKLine() {
  //点击可视化k线
  try{
  loadding.value.value = true;
  var startDate =  moment(dayKLine.value.startDate).format('YYYY-MM-DD')
  var endDate =  moment(dayKLine.value.endDate).format('YYYY-MM-DD')
  let params = {
    code: currentRow.value.code,
    startDate:startDate,
    endDate:endDate,
    KLineType:kType.value.code,
    funcInfo: { funcName: strategyList.value.choice },
  };
  console.log('viewDayKLine:', params)
  const result = await _taLibCompute(params);
  if (result.data.code===200) {
    dayKLine.value.rawData = result.data.rawData;
    dayKLine.value.markPointData = result.data.markPointData;
    dayKLine.value.metricData = result.data.metricData;
    dayKLine.value.viewType = result.data.viewType;
    dayKLine.value.returnName = result.data.returnName;
  }
  loadding.value.value = false;}
  catch(e){
    console.log('error:', e)
    loadding.value.value = false;
  }
}

function selectChange() {
  var chartDom = document.getElementById("myechart");
  var myChart = echarts.init(chartDom);
  if (myChart != null && myChart.dispose) {
    myChart.dispose();
  }
}

function initSubChartGrid(option,dates) {
  //初始化tablib指标的子图
  option.grid.push({left:80,
                    right:50,
                    top:620,
                    height:200,
                    id:'subChart'})
  option.yAxis.push(
    {
          scale: true,
          gridIndex: 2,
          axisLabel: { show: true },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
  )
  option.xAxis[1]['show'] = false;
  option.xAxis[1]['splitLine'] = { show: false }
  option.xAxis[1]['axisLabel'] = { show: false }
  option.xAxis[1]['axisTick'] = { show: false }
  option.xAxis.push({
          type: "category",
          data: dates,
          gridIndex:2,
          boundaryGap: false,
          show: true,
          axisLine: { lineStyle: { color: "#777" } },
          axisLabel: {
            formatter: function (value) {
              return echarts.time.format("MM-dd", value);
            },
          },
          min: "dataMin",
          max: "dataMax",
        })
  option.series.push({
          type: "line",
          data: dayKLine.value.metricData,
          smooth: true,
          xAxisIndex: 2,
          yAxisIndex: 2,
          showSymbol: false,
          lineStyle: {
            width: 1,
            color:'#ff0000'
          },
        })
  return option

}

async function viewKLine() {
  try{
  loadding.value.value = true;
  if (kType.value.code === "fenshi") {
    await getFenShiData();
    initCulomnColor();
    initChart();
  } else {
    await viewDayKLine();
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
    var chartDom = document.getElementById("myechart");
    var myChart = echarts.init(chartDom);
    myChart.clear()
    const option1 = viewKLineEchart(
      dates,
      data,
      volumes,
      currentRow.value.code
    );
    option1.series[1]["markPoint"] = {
      data: dayKLine.value.markPointData,
      symbolSize: 20,
      symbolOffset:[0, '50%'],
      // symbolRotate: -180,
      symbol:'arrow',
    };
    if (dayKLine.value.viewType === "subChart") {
      // initSubChart(dates);
      initSubChartGrid(option1,dates)
    }
    if (dayKLine.value.viewType === "overlap") {
      option1.legend.data.push(strategyList.value.choice[1]);
      if (Array.isArray(dayKLine.value.metricData)) {
        //只有一条线的情况
        option1.series.push({
          name: strategyList.value.choice[1],
          type: "line",
          data: dayKLine.value.metricData,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 1,
          },
        });
      } else {
        //多条线的情况如布林线
        for (let [key, value] of Object.entries(dayKLine.value.metricData)) {
          option1.series.push({
            name: key,
            type: "line",
            data: value,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 1,
            },
          });
        }
      }
    }
    myChart.setOption(option1);
    window.addEventListener("resize", function () {
      myChart.resize();
    });
  }
  loadding.value.value = false;}
  catch(e){
    loadding.value.value = false;
  }
}
function initChart() {
  var chartDom = document.getElementById("myechart");
  var myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: currentRow.value.code,
      left: 0,
    },
    legend: {
      top: 30,
      data: ["mean"],
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross", //十字准星指示器
      },
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 10,
      textStyle: {
        color: "#000",
      },
      formatter: function (param) {
        param = param[0];
        if (param.data.length > 5) {
          return [
            "时间: " + param.data[0] + '<hr size=1 style="margin: 3px 0">',
            "价格: " + param.data[1] + "<br/>",
            "价格变动:" + param.data[2] + "<br/>",
            "成交量: " + param.data[3] + "<br/>",
            "成交额: " + param.data[4] + "<br/>",
            "性质: " + param.data[5] + "<br/>",
            "均价：" + param.data[6],
          ].join("");
        } else {
          return [
            "时间: " + param.data[3] + '<hr size=1 style="margin: 3px 0">',
            "成交量:" + param.data[1] + "<br/>",
          ].join("");
        }
      },
    },

    visualMap: {
      type: "piecewise",
      show: false, //不展示map，只应用对应颜色划分逻辑
      seriesIndex: 1, //指定取哪个系列的数据
      dimension: 2,
      // 定义每一段的颜色
      pieces: [
        {
          value: -1,
          color: chartData.value.downColor,
        },
        {
          value: 1,
          color: chartData.value.upcolor,
        },
      ],
    },
    // 图像位置配置
    grid: [
      {
        id: "line",
        left: "10%",
        right: "10%",
        height: "50%",
      },
      {
        id: "bar",
        left: "10%",
        right: "10%",
        top: "65%",
        height: "18%",
      },
    ],
    // 横坐标数据
    xAxis: [
      // 折线图
      {
        type: "category",
        data: chartData.value.xData,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: "dataMin",
        max: "dataMax",
      },
      // 柱状图
      {
        type: "category",
        gridIndex: 1, //x 轴所在的 grid 的索引，默认位于第一个 grid。
        data: chartData.value.xData,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: "dataMin",
        max: "dataMax",
      },
    ],
    // 纵坐标配置
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      {
        scale: true,
        gridIndex: 1, // y 轴所在的 grid 的索引，默认位于第一个 grid
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0, 1],
        start: 50, //展示的数据范围，默认为50%-100%
        end: 100,
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: "slider",
        top: "90%",
        start: 50, //展示的数据范围，默认为50%-100%
        end: 100,
      },
    ],
    series: [
      {
        type: "line",
        data: chartData.value.hourData,
        symbol: "none", //无标记图案
        lineStyle: {
          width: 1,
        },
      },
      {
        name: "Volume",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: chartData.value.culomnValue,
      },
      {
        name: "mean",
        type: "line",
        data: chartData.value.meanData,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
        },
      },
    ],
  };
  myChart.setOption(option);
  //随着屏幕大小调节图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });
}
</script>
<template>
  <div class="main-container" v-loading.fullscreen.lock="loadding.value">
    <div class="order-info">
      <h3>我的交割单</h3>
      <el-table
        :columns="tableData.columns"
        :data="tableData.data"
        style="width: 100%"
        max-height="1024"
        highlight-current-row
        @row-click="handleCurrentChange"
        border
        :fit="true"
        v-loading="tableData.loading"
      >
        <el-table-column type="index" width="60" />
        <el-table-column
          :prop="row"
          :label="row"
          v-for="(row, i) in columnsView"
          width="140"
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
    </div>
    <div class="realtime-k">
      <h3>K线图</h3>
      <el-form :inline="true" :model="currentRow" style="height: 40px">
        <el-form-item label="k线类型: ">
          <el-select
            v-model="kType.code"
            placeholder="请选择k线类型"
            style="width: 150px"
            @change="selectChange"
          >
            <el-option key="fenshi" label="分时" value="fenshi"> </el-option>
            <el-option key="day" label="日线" value="d"> </el-option>
            <el-option key="week" label="周线" value="w"> </el-option>
            <el-option key="month" label="月线" value="m"> </el-option>
            <el-option key="5" label="1分钟" value="5"> </el-option>
            <el-option key="5" label="5分钟" value="5"> </el-option>
            <el-option key="15" label="15分钟" value="15"> </el-option>
            <el-option key="30" label="30分钟" value="30"> </el-option>
            <el-option key="60" label="60分钟" value="60"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" v-if="kType.code != 'fenshi'">
          <el-date-picker
            v-model="dayKLine.startDate"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" v-if="kType.code != 'fenshi'">
          <el-date-picker
            v-model="dayKLine.endDate"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-tooltip :visible="visible">
          <template #content>
            <span>{{ showContent.value }}</span>
          </template>
          <el-form-item label="选择策略：" v-if="kType.code != 'fenshi'">
            <el-cascader
              v-model="strategyList.choice"
              :options="strategyList.items"
              @change="selectHandleChange"
            />
          </el-form-item>
        </el-tooltip>
        <el-form-item label="股票代码：">
          <el-input
            v-model="currentRow.code"
            placeholder="请输入股票代码或点击表格行"
            style="width: 220px"
          ></el-input>
        </el-form-item>
        <el-form-item style="text-align: right">
          <el-button type="primary" @click="viewKLine">查看k线</el-button>
        </el-form-item>
      </el-form>
      <div style="margin-top:40px;">
        <div id="myechart" style="width: 100%; height: 1000px;padding-top:20px;"></div>
        <!-- <div id="subChart" style="width: 100%; height: 300px"></div> -->
      </div>
    </div>
    <div class="analysis-container">
      <h3>买卖点分析</h3>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style lang="scss" scoped></style>

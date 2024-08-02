<template>
  <div
    id="main"
    class="main-container"
    style="width: 100%; height: 100%"
  >
    <h3>策略选股</h3>
    <div class="input-form">
      <el-form :inline="true" :model="form">
        <el-form-item label="策略选择">
          <el-select
            v-model="form.strategy"
            multiple
            style="width: 300px"
            @change="chengeStateType"
            placeholder="Please select"
          >
            <el-option
              v-for="(item, index) in strategyList"
              :key="index"
              :label="item.name"
              :value="index"
            />
          </el-select>
          <el-button @click="openParaForm" class="paramform-class">
            策略参数配置
          </el-button>
        </el-form-item>
        <el-form-item label="市场类型">
          <el-select
            v-model="form.marketList"
            multiple
            style="width: 200px"
            placeholder="Please select"
          >
            <el-option
              v-for="item in marketList"
              :key="item.code"
              :label="item.value"
              :value="item.code"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="queryData" type="primary"> 选股 </el-button>
          <el-button @click="exportExcel" type="primary"> 导出Excel </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-data" v-loading="tableData.loadding">
      <el-tabs class="data-tabs" style="height: 1200px" @tab-click="tabClick">
        <el-tab-pane
          :label="key"
          :name="key"
          v-for="(key, index) in tableData.tabNames"
          :key="index"
        >
          <el-table
            :columns="tableData.columns[index]"
            :data="tableData.data[key]"
            style="width: 100%"
            max-height="1024"
            highlight-current-row
            @row-click="handleCurrentChange"
            border
            :fit="true"
            :id="'table-' + key"
	    v-loading="tableData.loadding"
          >
            <el-table-column
              type="index"
              width="60"
              :index="(val) => indexAdd(key, val)"
            />
            <el-table-column
              :prop="row"
              :label="row"
              v-for="(row, i) in tableData.columns[index]"
              width="100"
              sortable
              :key="i"
            />
          </el-table>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="tableData.totalNumbers[index]['numbers']"
            style="width: 100%; padding-top: 10px"
            :page-size="tabPages.tabInfos[key].pageSize"
            :current-page="tabPages.tabInfos[key].currentPage + 1"
            @current-change="
              (currentPage) => pageCurrentChange(key, currentPage)
            "
          >
          </el-pagination>
        </el-tab-pane>
        <el-empty :image-size="200" v-if="tableData.loading" />
      </el-tabs>
    </div>
    <h3>公司基本面</h3>
    <div class="baseinfo" style="width: 100%; padding: 0, 50px, 0, 50px">
      <el-row :gutter="2">
        <el-col :offset="0" :span="6">
          <el-input
            :label="股票代码"
            v-model="currentRow.code"
            placeholder="请点击上方表格条目或输入股票代码"
          ></el-input>
        </el-col>
        <el-col :offset="0" :span="4"
          ><el-button type="primary" @click="viewBaseInfos"
            >查看公司基本面</el-button
          ></el-col
        >
      </el-row>
      <div style="width: 100%">
        <div v-for="(item, index) in baseInfosTable.data" :key="index">
          <h4>{{ item.name }}</h4>
          <el-table
            :columns="item.columns"
            :data="item.data"
            style="width: 100%"
            max-height="500"
            border
            :fit="true"
          >
            <el-table-column
              :prop="row"
              :label="row"
              v-for="(row, i) in item.columns"
              width="100"
              :key="i"
            />
          </el-table>
        </div>
      </div>
    </div>
    <h3>k线图</h3>
    <div class="stock-image" style="width: 100%; padding-top: 20px">
      <el-form :inline="true" :model="currentRow" style="height: 40px">
        <el-form-item label="k线类型">
          <el-select
            v-model="currentRow.klineType"
            placeholder="请选择k线类型"
            style="width: 200px"
          >
            <el-option
              :key="item.key"
              :label="item.label"
              :value="item.key"
              v-for="item in currentRow.klineTypeOptions"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="k线数量(年)">
          <el-input
            v-model="currentRow.nYear"
            placeholder="请输入可视化的k线时长"
          ></el-input>
        </el-form-item>
        <el-form-item label="股票代码" style="width: 320px">
          <el-input
            v-model="currentRow.code"
            placeholder="请点击上方表格条目或输入股票代码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="viewKLine">查看k线</el-button>
        </el-form-item>
      </el-form>
      <div id="myechart" style="width: 100%; height: 600px"></div>
      <el-empty :image-size="200" v-if="dayKLine.loadding" />
    </div>
    <el-dialog
      v-model="paramsForm.visile"
      @close="closeParaForm"
      :show-close="true"
      title="策略参数配置"
    >
      <el-row v-for="(item, index) in getChoicedStrategys" :key="index">
        <h4>{{ item.name }}</h4>
        <el-col v-for="(p, i) in item.params" :key="i">
          <el-form-item :label="p.name" style="padding: 5px">
            <el-input
              type="number"
              v-model="p.default"
              v-if="p.uiType === 'input'"
            ></el-input>
            <el-select
              v-model="p.default"
              multiple
              style="width: 300px"
              @change="chengeStateType"
              placeholder="Please select"
              v-if="p.uiType === 'select'"
            >
              <el-option :key="index" :label="item.name" :value="item.code" v-for="(item, index) in p.selectChoices"></el-option>
          </el-select>
            <el-select
              v-model="p.default"
              style="width: 300px"
              @change="chengeStateType"
              placeholder="Please select"
              v-if="p.uiType === 'selectDate'"
            >
              <el-option key="day" label="日线" value="d"> </el-option>
              <el-option key="week" label="周线" value="w"> </el-option>
              <el-option key="month" label="月线" value="m"> </el-option>
              <el-option key="5" label="1分钟" value="1"> </el-option>
              <el-option key="5" label="5分钟" value="5"> </el-option>
              <el-option key="15" label="15分钟" value="15"> </el-option>
              <el-option key="30" label="30分钟" value="30"> </el-option>
              <el-option key="60" label="60分钟" value="60"> </el-option>
            </el-select>
            <el-date-picker
              v-model="p.default"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              v-if="p.uiType==='date'"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeParaForm">取消</el-button>
          <el-button type="primary" @click="closeParaForm"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
  _queryStockStageiesHistory,
  _queryStockMarket,
  _selectByHistory,
  _queryListDataByIndex,
} from "@/api/stockApi";
import { _get_stock_base_info } from "@/api/stockInfosApi";
import { _queryDayKLine } from "@/api/kLineApi";
import {utils, writeFile} from 'xlsx'

const uuidStr = ref(); //缓存的id
const form = ref({
  strategy: [],
  // 策略
  strategyParam: [],
  otherType: [],
  marketType: [],
});
const getChoicedStrategys = computed(() => {
  let params = [];
  for (var i = 0; i < form.value.strategy.length; i++) {
    params.push(strategyList.value[form.value.strategy[i]]);
  }
  console.log("choice params:", params);
  return params;
});
const paramsForm = ref({
  visile: false,
  title: "修改参数",
  data: [],
  filterData: [],
});

const strategyList = ref([]);

function handleCurrentChange(val) {
  currentRow.value.code = val["股票代码"]; //选中的行
}

const currentRow = ref({
  code: "",
  nYear: 2,
  klineTypeOptions: [{ label: "日线", key: "day" }], //日线类型
  support: false, //是否可视化撑压线
  klineType: "day",
});
function chengeStateType() {
  paramsForm.value.filterData = paramsForm.value.data.filter((item) =>
    form.value.strategy.includes(item.code)
  );
}

const marketList = ref([]);

const dayKLine = ref({
  rawData: [], //k线数据
  supportData: {}, //支撑压力线数据
  loadding: true,
}); //存储日线数据
async function viewKLine() {
  //点击可视化k线
  try {
    tableData.value.loadding = true;
    let params = {
      code: currentRow.value.code,
      nYear: currentRow.value.nYear,
      support: currentRow.value.support,
    };
    console.log(params);
    const result = await _queryDayKLine(params);
    if (result) {
      dayKLine.value.rawData = result.data.rawData;
      dayKLine.value.supportData = result.data.supportData;
    }
    viewKLineEchart();
    tableData.value.loadding = false;
  } catch (e) {
    tableData.value.loadding = false;
  }
}

function openParaForm() {
  console.log("choice:", form.value.strategy);
  paramsForm.value.visile = true;
}

async function queryStrategyList() {
  const result = await _queryStockStageiesHistory();
  if (result) {
    strategyList.value = [];
    strategyList.value = result.data.data;
  }
}

async function queryMarketList() {
  const result = await _queryStockMarket();
  if (result) {
    marketList.value = [];
    result.data.data.forEach((element) => {
      marketList.value.push({
        value: element.name,
        code: element.code,
      });
    });
  }
}
function closeParaForm() {
  paramsForm.value.visile = false;
}

const tableData = ref({
  data: [],
  tabNames: [],
  columns: [],
  totalNumbers: [],
  loadding: false,
});

const tabPages = ref({
  tabInfos: {}, //存储每页点击的tab以及当前页数
}); //存储tab对应的当前页信息

async function pageCurrentChange(tabName, page) {
  tabPages.value.tabInfos[tabName].currentPage = page - 1; //page从1开始
  let params = {
    uuidStr: uuidStr.value,
    tabName: tabName,
    currentPage: tabPages.value.tabInfos[tabName].currentPage,
    pageSize: tabPages.value.tabInfos[tabName].pageSize,
  };
  const result = await _queryListDataByIndex(params);
  if (result) {
    tableData.value.data[tabName] = result.data.data;
  }
}
async function tabClick(tab) {
  //分页查询
  var tabName = tab.paneName;
  let params = {
    uuidStr: uuidStr.value,
    tabName: tabName,
    currentPage: tabPages.value.tabInfos[tabName].currentPage,
    pageSize: tabPages.value.tabInfos[tabName].pageSize,
  };
  const result = await _queryListDataByIndex(params);
  if (result) {
    tableData.value.data[tabName] = result.data.data;
  }
}

async function queryData() {
  //根据策略选股
  tableData.value.loadding = true;
  let params = {
    strategyParams: getChoicedStrategys.value,
    marketParams: form.value.marketList,
  };
  const result = await _selectByHistory(params);
  tableData.value.loadding = false;
  if (result) {
    tableData.value.columns = result.data.columns; //每个表的列名
    tableData.value.tabNames = result.data.tabNames;
    tableData.value.data = result.data.data;
    tableData.value.totalNumbers = result.data.totalNumbers;
    uuidStr.value = result.data.uuidStr;

    for (var i = 0; i < tableData.value.tabNames.length; i++) {
      //初始化表格信息
      let tabInfo = {
        pageSize: 100,
        currentPage: 0,
        totalNumber: tableData.value.totalNumbers[i]["numbers"],
      };
      tabPages.value.tabInfos[tableData.value.tabNames[i]] = tabInfo;
    }
  }
}

const exportExcel = async () => {
  const wb = utils.book_new();
  for (var i = 0; i < tableData.value.tabNames.length; i++) {
    let tabName = tableData.value.tabNames[i];
    let params = {
      uuidStr: uuidStr.value,
      tabName: tabName,
      currentPage: 0,
      pageSize: 10000,
    };
    let result = await _queryListDataByIndex(params);
    if (result)
    {
      const ws = utils.json_to_sheet(result.data.data);
      utils.book_append_sheet(wb, ws, tabName);
    }
  }
  writeFile(wb, 'data.xlsx');
}

function indexAdd(tabName, index) {
  const page = tabPages.value.tabInfos[tabName].currentPage; // 当前页码
  const pagesize = tabPages.value.tabInfos[tabName].pageSize; // 每页条数
  return index + 1 + page * pagesize;
}
var baseInfosTable = ref({
  data: [],
});
async function viewBaseInfos() {
  //获取基本面信息
  var param = {
    code: currentRow.value.code,
  };
  tableData.value.loadding = true;
  var res = await _get_stock_base_info(param);
  console.log("baseinfos", res.data);
  tableData.value.loadding = false;
  if (res) {
    if (res.data.status == 1) {
      baseInfosTable.value.data = res.data.data;
    } else {
      ElMessage.error(res.data.msg);
    }
  }
}

onMounted(() => {
  queryMarketList();
  queryStrategyList();
});
// echarts k线图
import * as echarts from "echarts/core";
import {
  TitleComponent,
  GraphicComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
} from "echarts/components";
import { BarChart, CandlestickChart, LineChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { ElMessage } from "element-plus";

echarts.use([
  TitleComponent,
  GraphicComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  BarChart,
  CandlestickChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  MarkLineComponent,
  MarkPointComponent,
]);
const viewKLineEchart = () => {
  var chartDom = document.getElementById("myechart", null, {
    width: 1024,
    height: 1000,
  });
  var myChart = echarts.init(chartDom);
  window.addEventListener("resize", function () {
    myChart.resize();
  });
  var option;
  // prettier-ignore
  const colorList = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
  const labelFont = "bold 12px Sans-serif";
  function calculateMA(dayCount, data) {
    let result = [];
    for (let i = 0, len = data.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += +data[i - j][1];
      }
      result.push((sum / dayCount).toFixed(2));
    }
    return result;
  }
  // prettier-ignore
  const dates = []
  const data = []; //open close low high
  const volumes = [];
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
  dayKLine.value.loadding = false;
  // prettier-ignore
  // prettier-ignore

  const dataMA5 = calculateMA(5, data);
  const dataMA10 = calculateMA(10, data);
  const dataMA20 = calculateMA(20, data);
  const dataMA30 = calculateMA(30, data);
  option = {
    animation: false,
    color: colorList,
    title: {
      left: 0,
      text: currentRow.value.code + " K线图",
    },
    legend: {
      top: 30,
      data: ["日K", "MA5", "MA10", "MA20", "MA30"],
    },
    tooltip: {
      trigger: "axis",
      borderRadius: 4,
      textStyle: {
        fontSize: 12,
        color: "#333",
      },
      axisPointer: {
        type: "cross",
      },
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
    xAxis: [
      {
        type: "category",
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#777" } },
        axisLabel: {
          formatter: function (value) {
            return echarts.time.format("MM-dd", value);
          },
        },
        min: "dataMin",
        max: "dataMax",
      },
      {
        type: "category",
        gridIndex: 1,
        data: dates,
        boundaryGap: false,
        splitLine: { show: false },
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#777" } },
        min: "dataMin",
        max: "dataMax",
        // min: dayKLine.value.supportData.support.y1 || 'dataMin',
        // max: dayKLine.value.supportData.resistance.y2 || 'dataMax',
        axisPointer: {
          type: "shadow",
          label: { show: false },
          triggerTooltip: true,
          handle: {
            show: true,
            margin: 30,
            color: "#B80C00",
          },
        },
      },
    ],
    yAxis: [
      {
        scale: true,
        splitNumber: 2,
        axisLine: { lineStyle: { color: "#777" } },
        splitLine: { show: true },
        axisTick: { show: false },
        axisLabel: {
          inside: true,
          formatter: "{value}\n",
        },
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    grid: [
      {
        left: 20,
        right: 20,
        top: 110,
        height: 400,
      },
      {
        left: 20,
        right: 20,
        height: 100,
        top: 400,
      },
    ],
    // graphic: [
    //   {
    //     type: 'group',
    //     left: 'center',
    //     top: 70,
    //     bounding: 'raw',
    //     children: [
    //       {
    //         id: 'MA5',
    //         type: 'text',
    //         style: { fill: colorList[1], font: labelFont },
    //         left: 0
    //       },
    //       {
    //         id: 'MA10',
    //         type: 'text',
    //         style: { fill: colorList[2], font: labelFont },
    //         left: 'center'
    //       },
    //       {
    //         id: 'MA20',
    //         type: 'text',
    //         style: { fill: colorList[3], font: labelFont },
    //         right: 0
    //       },
    //       {
    //         id: 'MA30',
    //         type: 'text',
    //         style: { fill: colorList[4], font: labelFont },
    //         right: 0
    //       }
    //     ],
    //   }
    // ],
    series: [
      {
        name: "Volume",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: {
          color: "#7fbe9e",
        },
        emphasis: {
          itemStyle: {
            color: "#140",
          },
        },
        data: volumes,
      },
      {
        type: "candlestick",
        name: "日K",
        data: data,
        itemStyle: {
          color: "#ef232a",
          color0: "#14b143",
          borderColor: "#ef232a",
          borderColor0: "#14b143",
        },
        emphasis: {
          itemStyle: {
            color: "black",
            color0: "#444",
            borderColor: "black",
            borderColor0: "#444",
          },
        },
        markPoint: {
          label: {
            formatter: function (param) {
              return param != null ? Math.round(param.value) + "" : "";
            },
          },
          data: [
            {
              name: "highest value",
              type: "max",
              valueDim: "highest",
            },
            {
              name: "lowest value",
              type: "min",
              valueDim: "lowest",
            },
            {
              name: "average value on close",
              type: "average",
              valueDim: "close",
            },
          ],
          tooltip: {
            formatter: function (param) {
              return param.name + "<br>" + (param.data.coord || "");
            },
          },
        },
        markLine: {
          symbol: ["none", "none"],
          data: [
            {
              name: "min line on close",
              type: "min",
              valueDim: "close",
            },
            {
              name: "max line on close",
              type: "max",
              valueDim: "close",
            },
          ],
        },
      },
      {
        name: "MA5",
        type: "line",
        data: dataMA5,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
        },
      },
      {
        name: "MA10",
        type: "line",
        data: dataMA10,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
        },
      },
      {
        name: "MA20",
        type: "line",
        data: dataMA20,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
        },
      },
      {
        name: "MA30",
        type: "line",
        data: dataMA30,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
        },
      },
    ],
  };
  if (currentRow.value.support) {
    //绘制支撑压力线
    var supportDict = [
      {
        lineStyle: {
          color: "#FF0000",
          width: 2,
          type: "solid",
        },
        coord: [
          dates[dayKLine.value.supportData.support.x1],
          dayKLine.value.supportData.support.y1,
        ],
      },
      {
        coord: [
          dates[dayKLine.value.supportData.support.x2],
          dayKLine.value.supportData.support.y2,
        ],
        lineStyle: {
          color: "#FF0000",
          width: 2,
          type: "solid",
        },
      },
    ];

    var resistanceDict = [
      {
        lineStyle: {
          color: "#00FF00",
          width: 2,
          type: "solid",
        },
        coord: [
          dates[dayKLine.value.supportData.resistance.x1],
          dayKLine.value.supportData.resistance.y1,
        ],
      },
      {
        coord: [
          dates[dayKLine.value.supportData.resistance.x2],
          dayKLine.value.supportData.resistance.y2,
        ],
        lineStyle: {
          color: "#00FF00",
          width: 2,
          type: "solid",
        },
      },
    ];
    // console.log(resistanceDict)
    option.series[1].markLine.data.push(supportDict);
    option.series[1].markLine.data.push(resistanceDict);
  }
  option && myChart.setOption(option);
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>

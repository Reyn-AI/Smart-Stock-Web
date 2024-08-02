<script setup>
import { ref, onMounted, computed, onActivated } from "vue";
import {
  _queryHQ,
  _queryZS,
  _queryZT,
  _queryDT,
  _queryMarket,
  _queryMarketZDF,
} from "@/api/overallApi";
import { formatCompactNumber } from "@/utils/common";
import {
  ArrowRight,
  CaretBottom,
  CaretTop,
  Warning,
} from "@element-plus/icons-vue";
const formatNumber = computed((num) => {
  return formatCompactNumber(num);
});
import * as echarts from "echarts";

const loadding = ref();

const zsData = ref({
  data: [], //指数数据
  hasData: false,
});
const ztData = ref({
  groupData: [], //按行业分组后的数据
  data: [], //原始数据
  marketValueDistribute: [], //市值统计
  hasData: false,
});

const dtData = ref({
  groupData: [], //按行业分组后的数据
  data: [], //原始数据
  marketValueDistribute: [], //市值统计
  hasData: false,
});

const hqData = ref({
  //每日涨跌停数 行情分析
  data: [],
  hasData: false,
});

async function queryZS() {
  //查询行情
  const result = await _queryZS();
  if (result) {
    zsData.value.data = result.data.data;
    zsData.value.hasData = true;
  }
}

async function queryZT() {
  //查询涨停
  const result = await _queryZT();
  if (result) {
    ztData.value.data = result.data.data;
    ztData.value.groupData = result.data.groupData;
    ztData.value.marketValueDistribute = result.data.marketValueDistribute;
    ztData.value.hasData = true;
  }
}
async function queryDT() {
  //查询跌停
  const result = await _queryDT();
  if (result) {
    dtData.value.data = result.data.data;
    dtData.value.groupData = result.data.groupData;
    dtData.value.marketValueDistribute = result.data.marketValueDistribute;
    dtData.value.hasData = true;
  }
}
var marketOverall = ref({
  dates: [], //y轴
  data: {}, //数据
});
async function queryMarket() {
  //查询开盘价格情况
  const res = await _queryMarket();
  if (res) {
    marketOverall.value.dates = res.data.dates;
    marketOverall.value.data = res.data.data;
    initMarketOpen();
  }
}
const marketZDF = ref({
  xData: [],
  yData: [],
});
async function queryMarketZDF() {
  //查询开盘价格情况
  const res = await _queryMarketZDF();
  if (res) {
    marketZDF.value.xData = res.data.xData;
    marketZDF.value.yData = res.data.yData;
    initMarketZDF();
  }
}
function initMarketOpen() {
  //开盘情况
  var chartDom = document.getElementById("overall-market");
  var myChart = echarts.init(chartDom);
  var option;

  option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        // Use axis to trigger tooltip
        type: "shadow", // 'shadow' as default; can also be 'line' or 'shadow'
      },
    },
    toolbox: {
      show: true,
      orient: "vertical",
      left: "right",
      top: "center",
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ["line", "bar", "stack"] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {},
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: marketOverall.value.dates,
    },
    series: [],
  };
  for (let key in marketOverall.value.data) {
    if (marketOverall.value.data.hasOwnProperty(key)) {
      // 确保属性是对象自身的而不是从原型链继承的
      option["series"].push({
        name: key,
        type: "bar",
        stack: "total",
        label: {
          show: true,
        },
        emphasis: {
          focus: "series",
        },
        data: marketOverall.value.data[key],
      });
    }
  }
  option && myChart.setOption(option);
  //随着屏幕大小调节图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });
}

async function queryHQ() {
  //查询行情
  const result = await _queryHQ();
  if (result) {
    hqData.value.data = result.data.data;
    hqData.value.hasData = true;
  }
}

onMounted(async () => {
  // queryHQ()
  // queryZS()
  ztMainTree();
  dtMainTree();
  queryMarketZDF();
  queryMarket();
  loadding.value = false;
});
onActivated(async () => {
  queryHQ();
  queryZS();
  // await queryZT()
  // await queryDT()
  // ztMainTree()
  // dtMainTree()
  // ztMarketValuePie()
  // dtMarketValuePie()
  loadding.value = false;
});
async function ztMainTree() {
  await queryZT();
  var chartDom = document.getElementById("zt-main-tree");
  var myChart = echarts.init(chartDom);
  //随着屏幕大小调节图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });
  var option = {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: "tree",
        data: [ztData.value.groupData],
        top: "6%",
        left: "2%",
        bottom: "20%",
        right: "2%",
        symbolSize: 6,
        symbol: "emptyCircle",
        orient: "vertical",
        label: {
          position: "top",
          rotate: -50,
          verticalAlign: "middle",
          align: "right",
          fontSize: 10,
          distance: 1,
          formatter: "{b}-{c}",
        },
        leaves: {
          label: {
            position: "bottom",
            rotate: -50,
            verticalAlign: "middle",
            align: "left",
            formatter: "{b}-{c}",
          },
        },
        emphasis: {
          focus: "descendant",
          scale: true,
        },
        expandAndCollapse: true,
        animationDurationUpdate: 750,
      },
    ],
  };
  option && myChart.setOption(option);
  ztMarketValuePie();
}

async function dtMainTree() {
  await queryDT();
  var chartDom = document.getElementById("dt-main-tree");
  var myChart = echarts.init(chartDom);
  //随着屏幕大小调节图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });
  var option = {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: "tree",
        data: [dtData.value.groupData],
        top: "6%",
        left: "2%",
        bottom: "8%",
        right: "2%",
        symbolSize: 6,
        symbol: "emptyCircle",
        orient: "vertical",
        label: {
          position: "top",
          rotate: -50,
          verticalAlign: "middle",
          align: "right",
          fontSize: 10,
          distance: 1,
          formatter: "{b}-{c}",
        },
        leaves: {
          label: {
            position: "bottom",
            rotate: -50,
            verticalAlign: "middle",
            align: "left",
            formatter: "{b}-{c}",
          },
        },
        emphasis: {
          focus: "descendant",
          scale: true,
        },
        expandAndCollapse: true,
        animationDurationUpdate: 750,
      },
    ],
  };
  option && myChart.setOption(option);
  dtMarketValuePie();
}

function ztMarketValuePie() {
  //涨停市值统计
  var chartDom = document.getElementById("zt-main-pie");
  var myChart = echarts.init(chartDom);
  //随着屏幕大小调节图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });
  var option;
  option = {
    title: {
      text: "涨停市值分析",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "涨停市值分析",
        type: "pie",
        radius: "50%",
        data: ztData.value.marketValueDistribute,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  option && myChart.setOption(option);
}

function initMarketZDF() {
  //涨跌幅统计
  var chartDom = document.getElementById("echart-zdf");
  var myChart = echarts.init(chartDom);
  var option;
  //随着屏幕大小调节图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });
  option = {
    tooltip: {
        // 触发类型，默认数据触发，可选为：'item' | 'axis'
        trigger: 'axis'
    },
    xAxis: {
      type: "category",
      data: marketZDF.value.xData,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: marketZDF.value.yData,
        type: "bar",
      },
    ],
  };

  option && myChart.setOption(option);
}

function dtMarketValuePie() {
  //涨停市值统计
  var chartDom = document.getElementById("dt-main-pie");
  var myChart = echarts.init(chartDom);
  var option;
  //随着屏幕大小调节图表
  window.addEventListener("resize", () => {
    myChart.resize();
  });
  option = {
    title: {
      text: "跌停市值分析",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "跌停市值分析",
        type: "pie",
        radius: "50%",
        data: dtData.value.marketValueDistribute,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  option && myChart.setOption(option);
}
</script>

<template>
  <div class="overall-main" v-loading="loadding">
    <div class="zs-main">
      <h2>大盘信息</h2>
      <el-row type="flex" class="card-container" :gutter="3">
        <el-col :span="8" v-for="(item, index) in zsData.data" :key="index">
          <el-card style="max-width: 400px">
            <template #header>
              <div class="card-header">
                <span>{{ item["name"] }}</span>
              </div>
            </template>
            <el-statistic
              :value="item['price']"
              :value-style="{ color: item['change'] > 0 ? 'red' : 'green' }"
            >
            </el-statistic>
            <div class="statistic-footer">
              <div class="footer-item">
                <span>涨跌幅: </span>
                <span :style="{ color: item['change'] > 0 ? 'red' : 'green' }">
                  {{ item["change"] }}%
                  <el-icon>
                    <CaretTop v-if="item['change'] >= 0" />
                    <CaretBottom v-if="item['change'] < 0"></CaretBottom>
                  </el-icon>
                </span>
              </div>
            </div>
            <p>此刻价格: {{ item["price"] }}</p>
            <p>昨日收盘价格: {{ item["pre_close"] }}</p>
            <p>开盘价格: {{ item["open"] }}</p>
            <p>最高价格: {{ item["high"] }}</p>
            <p>最低价格: {{ item["low"] }}</p>
            <p>成交额: {{ item["amount"] }}</p>
            <template #footer>{{ item["date"] }} {{ item["time"] }}</template>
          </el-card>
        </el-col>
      </el-row>
      <el-empty description="description" v-if="!zsData.hasData" />
    </div>
    <div class="hq-main" style="padding-top: 20px">
      <h2>涨跌信息</h2>
      <el-row :gutter="3" type="flex">
        <el-col :span="8" v-for="(item, index) in hqData.data" :key="index">
          <el-card style="max-width: 400px; height: 400px">
            <template #header>
              <div class="card-header">
                <span>{{ item.name }}</span>
              </div>
            </template>
            <div>
              <p v-for="(subItem, i) in item.subItems" :key="i">
                {{ subItem.item }}: {{ subItem.value }}
              </p>
            </div>
            <template #footer
              >{{ item.date.item }}:{{ item.date.value }}</template
            >
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <div id="overall-market" style="width: 100%; height: 400px"></div>
      </el-row>
      <el-empty description="description" v-if="!hqData.hasData" />
    </div>
    <div class="'ztf-main">
      <h2>涨跌幅统计</h2>
      <div
        id="echart-zdf"
        style="width: 100%; height: 400px; text-align: center"
      ></div>
    </div>
    <div class="zt-main">
      <h2>涨停分析</h2>
      <div
        id="zt-main-tree"
        style="width: 100%; height: 1800px; text-align: center"
      ></div>
      <h2>跌停分析</h2>
      <div
        id="dt-main-tree"
        style="width: 100%; height: 1800px; text-align: center"
      ></div>
      <h2>涨/跌停市值分析</h2>
      <el-row :gutter="2">
        <el-col :span="12">
          <el-card style="max-width: 800px">
            <template #header>
              <div class="card-header">
                <span> 涨停股市值统计</span>
              </div>
            </template>
            <div id="zt-main-pie" style="width: 800px; height: 600px"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card style="max-width: 800px">
            <template #header>
              <div class="card-header">
                <span> 跌停股市值统计</span>
              </div>
            </template>
            <div id="dt-main-pie" style="width: 800px; height: 600px"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped></style>

import * as echarts from 'echarts';

const viewKLineEchart = (dates, data, volumes, name) => {
    // var chartDom = document.getElementById(id, null, {
    //   width: 1024,
    //   height: 1000,
    // });

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
    // const dates = []
    // const data = []; //open close low high
    // const volumes = [];
    // dayKLine.value.rawData.forEach((x) => {
    //   var open = x["open"];
    //   var high = x["high"];
    //   var low = x["low"];
    //   var close = x["close"];
    //   var date = x["date"];
    //   var volume = x["volume"];
    //   data.push([open, close, low, high]);
    //   dates.push(date);
    //   volumes.push(volume);
    // });
    // dayKLine.value.loadding = false;
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
        text: name,
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
          xAxisIndex:[0,1,2]
        },
        {
          type: "inside",
          start: 40,
          end: 70,
          top: 30,
          height: 20,
          xAxisIndex:[0,1,2]
        },
      ],
      xAxis: [
        {
          type: "category",
          data: dates,
          show: false,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#777" } },
          axisLabel: {
            formatter: function (value) {
              return echarts.time.format("MM-dd", value);
            },
          },
          min: "dataMin",
          max: "dataMax",
          axisLine: { show: false }, // 不显示坐标轴线
          axisTick: { show: false }, //不显示坐标轴刻度线
          splitLine: { show: false }, // 不显示网格线
        },
        {
          type: "category",
          gridIndex: 1,
          data: dates,
          boundaryGap: false,
          splitLine: { show: true },
          axisLabel: { show: true },
          axisTick: { show: true },
          axisLine: { lineStyle: { color: "#777" } },
          min: "dataMin",
          max: "dataMax",
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
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            inside: false,
            // formatter: "{value}\n",
          },
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: true },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      grid: [
        {
          left: 80,
          right: 50,
          top: 'top',
          height: 450,
        },
        {
          left: 80,
          right: 50,
          height: 150,
          top: 480,
        },
      ],
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
    return option
  };

export { viewKLineEchart }

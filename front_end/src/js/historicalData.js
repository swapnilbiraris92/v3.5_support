// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta
import MoonLoader from 'vue-spinner/src/MoonLoader.vue'
import Chart from 'chart.js';
import performanceChartData from '../js/performance-chart-data.js';
import availabilityChartData from '../js/availability-chart-data.js';
import qualityChartData from '../js/quality-chart-data.js';
import numeral from 'numeral';
import axios from "axios";
import moment from 'moment'
import Timeselector from 'vue-timeselector';
import Datepicker from 'vuejs-datepicker';
import config from './config.js';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '../css/sidebarstyle.css'
import '../css/custom.css'
import '../css/modal.css'
var datareq = [];
export default {
  name: 'xyz',
  components: {
    Timeselector,
    Datepicker,
    MoonLoader,
  },
  props: {
    machineList: {
      type: Array,
    },
    langvar: {
      type: String,
    }
  },
  data() {
    return {
      input: {
        duration: "",
        database_name: "hmmasterdbcs",
        machineList: "",
        prev_next_counter: 0,
        custom_start_time: null,
        custom_end_time: null,
        custom_start_date: null,
        custom_end_date: null,
      },
      disabledFn: {
        customPredictor(date) {
          if (date.getDay() !== 1 || date > new Date()) {
            return true;
          }
        }
      },
      blurConfig: {
        isBlurred: false,
        opacity: 0.1,
        filter: "blur(1.2px)",
        transition: "all .3s linear"
      },
      state: {
        disabledDates: {
          customPredictor(date) {
            if (date > new Date()) {
              return true;
            }
          }
        }
      },
      status: {"1":0,
        "2":0,
        "3":0,
        "4":0,
        "5":0,
        "6":0
      },
      data_source_flag: false,
      scale_yaxis_operation_value: 24,
      cumulative_operation_time: "（選択設備・期間の総計）",
      average_operation_time: "（1台あたり, 1時間毎）",
      cumulative_downtime_time: "（選択設備・期間の総計）",
      average_downtime_time: "（1台あたり, 1時間毎）",
      customwarning01: false,
      x_day_label: "時刻",
      x_month_label: "日付",
      x_year_label: "月",
      hr: '時間',
      min: '分',
      days: '日',
      start_time_to_update: new Date(),
      value: new Date(),
      value2: new Date(2016, 9, 10, 18, 40),
      operation_rate_circle: 0,
      operation_circle_cumulative: 0,
      operation_circle: 0,
      downtime_circle: 0,
      downtime_circle_cumulative: 0,
      downtime_rate_circle: 0,
      loading: false,
      color: '#000080',
      size: '25px',
      radius: '100%',
      st: null,
      et: null,
      operation_time: true,
      down_time: false,
      operation_rate: false,
      chang_day_time: false,
      visibilityNext: false,
      visibilityPrev: false,
      start_time: null,
      start_date: new Date(),
      end_time: null,
      end_date: new Date(),
      response: "",
      duration: "today",
      todayPrimary: true,
      todayDefault: false,
      dayPrimary: false,
      dayDefault: true,
      weekPrimary: false,
      weekDefault: true,
      monthPrimary: false,
      monthDefault: true,
      sixMonthPrimary: false,
      sixMonthDefault: true,
      yearPrimary: false,
      yearDefault: true,
      customPrimary: false,
      customDefault: true,
      performanceChartData: performanceChartData,
      availabilityChartData: availabilityChartData,
      qualityChartData: qualityChartData,
      ord: performanceChartData,
      otd: availabilityChartData,
      dtd: qualityChartData,
      config: config,
      start_time_to_set_hr: '',
      start_time_to_set_min: '',
      end_time_to_set_hr: '',
      end_time_to_set_min: '',
    }
  },
  methods: {
    customMonthFormatter(date) {
      return moment(date).format('MMM YYYY');
    },
    customYearFormatter(date) {
      return moment(date).format('YYYY');
    },
    createChart(chartId, chartData) {
      const ctx = document.getElementById(chartId);
      const myChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    },
    createPerformanceChart(chartId, chartData) {
      const ctx = document.getElementById(chartId);
      this.performanceChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    },
    createAvailabilityChart(chartId, chartData) {
      const ctx = document.getElementById(chartId);
      this.availabilityChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    },
    createQualityChart(chartId, chartData) {
      var ctx = document.getElementById(chartId);
      ctx = document.getElementById(chartId);
      this.qualityChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: chartData.options,
      });
    },
    chartUpdate() {
      
      if (this.langvar == 'ja') {
        this.hr = '時間';
        this.min = '分';
        this.days = '日';
        this.x_day_label = "時刻";
        this.x_month_label = "日付";
        this.x_year_label = "月";
        this.cumulative_operation_time = "（選択設備・期間の総計）";
        this.cumulative_downtime_time = "（選択設備・期間の総計）";
      } else {
        this.hr = 'Hours';
        this.min = 'Minutes';
        this.days = 'Days';
        this.x_day_label = "Hour";
        this.x_month_label = "Day";
        this.x_year_label = "Month";
        this.cumulative_operation_time = "Selected Machines and Time";
        this.cumulative_downtime_time = "Selected Machines and Time";
      }
      this.input.duration = this.duration;
      this.input.machineList = this.machineList.sort();
      if (localStorage.data_source_flag ) {
        this.input.database_name = "hmmasterdbcs";
      }
      if (localStorage.data_source_flag && (localStorage.data_source_flag == 'true') ) {
        this.input.database_name = "hmmasterdbcs";
      }
      axios.get("/getTimeSetting/getMachineNames").then((response) => {
        var machineNamesList = response.data;
        axios({ method: "POST", "url": "/outputdata", "data": this.input, "headers": { "content-type": "application/json" } }).then(res => {
          var dummyAvailabilityData = [];
          var dummyPerformanceData = [];
          var dummyQualityData = [];
          var result = {};
          result.data = res.data.displayData
          this.st = moment(result.data.start_time).format("Y-MM-DD HH:mm");
          this.et = moment(result.data.end_time).format("Y-MM-DD HH:mm");

          var machinList = {
            "4-01": this.findMachineName(machineNamesList, '4-01'),
            "4-02": this.findMachineName(machineNamesList, '4-02'),
            "4-03": this.findMachineName(machineNamesList, '4-03'),
            "4-05": this.findMachineName(machineNamesList, '4-05'),
            "4-06": this.findMachineName(machineNamesList, '4-06'),
            "4-07": this.findMachineName(machineNamesList, '4-07'),
            "4-09": this.findMachineName(machineNamesList, '4-09'),
            "4-C1": this.findMachineName(machineNamesList, '4-C1')
          }

          var bg_color = {
            "4-01": 'rgba(50, 115, 220, 0.3)',
            "4-02": 'rgba(255, 0, 0, 0.3)',
            "4-03": 'rgba(0, 255, 0, 0.3)',
            "4-05": 'rgba(0, 0, 255, 0.3)',
            "4-06": 'rgba(0, 0, 0, 0.3)',
            "4-07": 'rgba(128, 0, 128, 0.3)',
            "4-09": 'rgba(255, 0, 255, 0.3)',
          }
          var b_color = {
            "4-01": 'rgba(50, 115, 220, 0.5)',
            "4-02": 'rgba(255, 0, 0, 0.5)',
            "4-03": 'rgba(0, 255, 0, 0.5)',
            "4-05": 'rgba(0, 0, 255, 0.5)',
            "4-06": 'rgba(0, 0, 0, 0.5)',
            "4-07": 'rgba(128, 0, 128, 0.5)',
            "4-09": 'rgba(255, 0, 255, 0.5',
            "4-C1": 'rgba(0, 0, 255, 0.5)',
          }
          this.response = result.data;
          this.operation_circle_cumulative = this.hhmmss(result.data.circle_value[0]);
          this.operation_circle = this.hhmmss(result.data.circle_value[1]);
          this.downtime_circle_cumulative = this.hhmmss(result.data.circle_value[2]);
          this.downtime_circle = this.hhmmss(result.data.circle_value[3]);
          if (result.data.circle_value[4] > 0) {
            this.operation_rate_circle = parseFloat((result.data.circle_value[4]).toFixed(1));
          } else {
            this.operation_rate_circle = 0
          }
          if (result.data.circle_value[5] > 0) {
            this.downtime_rate_circle = parseFloat((result.data.circle_value[5]).toFixed(1));
          } else {
            this.downtime_rate_circle = 0
          }
          var keys = Object.keys(result.data);
          keys.forEach(function (key) {
            if (key == 'labels' || key == 'y_axis_operation_max_label' || key == 'y_axis_downtime_max_label' || key == 'y_axis_operation_rate_max_label' || key == 'machine_list' || key == 'x_axis_label' || key == 'circle_value' || key == 'start_time' || key == 'end_time') {
            } else {
              var keys2 = Object.keys(result.data[key]);
              keys2.forEach(function (key2) {
                switch (key2) {
                  case "operation":
                    if (key == '4-C1') {
                      dummyPerformanceData.push({
                        type: 'line',
                        label: machinList[key],
                        data: result.data[key][key2],
                        borderColor: b_color[key],
                        fill: false,
                        lineTension: 0,
                        pointStyle: 'line',
                      });
                    } else {
                      dummyPerformanceData.push({
                        label: machinList[key],
                        data: result.data[key][key2],
                        backgroundColor: bg_color[key],
                        borderColor: b_color[key],
                        borderWidth: 1,
                        pointStyle: 'rect',
                        boxWidth: 40
                      });
                    }
                    break;
                  case "downtime":
                    if (key == '4-C1') {
                      dummyAvailabilityData.push({
                        type: 'line',
                        label: machinList[key],
                        data: result.data[key][key2],
                        borderColor: b_color[key],
                        fill: false,
                        lineTension: 0,
                        pointStyle: 'line',
                      });
                    } else {
                      dummyAvailabilityData.push({
                        label: machinList[key],
                        data: result.data[key][key2],
                        backgroundColor: bg_color[key],
                        borderColor: b_color[key],
                        borderWidth: 1,
                        pointStyle: 'rect',
                        boxWidth: 40
                      });
                    }
                    break;
                  case "operation_rate":
                    if (key == '4-C1') {
                      dummyQualityData.push({
                        type: 'line',
                        label: machinList[key],
                        data: result.data[key][key2],
                        borderColor: b_color[key],
                        fill: false,
                        lineTension: 0,
                        pointStyle: 'line',
                      });
                    } else {
                      dummyQualityData.push({ // one line graph
                        label: machinList[key],
                        data: result.data[key][key2],
                        backgroundColor: bg_color[key],
                        borderColor: b_color[key],
                        borderWidth: 1,
                        pointStyle: 'rect',
                        boxWidth: 40
                      });
                    }
                    break;
                }
              });
            }
          });
          this.performanceChartData.options.scales.yAxes[0].ticks.max = result.data.y_axis_operation_max_label
          this.availabilityChartData.options.scales.yAxes[0].ticks.max = result.data.y_axis_downtime_max_label
          this.qualityChartData.options.scales.yAxes[0].ticks.max = result.data.y_axis_operation_rate_max_label
          if (result.data.duration === 'day') {
            this.performanceChartData.options.scales.yAxes[0].scaleLabel.labelString = this.min
            this.availabilityChartData.options.scales.yAxes[0].scaleLabel.labelString = this.min
            if (this.langvar == 'en') {
              this.average_operation_time = "Per Machine Per Hour";
              this.average_downtime_time = "Per Machine Per Hour";
            } else {
              this.average_operation_time = "（1台あたり, 1時間毎）";
              this.average_downtime_time = "（1台あたり, 1時間毎）";
            }
            //this.performanceChartData.options.scales.yAxes[0].ticks.max = 60
            //this.availabilityChartData.options.scales.yAxes[0].ticks.max = 60
            //this.qualityChartData.options.scales.yAxes[0].ticks.max = 100
          }
          this.performanceChartData.data.labels = this.response.x_axis_label;
          this.performanceChartData.data.datasets = dummyPerformanceData;
          this.createPerformanceChart('performance-chart', this.performanceChartData);
          this.performanceChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_day_label
          this.availabilityChartData.data.labels = this.response.x_axis_label;
          this.availabilityChartData.data.datasets = dummyAvailabilityData;
          this.qualityChartData.data.labels = this.response.x_axis_label;
          this.qualityChartData.data.datasets = dummyQualityData;
        }, error => {
          console.error(error);
        });
      })
    },
    today: function (event) {
      this.todayPrimary = true;
      this.todayDefault = false;
      this.dayPrimary = false;
      this.dayDefault = true;
      this.weekPrimary = false;
      this.weekDefault = true;
      this.monthPrimary = false;
      this.monthDefault = true;
      this.sixMonthPrimary = false;
      this.sixMonthDefault = true;
      this.yearPrimary = false;
      this.yearDefault = true;
      this.customPrimary = false;
      this.customDefault = true;
      this.duration = "today";
      this.input.prev_next_counter = 0;
      this.visibilityPrev = false;
      this.visibilityNext = false;
      this.chang_day_time = false;
      this.greet();
    },
    day: function (event) {
      this.$refs.dayModal.hide()
      this.todayPrimary = false;
      this.todayDefault = true;
      this.dayPrimary = true;
      this.dayDefault = false;
      this.weekPrimary = false;
      this.weekDefault = true;
      this.monthPrimary = false;
      this.monthDefault = true;
      this.sixMonthPrimary = false;
      this.sixMonthDefault = true;
      this.yearPrimary = false;
      this.yearDefault = true;
      this.customPrimary = false;
      this.customDefault = true;
      this.duration = "day";
      this.input.prev_next_counter = 0;
      this.visibilityPrev = true;
      this.visibilityNext = false;
      this.chang_day_time = true;
      this.greet();
    },
    week: function (event) {
      this.$refs.weekModal.hide()
      this.todayPrimary = false;
      this.todayDefault = true;
      this.dayPrimary = false;
      this.dayDefault = true;
      this.monthPrimary = false;
      this.monthDefault = true;
      this.sixMonthPrimary = false;
      this.sixMonthDefault = true;
      this.yearPrimary = false;
      this.yearDefault = true;
      this.customPrimary = false;
      this.customDefault = true;
      this.weekDefault = false,
        this.weekPrimary = true;
      this.duration = "week";
      this.input.prev_next_counter = 0;
      this.visibilityPrev = true;
      this.visibilityNext = false;
      this.chang_day_time = true;
      this.greet();
    },
    month: function (event) {
      this.$refs.monthModal.hide()
      this.todayPrimary = false;
      this.todayDefault = true;
      this.dayPrimary = false;
      this.dayDefault = true;
      this.weekPrimary = false;
      this.weekDefault = true;
      this.monthPrimary = true;
      this.monthDefault = false;
      this.sixMonthPrimary = false;
      this.sixMonthDefault = true;
      this.yearPrimary = false;
      this.yearDefault = true;
      this.customPrimary = false;
      this.customDefault = true;
      this.duration = "month";
      this.input.prev_next_counter = 0;
      this.visibilityPrev = true;
      this.visibilityNext = false;
      this.chang_day_time = true;
      this.greet();
    },
    sixMonth: function (event) {
      this.$refs.sixmonthModal.hide()
      this.todayPrimary = false;
      this.todayDefault = true;
      this.dayPrimary = false;
      this.dayDefault = true;
      this.weekPrimary = false;
      this.weekDefault = true;
      this.monthPrimary = false;
      this.monthDefault = true;
      this.yearPrimary = false;
      this.yearDefault = true;
      this.customPrimary = false;
      this.customDefault = true;
      this.sixMonthPrimary = true;
      this.sixMonthDefault = false;
      this.duration = "sixMonths";
      this.input.prev_next_counter = 0;
      this.visibilityPrev = true;
      this.visibilityNext = false;
      this.chang_day_time = true;
      this.greet();
    },
    year: function (event) {
      this.stophdTimeDataFetch()
      this.$refs.yearModal.hide()
      this.todayPrimary = false;
      this.todayDefault = true;
      this.dayPrimary = false;
      this.dayDefault = true;
      this.weekPrimary = false;
      this.weekDefault = true;
      this.monthPrimary = false;
      this.monthDefault = true;
      this.sixMonthPrimary = false;
      this.sixMonthDefault = true;
      this.customPrimary = false;
      this.customDefault = true;
      this.yearPrimary = true;
      this.yearDefault = false;
      this.duration = "year";
      this.input.prev_next_counter = 0;
      this.visibilityPrev = true;
      this.visibilityNext = false;
      this.chang_day_time = true;
      this.greet();
    },
    day_modal: function (event) {
      this.$refs.dayModal.show();
    },
    week_modal: function (event) {
      this.$refs.weekModal.show();
    },
    historicalDataFetch: function () {
      if (this.duration === 'today') {
        this.greet();
      }
    },
    month_modal: function (event) {
      this.$refs.monthModal.show();
    },
    sixmonth_modal: function (event) {
      this.$refs.sixmonthModal.show();
    },
    year_modal: function (event) {
      this.$refs.yearModal.show();
    },
    custom: function (event) {
      this.todayPrimary = false;
      this.todayDefault = true;
      this.dayPrimary = false;
      this.dayDefault = true;
      this.weekPrimary = false;
      this.weekDefault = true;
      this.monthPrimary = false;
      this.monthDefault = true;
      this.sixMonthPrimary = false;
      this.sixMonthDefault = true;
      this.yearPrimary = false;
      this.yearDefault = true;
      this.customPrimary = true;
      this.customDefault = false;
      this.duration = "custom";
      this.visibilityNext = false;
      this.visibilityPrev = false;
      this.input.prev_next_counter = 0;
      this.$refs.customModal.show();
      this.chang_day_time = true;
    },
    hideCustomModal: function (event) {
      if (this.start_date > this.end_date) {
        this.customwarning01 = true
      } else {
        this.customwarning01 = false
        this.$refs.customModal.hide()
        this.greet()
      }
    },
    prev() {
      this.input.prev_next_counter += 1;
      if (this.input.prev_next_counter != 0) {
        this.visibilityNext = true;
      }
      this.greet();
    },
    next() {
      this.input.prev_next_counter -= 1;
      if (this.input.prev_next_counter == 0) {
        this.visibilityNext = false;
      }
      this.greet();
    },
    pad(num) {
      return ("0" + num).slice(-2);
    },
    hhmmss(secs) {
      if (secs > 0) {
        secs = parseInt(secs)
        var minutes = Math.floor(secs / 60);
        secs = secs % 60;
        var hours = Math.floor(minutes / 60)
        minutes = minutes % 60;
      } else {
        secs = parseInt(secs)
        var minutes = 0;
        var hours = 0;
      }
      if (this.langvar == 'en') {
        return (hours + " hr " + this.pad(minutes) + " min");
      } else {
        return (hours + " 時間 " + this.pad(minutes) + " 分");
      }
    },
    operation_rate_fun() {
      var flag = 0
      this.operation_rate = true;
      this.operation_time = false;
      this.down_time = false;
      if (this.qualityChart) {
        this.qualityChart.destroy()
      }
      try {
        this.createQualityChart('quality-chart', this.qualityChartData);
        var flag = 1
        if (this.blurConfig.isBlurred == true) {
          this.blurConfig.isBlurred = !this.blurConfig.isBlurred;
        }
      }
      catch (e) {
        console.log("in catch", e)
      }
      if (flag == 0) {
        setTimeout(this.operation_rate_fun, 300)
      }

    },
    down_time_fun() {
      var flag = 0
      this.operation_rate = false;
      this.operation_time = false;
      this.down_time = true;
      if (this.availabilityChart) {
        this.availabilityChart.destroy()
      }
      try {
        this.createAvailabilityChart('availability-chart', this.availabilityChartData);
        var flag = 1
        if (this.blurConfig.isBlurred == true) {
          this.blurConfig.isBlurred = !this.blurConfig.isBlurred;
        }
      }
      catch (e) {
        console.log("in catch")
      }
      if (flag == 0) {
        setTimeout(this.down_time_fun, 300)
      }

    },
    operation_time_fun() {
      var flag = 0
      this.operation_rate = false;
      this.operation_time = true;
      this.down_time = false;
      if (this.performanceChart) {
        this.performanceChart.destroy()
      }
      try {
        this.createPerformanceChart('performance-chart', this.performanceChartData);
        var flag = 1
        if (this.blurConfig.isBlurred == true) {
          this.blurConfig.isBlurred = !this.blurConfig.isBlurred;
        }
      }
      catch (e) {
        console.log("in catch")
      }
      if (flag == 0) {
        setTimeout(this.operation_time_fun, 300)
      }
    },

    scale_yaxis_operation() {
      if (this.operation_time) {
        this.scale_yaxis_operation_value = this.performanceChartData.options.scales.yAxes[0].ticks.max
      } else if (this.down_time) {
        this.scale_yaxis_operation_value = this.availabilityChartData.options.scales.yAxes[0].ticks.max
      } else {
        this.scale_yaxis_operation_value = this.qualityChartData.options.scales.yAxes[0].ticks.max
      }

      this.$refs.scale_yaxis_operation_modal.show()
    },

    hide_scale_yaxis_operation() {
      if (this.scale_yaxis_operation_value >= 1) {
        if (this.operation_time) {
          this.performanceChartData.options.scales.yAxes[0].ticks.max = this.scale_yaxis_operation_value
          this.operation_time_fun();
        } else if (this.down_time) {
          this.availabilityChartData.options.scales.yAxes[0].ticks.max = this.scale_yaxis_operation_value
          this.down_time_fun();
        } else {
          this.qualityChartData.options.scales.yAxes[0].ticks.max = this.scale_yaxis_operation_value
          this.operation_rate_fun()
        }
        this.$refs.scale_yaxis_operation_modal.hide()
      }
    },

    changeTimeSetting() {
      this.$refs.timeSettingModal.show()
    },
    hideTimeSettingModal: function (event) {
      this.$refs.timeSettingModal.hide()
      this.loading = true;
      this.blurConfig.isBlurred = !this.blurConfig.isBlurred;

      if (document.getElementById('1').checked) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_1;
        this.start_time_to_set_min = this.start_time_to_set_min_1;
        this.end_time_to_set_hr = this.end_time_to_set_hr_1;
        this.end_time_to_set_min = this.end_time_to_set_min_1;
        this.status["1"] = 1;
        this.status["2"] = 0;
        this.status["3"] = 0;
        this.status["4"] = 0;
        this.status["5"] = 0;
        this.status["6"] = 0;
        
      }
      if (document.getElementById('2').checked) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_2;
        this.start_time_to_set_min = this.start_time_to_set_min_2;
        this.end_time_to_set_hr = this.end_time_to_set_hr_2;
        this.end_time_to_set_min = this.end_time_to_set_min_2;
        this.status["1"] = 0;
        this.status["2"] = 1;
        this.status["3"] = 0;
        this.status["4"] = 0;
        this.status["5"] = 0;
        this.status["6"] = 0;
        
      }
      if (document.getElementById('3').checked) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_3;
        this.start_time_to_set_min = this.start_time_to_set_min_3;
        this.end_time_to_set_hr = this.end_time_to_set_hr_3;
        this.end_time_to_set_min = this.end_time_to_set_min_3;
        this.status["1"] = 0;
        this.status["2"] = 0;
        this.status["3"] = 1;
        this.status["4"] = 0;
        this.status["5"] = 0;
        this.status["6"] = 0;
        
      }
      if (document.getElementById('4').checked) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_4;
        this.start_time_to_set_min = this.start_time_to_set_min_4;
        this.end_time_to_set_hr = this.end_time_to_set_hr_4;
        this.end_time_to_set_min = this.end_time_to_set_min_4;
        this.status["1"] = 0;
        this.status["2"] = 0;
        this.status["3"] = 0;
        this.status["4"] = 1;
        this.status["5"] = 0;
        this.status["6"] = 0;
        
      }
      if (document.getElementById('5').checked) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_5;
        this.start_time_to_set_min = this.start_time_to_set_min_5;
        this.end_time_to_set_hr = this.end_time_to_set_hr_5;
        this.end_time_to_set_min = this.end_time_to_set_min_5;
        this.status["1"] = 0;
        this.status["2"] = 0;
        this.status["3"] = 0;
        this.status["4"] = 0;
        this.status["5"] = 1;
        this.status["6"] = 0;
        
      }
      if (document.getElementById('6').checked) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_6;
        this.start_time_to_set_min = this.start_time_to_set_min_6;
        this.end_time_to_set_hr = this.end_time_to_set_hr_6;
        this.end_time_to_set_min = this.end_time_to_set_min_6;
        this.status["1"] = 0;
        this.status["2"] = 0;
        this.status["3"] = 0;
        this.status["4"] = 0;
        this.status["5"] = 0;
        this.status["6"] = 1;
        
      }

      let data = {
        start_time_to_set: this.start_time_to_set_hr + ":" + this.start_time_to_set_min + ":00",
        end_time_to_set: this.end_time_to_set_hr + ":" + this.end_time_to_set_min + ":00",
        start_time_to_set_1: this.start_time_to_set_hr_1 + ":" + this.start_time_to_set_min_1 + ":00",
        end_time_to_set_1: this.end_time_to_set_hr_1 + ":" + this.end_time_to_set_min_1 + ":00",
        start_time_to_set_2: this.start_time_to_set_hr_2 + ":" + this.start_time_to_set_min_2 + ":00",
        end_time_to_set_2: this.end_time_to_set_hr_2 + ":" + this.end_time_to_set_min_2 + ":00",
        start_time_to_set_3: this.start_time_to_set_hr_3 + ":" + this.start_time_to_set_min_3 + ":00",
        end_time_to_set_3: this.end_time_to_set_hr_3 + ":" + this.end_time_to_set_min_3 + ":00",
        start_time_to_set_4: this.start_time_to_set_hr_4 + ":" + this.start_time_to_set_min_4 + ":00",
        end_time_to_set_4: this.end_time_to_set_hr_4 + ":" + this.end_time_to_set_min_4 + ":00",
        start_time_to_set_5: this.start_time_to_set_hr_5 + ":" + this.start_time_to_set_min_5 + ":00",
        end_time_to_set_5: this.end_time_to_set_hr_5 + ":" + this.end_time_to_set_min_5 + ":00",
        start_time_to_set_6: this.start_time_to_set_hr_6 + ":" + this.start_time_to_set_min_6 + ":00",
        end_time_to_set_6: this.end_time_to_set_hr_6 + ":" + this.end_time_to_set_min_6 + ":00",
        status2:this.status["2"],
        status3:this.status["3"],
        status4:this.status["4"],
        status1:this.status["1"],
        status5:this.status["5"],
        status6:this.status["6"]
      }


      axios({
        method: "POST", "url": "/updatetimesetting", "data": data, "headers": { "content-type": "application/json" }
      }).then(res => {
        this.loading = false;
        this.blurConfig.isBlurred = !this.blurConfig.isBlurred;
        this.greet()
      }, error => {
        console.error(error);
      });
    },
    changeWeekTimeSetting() {
      this.$refs.timeWeekSettingModal.show()
    },
    hideWeekTimeSettingModal: function (event) {
      this.$refs.timeWeekSettingModal.hide()
    },
    changeMonthTimeSetting() {
      this.$refs.timeMonthSettingModal.show()
    },
    hideMonthTimeSettingModal: function (event) {
      this.$refs.timeMonthSettingModal.hide()
    },
    changeYearTimeSetting() {
      this.$refs.timeYearSettingModal.show()
    },
    hideYearTimeSettingModal: function (event) {
      this.$refs.timeYearSettingModal.hide()
    },

    csvDownload: function (event) {
      var mltosend = this.machineList
      var lan = this.langvar
      var csv_end_date = moment(this.et).local().format("Y-MM-DD HH:mm:ss");
      var csv_start_date = moment(this.st).local().format("Y-MM-DD HH:mm:ss");
      var counter = 0
      let database_name = "hmmasterdbcs";
      if (localStorage.data_source_flag ) {
        database_name = "hmmasterdbcs";
      }
      if (localStorage.data_source_flag && (localStorage.data_source_flag == 'true') ) {
        database_name = "hmmasterdbcs";
      }
      mltosend.forEach(function (machine) {
        let data = {
          csv_end_date: csv_end_date,
          csv_start_date: csv_start_date,
          machineList: machine,
          lan: lan,
          database_name: database_name
        }

        setTimeout(() =>
          axios({
            method: 'post',
            "url": "/download",
            timeout: 60 * 60 * 1000, // Let's say you want to wait at least 4 mins
            data: data
          }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', machine + "_" + moment(csv_start_date).format('YMMDD_HHmm') + "_" + moment(csv_end_date).format('YMMDD_HHmm') + ".csv"); //or any other extension
            document.body.appendChild(link);
            link.click();
          }).catch((errors) => {
            console.log("Error in download CSV", errors)
          }), counter)
        counter += 3000
      })
    },
    hidemlwarningModal: function () {
      this.$refs.mlwarningModal.hide()
    },
    greet() {
      this.getTimeSetting()
      if (this.machineList.length == 0) {
        this.$refs.mlwarningModal.show();
      } else {
        /*
        if (this.duration === 'today'){
        } else {
          this.loading = true;
          this.blurConfig.isBlurred = !this.blurConfig.isBlurred;
        }
        */
        this.loading = true;
        this.blurConfig.isBlurred = !this.blurConfig.isBlurred;
        if (localStorage.data_source_flag ) {
          this.input.database_name = "hmmasterdbcs";
        }
        if (localStorage.data_source_flag && (localStorage.data_source_flag == 'true') ) {
          this.input.database_name = "hmmasterdbcs";
        }
        if (this.duration == 'custom') {
          this.input.custom_start_date = moment.utc(this.start_date).local().format("Y-MM-DD HH:mm:ss");
          this.input.custom_end_date = moment.utc(this.end_date).local().format("Y-MM-DD HH:mm:ss");
        } else {
          this.input.custom_start_date = moment.utc(this.start_date).local().format("Y-MM-DD HH:mm:ss");
        }
        this.input.duration = this.duration;
        this.input.machineList = this.machineList.sort();
        axios.get("/getTimeSetting/getMachineNames").then((response) => {
          var machineNamesList = response.data;
          axios({
            method: "POST", "url": "/outputdata", "data": this.input, "headers": { "content-type": "application/json" }
          }).then(res => {
            var result = {};
            result.data = res.data.displayData;
            if (this.langvar == 'ja') {
              this.hr = '時間';
              this.min = '分';
              this.days = '日';
              this.x_day_label = "時刻";
              this.x_month_label = "日付";
              this.x_year_label = "月";
              this.cumulative_operation_time = "（選択設備・期間の総計）";
              this.cumulative_downtime_time = "（選択設備・期間の総計）";
            } else {
              this.hr = 'Hours';
              this.min = 'Minutes';
              this.days = 'Days';
              this.x_day_label = "Hour";
              this.x_month_label = "Day";
              this.x_year_label = "Month";
              this.cumulative_operation_time = "Selected Machines and Time";
              this.cumulative_downtime_time = "Selected Machines and Time";
            }
            this.st = moment(result.data.start_time).format("Y-MM-DD HH:mm");
            this.et = moment(result.data.end_time).format("Y-MM-DD HH:mm");
            var dummyAvailabilityData = [];
            var dummyPerformanceData = [];
            var dummyQualityData = [];
            var machinList = {
              "4-01": this.findMachineName(machineNamesList, '4-01'),
              "4-02": this.findMachineName(machineNamesList, '4-02'),
              "4-03": this.findMachineName(machineNamesList, '4-03'),
              "4-05": this.findMachineName(machineNamesList, '4-05'),
              "4-06": this.findMachineName(machineNamesList, '4-06'),
              "4-07": this.findMachineName(machineNamesList, '4-07'),
              "4-09": this.findMachineName(machineNamesList, '4-09'),
              "4-C1": this.findMachineName(machineNamesList, '4-C1')
            }
            var bg_color = {
              "4-01": 'rgba(50, 115, 220, 0.3)',
              "4-02": 'rgba(255, 0, 0, 0.3)',
              "4-03": 'rgba(0, 255, 0, 0.3)',
              "4-05": 'rgba(0, 0, 255, 0.3)',
              "4-06": 'rgba(192, 192, 192, 0.3)',
              "4-07": 'rgba(0, 0, 0, 0.3)',
              "4-09": 'rgba(255, 0, 255, 0.3)',
            }
            var b_color = {
              "4-01": 'rgba(50, 115, 220, 0.5)',
              "4-02": 'rgba(255, 0, 0, 0.5)',
              "4-03": 'rgba(0, 255, 0, 0.5)',
              "4-05": 'rgba(0, 0, 255, 0.5)',
              "4-06": 'rgba(192, 192, 192, 0.5)',
              "4-07": 'rgba(0, 0, 0, 0.5)',
              "4-09": 'rgba(255, 0, 255, 0.5)',
              "4-C1": 'rgba(0, 0, 255, 0.5)',
            }
            this.response = result.data;
            this.operation_circle_cumulative = this.hhmmss(result.data.circle_value[0]);
            this.operation_circle = this.hhmmss(result.data.circle_value[1] * 3600);
            this.downtime_circle_cumulative = this.hhmmss(result.data.circle_value[2]);
            this.downtime_circle = this.hhmmss(result.data.circle_value[3] * 3600);
            if (result.data.circle_value[4] > 0) {
              this.operation_rate_circle = parseFloat((result.data.circle_value[4]).toFixed(1));
            } else {
              this.operation_rate_circle = 0;
            }
            if (result.data.circle_value[5] > 0) {
              this.downtime_rate_circle = parseFloat((result.data.circle_value[5]).toFixed(1));
            } else {
              this.downtime_rate_circle = 0;
            }
            var keys = Object.keys(result.data);
            keys.forEach(function (key) {
              if (key == 'labels' || key == 'y_axis_operation_max_label' || key == 'y_axis_downtime_max_label' || key == 'y_axis_operation_rate_max_label' || key == 'machine_list' || key == 'x_axis_label' || key == 'circle_value' || key == 'start_time' || key == 'end_time') {
              } else {
                var keys2 = Object.keys(result.data[key]);
                keys2.forEach(function (key2) {
                  switch (key2) {
                    case "operation":
                      if (key == '4-C1') {
                        dummyPerformanceData.push({ // one line graph
                          type: 'line',
                          label: machinList[key],
                          data: result.data[key][key2],
                          borderColor: b_color[key],
                          fill: false,
                          lineTension: 0,
                          pointStyle: 'line',
                        });
                      } else {
                        dummyPerformanceData.push({ // one line graph
                          label: machinList[key],
                          data: result.data[key][key2],
                          backgroundColor: bg_color[key],
                          borderColor: b_color[key],
                          borderWidth: 1,
                          pointStyle: 'rect',
                          boxWidth: 40
                        });
                      }
                      break;
                    case "downtime":
                      if (key == '4-C1') {
                        dummyAvailabilityData.push({ // one line graph
                          type: 'line',
                          label: machinList[key],
                          data: result.data[key][key2],
                          borderColor: b_color[key],
                          fill: false,
                          lineTension: 0,
                          pointStyle: 'line',
                        });
                      } else {
                        dummyAvailabilityData.push({ // one line graph
                          label: machinList[key],
                          data: result.data[key][key2],
                          backgroundColor: bg_color[key],
                          borderColor: b_color[key],
                          borderWidth: 1,
                          pointStyle: 'rect',
                          boxWidth: 40
                        });
                      }
                      break;
                    case "operation_rate":
                      if (key == '4-C1') {
                        dummyQualityData.push({ // one line graph
                          type: 'line',
                          label: machinList[key],
                          data: result.data[key][key2],
                          borderColor: b_color[key],
                          fill: false,
                          lineTension: 0,
                          pointStyle: 'line',
                        });
                      } else {
                        dummyQualityData.push({ // one line graph
                          label: machinList[key],
                          data: result.data[key][key2],
                          backgroundColor: bg_color[key],
                          borderColor: b_color[key],
                          borderWidth: 1,
                          pointStyle: 'rect',
                          boxWidth: 40
                        });
                      }
                      break;
                  }
                });
              }
            });
            this.performanceChartData.options.scales.yAxes[0].ticks.max = result.data.y_axis_operation_max_label
            this.availabilityChartData.options.scales.yAxes[0].ticks.max = result.data.y_axis_downtime_max_label
            this.qualityChartData.options.scales.yAxes[0].ticks.max = result.data.y_axis_operation_rate_max_label
            if (result.data.duration === 'day') {
              this.performanceChartData.options.scales.yAxes[0].scaleLabel.labelString = this.min
              this.availabilityChartData.options.scales.yAxes[0].scaleLabel.labelString = this.min
              this.performanceChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_day_label
              this.availabilityChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_day_label
              this.qualityChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_day_label
              if (this.langvar == 'en') {
                this.average_operation_time = "Per Machine Per Hour";
                this.average_downtime_time = "Per Machine Per Hour";
              } else {
                this.average_operation_time = "（1台あたり, 1時間毎）";
                this.average_downtime_time = "（1台あたり, 1時間毎）";
              }
            } else if (result.data.duration === 'month' || result.data.duration === 'week') {
              this.performanceChartData.options.scales.yAxes[0].scaleLabel.labelString = this.hr
              this.availabilityChartData.options.scales.yAxes[0].scaleLabel.labelString = this.hr
              this.performanceChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_month_label
              this.availabilityChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_month_label
              this.qualityChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_month_label
              if (this.langvar == 'en') {
                this.average_operation_time = "Per Machine Per Day";
                this.average_downtime_time = "Per Machine Per Day";
              } else {
                this.average_operation_time = "（1台あたり, 1日毎）";
                this.average_downtime_time = "（1台あたり, 1日毎）";
              }
            } else {
              this.performanceChartData.options.scales.yAxes[0].scaleLabel.labelString = this.hr
              this.availabilityChartData.options.scales.yAxes[0].scaleLabel.labelString = this.hr
              this.performanceChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_year_label
              this.availabilityChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_year_label
              this.qualityChartData.options.scales.xAxes[0].scaleLabel.labelString = this.x_year_label
              if (this.langvar == 'en') {
                this.average_operation_time = "Per Machine Per Month";
                this.average_downtime_time = "Per Machine Per Month";
              } else {
                this.average_operation_time = "（1台あたり, 1ヶ月毎）";
                this.average_downtime_time = "（1台あたり, 1ヶ月毎）";
              }
            }
            this.performanceChartData.data.labels = this.response.x_axis_label;
            this.performanceChartData.data.datasets = dummyPerformanceData;
            this.availabilityChartData.data.labels = this.response.x_axis_label;
            this.availabilityChartData.data.datasets = dummyAvailabilityData;
            this.qualityChartData.data.labels = this.response.x_axis_label;
            this.qualityChartData.data.datasets = dummyQualityData;
            /*
            if (this.duration === 'today'){
            } else {
              this.loading = false;
            }*/
            this.loading = false;
            if (this.operation_time) {
              this.operation_time_fun();
            } else if (this.down_time) {
              this.down_time_fun();
            } else {
              this.operation_rate_fun()
            }
          }, error => {
            console.error(error);
          });
        });
      }
    },

    stophdTimeDataFetch() {
      clearInterval(this.hdf);
    },
    getTimeSetting() {
      axios({
        method: "GET", "url": "/getTimeSetting", "headers": { "content-type": "application/json" }
      }).then(res => {
        this.start_time_to_set_hr = res.data.start_hr_min.hr;
        this.start_time_to_set_min = res.data.start_hr_min.min;
        this.end_time_to_set_hr = res.data.end_hr_min.hr;
        this.end_time_to_set_min = res.data.end_hr_min.min;
        this.start_time_to_set_hr_1 = res.data.start_hr_min_1.hr;
        this.start_time_to_set_min_1 = res.data.start_hr_min_1.min;
        this.end_time_to_set_hr_1 = res.data.end_hr_min_1.hr;
        this.end_time_to_set_min_1 = res.data.end_hr_min_1.min;

        this.start_time_to_set_hr_2 = res.data.start_hr_min_2.hr;
        this.start_time_to_set_min_2 = res.data.start_hr_min_2.min;
        this.end_time_to_set_hr_2 = res.data.end_hr_min_2.hr;
        this.end_time_to_set_min_2 = res.data.end_hr_min_2.min;
        this.start_time_to_set_hr_3 = res.data.start_hr_min_3.hr;
        this.start_time_to_set_min_3 = res.data.start_hr_min_3.min;
        this.end_time_to_set_hr_3 = res.data.end_hr_min_3.hr;
        this.end_time_to_set_min_3 = res.data.end_hr_min_3.min;
        this.start_time_to_set_hr_4 = res.data.start_hr_min_4.hr;
        this.start_time_to_set_min_4 = res.data.start_hr_min_4.min;
        this.end_time_to_set_hr_4 = res.data.end_hr_min_4.hr;
        this.end_time_to_set_min_4 = res.data.end_hr_min_4.min;
        // fifth
        this.start_time_to_set_hr_5 = res.data.start_hr_min_5.hr;
        this.start_time_to_set_min_5 = res.data.start_hr_min_5.min;
        this.end_time_to_set_hr_5 = res.data.end_hr_min_5.hr;
        this.end_time_to_set_min_5 = res.data.end_hr_min_5.min;
        // Sixth
        this.start_time_to_set_hr_6 = res.data.start_hr_min_6.hr;
        this.start_time_to_set_min_6 = res.data.start_hr_min_6.min;
        this.end_time_to_set_hr_6 = res.data.end_hr_min_6.hr;
        this.end_time_to_set_min_6 = res.data.end_hr_min_6.min;
        this.status["1"] = 0;
        this.status["2"] = 0;
        this.status["3"] = 0;
        this.status["4"] = 0;
        this.status["5"] = 0;
        this.status["6"] = 0;
        this.status[res.data.status] = 1
        document.getElementById(res.data.status).checked = true;
      }).catch((errors) => {
        console.log("Error in getting time setting", errors)
      });
    },
    selectionChange(event) {
      if ('start_time_to_set_hr_1' === event.target.value) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_1;
        this.start_time_to_set_min = this.start_time_to_set_min_1;
        this.end_time_to_set_hr = this.end_time_to_set_hr_1;
        this.end_time_to_set_min = this.end_time_to_set_min_1;
      } else if ('start_time_to_set_hr_2' === event.target.value) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_2;
        this.start_time_to_set_min = this.start_time_to_set_min_2;
        this.end_time_to_set_hr = this.end_time_to_set_hr_2;
        this.end_time_to_set_min = this.end_time_to_set_min_2;
      }
      else if ('start_time_to_set_hr_3' === event.target.value) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_3;
        this.start_time_to_set_min = this.start_time_to_set_min_3;
        this.end_time_to_set_hr = this.end_time_to_set_hr_3;
        this.end_time_to_set_min = this.end_time_to_set_min_3;
      }
      else if ('start_time_to_set_hr_4' === event.target.value) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_4;
        this.start_time_to_set_min = this.start_time_to_set_min_4;
        this.end_time_to_set_hr = this.end_time_to_set_hr_4;
        this.end_time_to_set_min = this.end_time_to_set_min_4;
      }
      else if ('start_time_to_set_hr_5' === event.target.value) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_5;
        this.start_time_to_set_min = this.start_time_to_set_min_5;
        this.end_time_to_set_hr = this.end_time_to_set_hr_5;
        this.end_time_to_set_min = this.end_time_to_set_min_5;
      }
      else if ('start_time_to_set_hr_6' === event.target.value) {
        this.start_time_to_set_hr = this.start_time_to_set_hr_6;
        this.start_time_to_set_min = this.start_time_to_set_min_6;
        this.end_time_to_set_hr = this.end_time_to_set_hr_6;
        this.end_time_to_set_min = this.end_time_to_set_min_6;
      }
    },
    findMachineName(machineNamesList, key) {
      var returnObj = "";
      for (var i = 0; i < machineNamesList.length; i++) {
        if (machineNamesList[i].machine_id === key && key === '4-01') {
          returnObj = machineNamesList[i].machine_name;
          break;
        } else if (machineNamesList[i].machine_id === key && key === '4-02') {
          returnObj = machineNamesList[i].machine_name;
          break;
        } else if (machineNamesList[i].machine_id === key && key === '4-03') {
          returnObj = machineNamesList[i].machine_name;
          break;
        } else if (machineNamesList[i].machine_id === key && key === '4-05') {
          returnObj = machineNamesList[i].machine_name;
          break;
        } else if (machineNamesList[i].machine_id === key && key === '4-06') {
          returnObj = machineNamesList[i].machine_name;
          break;
        } else if (machineNamesList[i].machine_id === key && key === '4-07') {
          returnObj = machineNamesList[i].machine_name;
          break;
        } else if (machineNamesList[i].machine_id === key && key === '4-09') {
          returnObj = machineNamesList[i].machine_name;
          break;
        } else if (machineNamesList[i].machine_id === key && key === '4-C1') {
          returnObj = machineNamesList[i].machine_name;
          break;
        }

      }
      return returnObj;
    },
  },
  mounted() {
    if (localStorage.data_source_flag) {
      this.data_source_flag = (localStorage.data_source_flag == 'true');
    } else {
      this.data_source_flag = false;
    }
    this.getTimeSetting()
    this.chartUpdate();
    this.hdf = setInterval(this.historicalDataFetch, 60000);
  },
}

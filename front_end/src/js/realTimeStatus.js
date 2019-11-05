import axios from "axios";
import config from './config.js';

export default {
  name: 'realTimeStatus',
  props: {
    langvar: {
      type: String,
    }
  },
  data() {
    return {
      rts: "",
      config: config,
      cbodyVisible: false,
      dnc: true,
      input: {
        database_name: "hmmasterdbcs",
      },
      mdefault: {
        machine01: true,
        machine02: true,
        machine03: true,
        machine05: true,
        machine06: true,
        machine07: true,
        machine09: true,
        machineC1: true,
      },
      con_stat_con: {
        machine01: true,
        machine02: true,
        machine03: true,
        machine05: true,
        machine06: true,
        machine07: true,
        machine09: true,
        machineC1: true,
      },
      con_stat_not_con: {
        machine01: false,
        machine02: false,
        machine03: false,
        machine05: false,
        machine06: false,
        machine07: false,
        machine09: false,
        machineC1: false,
      },
      cbodyVisible_list: {
        machine01: false,
        machine02: false,
        machine03: false,
        machine05: false,
        machine06: false,
        machine07: false,
        machine09: false,
        machineC1: false,
      },
      dnc_list: {
        machine01: true,
        machine02: true,
        machine03: true,
        machine05: true,
        machine06: true,
        machine07: true,
        machine09: true,
        machineC1: true,
      },
      warning: {
        machine01: false,
        machine02: false,
        machine03: false,
        machine05: false,
        machine06: false,
        machine07: false,
        machine09: false,
        machineC1: false,
      },
      textColor: {
        machine01: 'black',
        machine02: 'black',
        machine03: 'black',
        machine05: 'black',
        machine06: 'black',
        machine07: 'black',
        machine09: 'black',
        machineC1: 'black',
      },
      borderColor: {
        machine01: false,
        machine02: false,
        machine03: false,
        machine05: false,
        machine06: false,
        machine07: false,
        machine09: false,
        machineC1: false,
      },
      defaultTextColor: {
        machine01: 'black',
        machine02: 'black',
        machine03: 'black',
        machine05: 'black',
        machine06: 'black',
        machine07: 'black',
        machine09: 'black',
        machineC1: 'black',
      },
      success: {
        machine01: false,
        machine02: false,
        machine03: false,
        machine05: false,
        machine06: false,
        machine07: false,
        machine09: false,
        machineC1: false,
      },
      danger: {
        machine01: false,
        machine02: false,
        machine03: false,
        machine05: false,
        machine06: false,
        machine07: false,
        machine09: false,
        machineC1: false,
      },
      status: {
        machine01: " Device Not Connected",
        machine02: " Device Not Connected",
        machine03: " Device Not Connected",
        machine05: " Device Not Connected",
        machine06: " Device Not Connected",
        machine07: " Device Not Connected",
        machine09: " Device Not Connected",
        machineC1: " Device Not Connected",
      },
      barcode: {
        machine01: "",
        machine02: "",
        machine03: "",
        machine05: "",
        machine06: "",
        machine07: "",
        machine09: "",
        machineC1: "",
      },
      operation_time: {
        machine01: 0,
        machine02: 0,
        machine03: 0,
        machine05: 0,
        machine06: 0,
        machine07: 0,
        machine09: 0,
        machineC1: 0,
      },
      operation_rate: {
        machine01: 0,
        machine02: 0,
        machine03: 0,
        machine05: 0,
        machine06: 0,
        machine07: 0,
        machine09: 0,
        machineC1: 0,
      },
      downtime: {
        machine01: 0,
        machine02: 0,
        machine03: 0,
        machine05: 0,
        machine06: 0,
        machine07: 0,
        machine09: 0,
        machineC1: 0,
      },
      downtime_rate: {
        machine01: 0,
        machine02: 0,
        machine03: 0,
        machine05: 0,
        machine06: 0,
        machine07: 0,
        machine09: 0,
        machineC1: 0,
      },
      job_count: {
        machine01: 0,
        machine02: 0,
        machine03: 0,
        machine05: 0,
        machine06: 0,
        machine07: 0,
        machine09: 0,
      },
      threshold: {
        thresholdMachine09: 0,
        thresholdMachine07: 0,
        thresholdMachine06: 0,
        thresholdMachine05: 0,
        thresholdMachine03: 0,
        thresholdMachine02: 0,
        thresholdMachine01: 0,
        task: 'fetch'
      },
      thresholdtodisplay: {
        thresholdMachine09: 0,
        thresholdMachine07: 0,
        thresholdMachine06: 0,
        thresholdMachine05: 0,
        thresholdMachine03: 0,
        thresholdMachine02: 0,
        thresholdMachine01: 0,
      }
    }
  },
  methods: {
    realTimeDataFetch() {
      if (localStorage.data_source_flag ) {
        this.input.database_name = "hmmasterdbcs";
      }
      if (localStorage.data_source_flag && (localStorage.data_source_flag == 'true') ) {
        this.input.database_name = "hmmasterdbcs";
      }
      axios({
        method: "POST", "url": "/livedata", "data": this.input, "headers": { "content-type": "application/json" }
      }).then(result => {
        this.dnc = false;
        this.cbodyVisible = true;
        var mdefault = this.mdefault;
        var success = this.success;
        var danger = this.danger;
        var warning = this.warning;
        var status = this.status;
        var barcode = this.barcode;
        var operation_time = this.operation_time;
        var operation_rate = this.operation_rate;
        var downtime = this.downtime;
        var downtime_rate = this.downtime_rate;
        var job_count = this.job_count
        var textColor = this.textColor;
        var defaultTextColor = this.defaultTextColor;
        var threshold = this.threshold;
        var borderColor = this.borderColor
        var langvar = this.langvar
        var dnc_list = this.dnc_list
        var cbodyVisible_list = this.cbodyVisible_list
        var con_stat_con = this.con_stat_con
        var con_stat_not_con = this.con_stat_not_con
        var keys = Object.keys(result.data);
        keys.forEach(function (machine) {
          var machine_name2 = machine.replace("4-", "thresholdMachine");
          var machine_name = machine.replace("4-", "machine");
          mdefault[machine_name] = false
          if (machine_name !== 'machineC1') {
            job_count[machine_name] = result.data[machine].job_count;
            if (result.data[machine].operation_rate < threshold[machine_name2]) {
              textColor[machine_name] = 'rgba(255, 0, 0, 0.7)';
              borderColor[machine_name] = true;
            } else {
              textColor[machine_name] = 'rgba(0, 0, 0, 0.8)';
              borderColor[machine_name] = false;
            }
            barcode[machine_name] = result.data[machine].barcode
          }
          if (result.data[machine].status == 'green') {
            defaultTextColor[machine_name] = 'black';
            success[machine_name] = true;
            danger[machine_name] = false;
            warning[machine_name] = false;
            status[machine_name] = 'On';
            if (result.data[machine].operation_time > 0) {
              var minutes = Math.floor(result.data[machine].operation_time / 60);
              var secs = parseInt(result.data[machine].operation_time) % 60;
              var hours = Math.floor(minutes / 60)
              minutes = minutes % 60;
            } else {
              var minutes = 0
              var secs = 0
              var hours = 0
            }
            if (langvar == 'en') {
              operation_time[machine_name] = hours + " hr " + minutes + " min";
            } else {
              operation_time[machine_name] = hours + " 時間 " + minutes + " 分";
            }

            if (result.data[machine].operation_rate > 0) {
              operation_rate[machine_name] = parseFloat((result.data[machine].operation_rate).toFixed(1));
            } else {
              operation_rate[machine_name] = 0
            }

            if (result.data[machine].down_time > 0) {
              var minutes = Math.floor(result.data[machine].down_time / 60);
              var secs = parseInt(result.data[machine].down_time) % 60;
              var hours = Math.floor(minutes / 60)
              minutes = minutes % 60;
            } else {
              var minutes = 0
              var secs = 0
              var hours = 0
            }
            if (langvar == 'en') {
              downtime[machine_name] = hours + " hr " + minutes + " min";
            } else {
              downtime[machine_name] = hours + " 時間 " + minutes + " 分";
            }

            if (result.data[machine].downtime_rate > 0) {
              downtime_rate[machine_name] = parseFloat((result.data[machine].downtime_rate).toFixed(1));
            } else {
              downtime_rate[machine_name] = 0
            }

          } else if (result.data[machine].status == 'yellow') {
            defaultTextColor[machine_name] = 'black';
            danger[machine_name] = false;
            success[machine_name] = false;
            warning[machine_name] = true;
            status[machine_name] = 'Off';
            if (result.data[machine].operation_time > 0) {
              var minutes = Math.floor(result.data[machine].operation_time / 60);
              var secs = parseInt(result.data[machine].operation_time) % 60;
              var hours = Math.floor(minutes / 60)
              minutes = minutes % 60;
            } else {
              var minutes = 0
              var secs = 0
              var hours = 0
            }
            if (langvar == 'en') {
              operation_time[machine_name] = hours + " hr " + minutes + " min";
            } else {
              operation_time[machine_name] = hours + " 時間 " + minutes + " 分";
            }
            if (result.data[machine].operation_rate > 0) {
              operation_rate[machine_name] = parseFloat((result.data[machine].operation_rate).toFixed(1));
            } else {
              operation_rate[machine_name] = 0
            }
            if (result.data[machine].down_time > 0) {
              var minutes = Math.floor(result.data[machine].down_time / 60);
              var secs = parseInt(result.data[machine].down_time) % 60;
              var hours = Math.floor(minutes / 60)
              minutes = minutes % 60;
            } else {
              var minutes = 0
              var secs = 0
              var hours = 0
            }
            if (langvar == 'en') {
              downtime[machine_name] = hours + " hr " + minutes + " min";
            } else {
              downtime[machine_name] = hours + " 時間 " + minutes + " 分";
            }
            if (result.data[machine].downtime_rate > 0) {
              downtime_rate[machine_name] = parseFloat((result.data[machine].downtime_rate).toFixed(1));
            } else {
              downtime_rate[machine_name] = 0
            }
          } else {
            defaultTextColor[machine_name] = 'white';
            if (result.data[machine].operation_rate < threshold[machine_name2]) {
              textColor[machine_name] = 'black';
            } else {
              textColor[machine_name] = 'white'
            }
            success[machine_name] = false;
            warning[machine_name] = false;
            danger[machine_name] = true;
            status[machine_name] = 'Off';

            if (result.data[machine].operation_time > 0) {
              var minutes = Math.floor(result.data[machine].operation_time / 60);
              var secs = parseInt(result.data[machine].operation_time) % 60;
              var hours = Math.floor(minutes / 60)
              minutes = minutes % 60;
            } else {
              var minutes = 0
              var secs = 0
              var hours = 0
            }
            if (langvar == 'en') {
              operation_time[machine_name] = hours + " hr " + minutes + " min";
            } else {
              operation_time[machine_name] = hours + " 時間 " + minutes + " 分";
            }
            if (result.data[machine].operation_rate > 0) {
              operation_rate[machine_name] = parseFloat((result.data[machine].operation_rate).toFixed(1));
            } else {
              operation_rate[machine_name] = 0
            }
            if (result.data[machine].down_time > 0) {
              var minutes = Math.floor(result.data[machine].down_time / 60);
              var secs = parseInt(result.data[machine].down_time) % 60;
              var hours = Math.floor(minutes / 60)
              minutes = minutes % 60;
            } else {
              var minutes = 0
              var secs = 0
              var hours = 0
            }
            if (langvar == 'en') {
              downtime[machine_name] = hours + " hr " + minutes + " min";
            } else {
              downtime[machine_name] = hours + " 時間 " + minutes + " 分";
            }
            if (result.data[machine].downtime_rate > 0) {
              downtime_rate[machine_name] = parseFloat((result.data[machine].downtime_rate).toFixed(1));
            } else {
              downtime_rate[machine_name] = 0
            }
          }
          if (machine_name !== 'machineC1') {
            if (result.data[machine].status_timestamp == 'dncon') {
              dnc_list[machine_name] = true;
              mdefault[machine_name] = true;
              defaultTextColor[machine_name] = 'black';
              success[machine_name] = false;
              danger[machine_name] = false;
              warning[machine_name] = false;
              cbodyVisible_list[machine_name] = false;
              borderColor[machine_name] = false;
              con_stat_con[machine_name] = false;
              con_stat_not_con[machine_name] = true;
            } else {
              dnc_list[machine_name] = false;
              cbodyVisible_list[machine_name] = true
            }
          } else {
            if (result.data[machine].status_timestamp == 'dncon') {
              dnc_list[machine_name] = true;
              mdefault[machine_name] = true;
              defaultTextColor[machine_name] = 'black';
              success[machine_name] = false;
              danger[machine_name] = false;
              warning[machine_name] = false;
              cbodyVisible_list[machine_name] = false;
              con_stat_con[machine_name] = false;
              con_stat_not_con[machine_name] = true;
            } else {
              dnc_list[machine_name] = false;
              cbodyVisible_list[machine_name] = true
            }
          }
        });
        this.mdefault = mdefault;
        this.success = success;
        this.danger = danger;
        this.warning = warning;
        this.status = status;
        this.operation_time = operation_time;
        this.operation_rate = operation_rate;
        this.downtime = downtime;
        this.downtime_rate = downtime_rate;;
        this.job_count = job_count;
        this.textColor = textColor
        this.defaultTextColor = defaultTextColor;
        this.borderColor = borderColor;
        this.dnc_list = dnc_list
        this.cbodyVisible_list = cbodyVisible_list;
        this.con_stat_con = con_stat_con;
        this.con_stat_not_con = con_stat_not_con;
      }, error => {
        console.error(error);
      }
      );
    },
    stopRealTimeDataFetch() {
      clearInterval(this.rts);
    },
    changeThresholdSetting01() {
      this.$refs.thresholdSettingModal01.show()
    },
    changeThresholdSetting02() {
      this.$refs.thresholdSettingModal02.show()
    },
    changeThresholdSetting03() {
      this.$refs.thresholdSettingModal03.show()
    },
    changeThresholdSetting05() {
      this.$refs.thresholdSettingModal05.show()
    },
    changeThresholdSetting06() {
      this.$refs.thresholdSettingModal06.show()
    },
    changeThresholdSetting07() {
      this.$refs.thresholdSettingModal07.show()
    },
    changeThresholdSetting09() {
      this.$refs.thresholdSettingModal09.show()
    },
    hideThresholdSettingModal01() {
      if (this.thresholdtodisplay.thresholdMachine01 && this.thresholdtodisplay.thresholdMachine01 >= 0 && this.thresholdtodisplay.thresholdMachine01 <= 100 && (this.thresholdtodisplay.thresholdMachine01 % 1) === 0) {
        this.thresholdwarning01 = false;
        this.$refs.thresholdSettingModal01.hide();
        this.threshold.thresholdMachine01 = this.thresholdtodisplay.thresholdMachine01
        this.updateThresholds()
        this.threshold.task = "update"
      } else {
        this.thresholdwarning01 = true;
        this.thresholdtodisplay.thresholdMachine01 = this.threshold.thresholdMachine01
      }
    },
    hideThresholdSettingModal02() {
      if (this.thresholdtodisplay.thresholdMachine02 && this.thresholdtodisplay.thresholdMachine02 >= 0 && this.thresholdtodisplay.thresholdMachine02 <= 100 && (this.thresholdtodisplay.thresholdMachine02 % 1) === 0) {
        this.thresholdwarning02 = false;
        this.$refs.thresholdSettingModal02.hide()
        this.threshold.thresholdMachine02 = this.thresholdtodisplay.thresholdMachine02
        this.updateThresholds()
        this.threshold.task = "update"
      } else {
        this.thresholdwarning02 = true;
        this.thresholdtodisplay.thresholdMachine02 = this.threshold.thresholdMachine02
      }
    },
    hideThresholdSettingModal03() {
      if (this.thresholdtodisplay.thresholdMachine03 && this.thresholdtodisplay.thresholdMachine03 >= 0 && this.thresholdtodisplay.thresholdMachine03 <= 100 && (this.thresholdtodisplay.thresholdMachine03 % 1) === 0) {
        this.thresholdwarning03 = false;
        this.$refs.thresholdSettingModal03.hide()
        this.threshold.thresholdMachine03 = this.thresholdtodisplay.thresholdMachine03
        this.updateThresholds()
        this.threshold.task = "update"
      } else {
        this.thresholdwarning03 = true;
        this.thresholdtodisplay.thresholdMachine03 = this.threshold.thresholdMachine03
      }
    },
    hideThresholdSettingModal05() {
      if (this.thresholdtodisplay.thresholdMachine05 && this.thresholdtodisplay.thresholdMachine05 >= 0 && this.thresholdtodisplay.thresholdMachine05 <= 100 && (this.thresholdtodisplay.thresholdMachine05 % 1) === 0) {
        this.thresholdwarning05 = false;
        this.$refs.thresholdSettingModal05.hide()
        this.threshold.thresholdMachine05 = this.thresholdtodisplay.thresholdMachine05
        this.updateThresholds()
        this.threshold.task = "update"
      } else {
        this.thresholdwarning05 = true;
        this.thresholdtodisplay.thresholdMachine05 = this.threshold.thresholdMachine05
      }
    },
    hideThresholdSettingModal06() {
      if (this.thresholdtodisplay.thresholdMachine06 && this.thresholdtodisplay.thresholdMachine06 >= 0 && this.thresholdtodisplay.thresholdMachine06 <= 100 && (this.thresholdtodisplay.thresholdMachine06 % 1) === 0) {
        this.thresholdwarning06 = false;
        this.$refs.thresholdSettingModal06.hide()
        this.threshold.thresholdMachine06 = this.thresholdtodisplay.thresholdMachine06
        this.updateThresholds()
        this.threshold.task = "update"
      } else {
        this.thresholdwarning06 = true;
        this.thresholdtodisplay.thresholdMachine06 = this.threshold.thresholdMachine06
      }
    },
    hideThresholdSettingModal07() {
      if (this.thresholdtodisplay.thresholdMachine07 && this.thresholdtodisplay.thresholdMachine07 >= 0 && this.thresholdtodisplay.thresholdMachine07 <= 100 && (this.thresholdtodisplay.thresholdMachine07 % 1) === 0) {
        this.thresholdwarning07 = false;
        this.$refs.thresholdSettingModal07.hide()
        this.threshold.thresholdMachine07 = this.thresholdtodisplay.thresholdMachine07
        this.updateThresholds()
        this.threshold.task = "update"
      } else {
        this.thresholdwarning07 = true;
        this.thresholdtodisplay.thresholdMachine07 = this.threshold.thresholdMachine07
      }
    },
    hideThresholdSettingModal09() {

      if (this.thresholdtodisplay.thresholdMachine09 && this.thresholdtodisplay.thresholdMachine09 >= 0 && this.thresholdtodisplay.thresholdMachine09 <= 100 && (this.thresholdtodisplay.thresholdMachine09 % 1) === 0) {
        this.thresholdwarning09 = false
        this.$refs.thresholdSettingModal09.hide()
        this.threshold.thresholdMachine09 = this.thresholdtodisplay.thresholdMachine09
        this.updateThresholds()
        this.threshold.task = "update"
      } else {
        this.thresholdwarning09 = true
        this.thresholdtodisplay.thresholdMachine09 = this.threshold.thresholdMachine09
      }
    },
    updateThresholds() {
      this.threshold.task = "update"
      axios({
        method: "POST", "url": "/updateRealTimeThresholds", "data": this.threshold, "headers": { "content-type": "application/json" }
      }).then(result => {
      })
    },
    fetchThresholds() {
      this.threshold.task = "fetch"
      axios({
        method: "POST", "url": "/updateRealTimeThresholds", "data": this.threshold, "headers": { "content-type": "application/json" }
      }).then(result => {
        this.threshold.thresholdMachine09 = result.data['machine09'];
        this.threshold.thresholdMachine07 = result.data['machine07'];
        this.threshold.thresholdMachine06 = result.data['machine06'];
        this.threshold.thresholdMachine05 = result.data['machine05'];
        this.threshold.thresholdMachine03 = result.data['machine03'];
        this.threshold.thresholdMachine02 = result.data['machine02'];
        this.threshold.thresholdMachine01 = result.data['machine01'];
        this.thresholdtodisplay.thresholdMachine09 = this.threshold.thresholdMachine09
        this.thresholdtodisplay.thresholdMachine07 = this.threshold.thresholdMachine07
        this.thresholdtodisplay.thresholdMachine06 = this.threshold.thresholdMachine06
        this.thresholdtodisplay.thresholdMachine05 = this.threshold.thresholdMachine05
        this.thresholdtodisplay.thresholdMachine03 = this.threshold.thresholdMachine03
        this.thresholdtodisplay.thresholdMachine02 = this.threshold.thresholdMachine02
        this.thresholdtodisplay.thresholdMachine01 = this.threshold.thresholdMachine01
      })
    },
    getMachineNames: function () {

      axios.get("/getTimeSetting/getMachineNames").then((response) => {
        for (var i = 0; i < response.data.length; i++) {
          switch (response.data[i].machine_id) {
            case '4-01':
              this.value_01 = response.data[i].machine_name;
              break;
            case '4-02':
              this.value_02 = response.data[i].machine_name;
              break;
            case '4-03':
              this.value_03 = response.data[i].machine_name;
              break;
            case '4-05':
              this.value_05 = response.data[i].machine_name;
              break;
            case '4-06':
              this.value_06 = response.data[i].machine_name;
              break;
            case '4-07':
              this.value_07 = response.data[i].machine_name;
              break;
            case '4-09':
              this.value_09 = response.data[i].machine_name;
              break;
            case '4-C1':
              this.value_c1 = response.data[i].machine_name;
              break;
          }
        }
      }).catch((errors) => {
        console.log(errors)
      })
    },
  },
  mounted() {
    this.getMachineNames()
    this.fetchThresholds()
    this.rts = setInterval(this.realTimeDataFetch, 5000);
  },
}
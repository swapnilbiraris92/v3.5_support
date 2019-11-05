/* jshint esversion: 6*/
import axios from "axios";
import HistoricalData from "../components/HistoricalData";
import RealTimeStatus from "../components//realTimeStatus";
import Timeselector from "vue-timeselector";
import Datepicker from "vuejs-datepicker";
import router from "../router";
import moment from "moment";
import config from "./config.js";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "../css/sidebarstyle.css";
import "../css/custom.css";
import "../css/dashboard.css";

export default {
  name: "app",
  components: {
    HistoricalData,
    RealTimeStatus,
    Timeselector,
    Datepicker
  },
  data() {
    return {
      csv_start_date: new Date(),
      state: {
        disabledDates: {
          customPredictor(date) {
            if (date > new Date()) {
              return true;
            }
          }
        }
      },
      data_source_flag: false,
      openpage: 0,
      ifjpy: true,
      ifeng: false,
      csvwarning01: false,
      csv_end_date: new Date(),
      show_ml: false,
      isActive: false,
      syncButton: false,
      multiselectVisibility: false,
      analysisPrimary: false,
      settingsPrimary: false,
      historicaldatavisible: false,
      homePrimary: true,
      realtimestatusvisible: true,
      lang_var: "ja",
      value: ["4-01", "4-02", "4-03", "4-05", "4-06", "4-07", "4-09", "4-C1"]
    };
  },
  methods: {
    customMonthFormatter(date) {
      return moment(date).format("MMM YYYY");
    },
    greet() {
      if (this.isActive == true) {
        this.isActive = false;
      } else {
        this.isActive = true;
      }
      if (this.openpage == 1) {
        this.$refs.sync.greet();
      }
    },
    change_data_source() {
      if (this.data_source_flag) {
        this.data_source_flag = false;
        localStorage.data_source_flag = this.data_source_flag;
      } else {
        this.data_source_flag = true;
        localStorage.data_source_flag = this.data_source_flag;
      }

      if (this.openpage == 1) {
        this.$refs.sync.greet();
      } else {
        this.$refs.realtimestatus.realTimeDataFetch();
      }
    },
    lang: function (e) {
      if (this.$i18n.locale === "en") {
        this.$i18n.locale = "ja";
        this.lang_var = "ja";
        this.ifeng = false;
        this.ifjpy = true;
      } else {
        this.$i18n.locale = "en";
        this.lang_var = "en";
        this.ifjpy = false;
        this.ifeng = true;
      }

      if (this.openpage == 1) {
        this.$refs.sync.greet();
      } else {
        this.$refs.realtimestatus.realTimeDataFetch();
      }
    },
    logout: function (e) {
      if (
        typeof this.$refs.realtimestatus !== "undefined" &&
        this.$refs.realtimestatus
      ) {
        this.$refs.realtimestatus.stopRealTimeDataFetch();
      }
      if (typeof this.$refs.sync !== "undefined" && this.$refs.sync) {
        this.$refs.sync.stophdTimeDataFetch();
      }
      axios
        .get("/api/logout")
        .then(response => {
          router.push("/");
        })
        .catch(errors => {
          console.log("Error in download CSV", errors);
        });
    },
    show_machine_list: function () {
      if (this.show_ml == true) {
        this.show_ml = false;
      } else {
        this.show_ml = true;
      }
    },
    submit() {
      if (this.value.length == 0) {
        this.$refs.mlwarningModal.show();
      } else {
        this.$refs.sync.greet();
      }
    },
    hidemlwarningModal: function () {
      this.$refs.mlwarningModal.hide();
    },
    rtsvfun() {
      if (typeof this.$refs.sync !== "undefined" && this.$refs.sync) {
        this.$refs.sync.stophdTimeDataFetch();
      }
      if (this.show_ml == true) {
        this.show_ml = false;
      }
      this.openpage = 0;
      this.syncButton = false;
      this.multiselectVisibility = false;
      this.analysisPrimary = false;
      this.historicaldatavisible = false;
      this.accountsettingsvisible = false;
      this.settingsPrimary = false;
      this.homePrimary = true;
      this.realtimestatusvisible = true;
    },
    hdvfun() {
      if (
        typeof this.$refs.realtimestatus !== "undefined" &&
        this.$refs.realtimestatus
      ) {
        this.$refs.realtimestatus.stopRealTimeDataFetch();
      }
      this.openpage = 1;
      this.homePrimary = false;
      this.realtimestatusvisible = false;
      this.accountsettingsvisible = false;
      this.settingsPrimary = false;
      this.syncButton = true;
      this.multiselectVisibility = true;
      this.analysisPrimary = true;
      this.historicaldatavisible = true;
    },
    csv() {
      this.$refs.csvModal.show();
    },
    editMachineNames() {
      this.$refs.editMachineNamesModal.show();
    },
    hideEditMachineNamesModal: function (event) {
      this.$refs.editMachineNamesModal.hide();
      let editData = {
        "4-01": this.value_01,
        "4-02": this.value_02,
        "4-03": this.value_03,
        "4-05": this.value_05,
        "4-06": this.value_06,
        "4-07": this.value_07,
        "4-09": this.value_09,
        "4-C1": this.value_c1
      };
      axios({
        method: "POST",
        url: "/updatetimesetting/updateMachineNames",
        data: editData,
        headers: {
          "content-type": "application/json"
        }
      }).then(
        res => {
          this.$refs.sync.greet();
        },
        error => {
          console.error(error);
        }
      );
    },
    hideCsvModal: function (event) {
      if (this.csv_start_date > this.csv_end_date) {
        this.csvwarning01 = true;
      } else {
        this.csvwarning01 = false;
        this.$refs.csvModal.hide();
        var lan = this.lang_var;
        var csv_start_date = moment(this.csv_start_date).format(
          "Y-MM-DD HH:mm:ss"
        );
        var csv_end_date = moment(this.csv_end_date).format("Y-MM-DD HH:mm:ss");
        let database_name = "hmmasterdbcs";
        if (localStorage.data_source_flag ) {
          database_name = "hmmasterdbcs";
        }
        if (localStorage.data_source_flag && (localStorage.data_source_flag == 'true') ) {
          database_name = "hmmasterdbcs";
        }
        let data = {
          lan: lan,
          csv_start_date: csv_start_date,
          csv_end_date: csv_end_date,
          database_name: database_name,
        };
        axios
          .post("/download", data)
          .then(response => {
            const url = window.URL.createObjectURL(
              new Blob(["\uFEFF" + response.data], {
                type: "text/csv;charset=utf-8"
              })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
              "download",
              response.headers["content-disposition"]
            ); //or any other extension
            document.body.appendChild(link);
            link.click();
            data.isCSVAggregate = true;
            axios
              .post("/download", data)
              .then(response => {
                const url = window.URL.createObjectURL(
                  new Blob(["\uFEFF" + response.data], {
                    type: "text/csv;charset=utf-8"
                  })
                );
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                  "download",
                  response.headers["content-disposition"]
                ); //or any other extension
                document.body.appendChild(link);
                link.click();
              })
              .catch(errors => {
                console.log("Error in download CSV", errors);
              });
          })
          .catch(errors => {
            console.log("Error in download CSV", errors);
          });
      }
    },
    getUserData: function () {
      let self = this;
      axios
        .get("/api/user")
        .then(response => {
          self.$set(this, "user", response.data.user);
        })
        .catch(errors => {
          console.log(errors);
          if (
            typeof this.$refs.realtimestatus !== "undefined" &&
            this.$refs.realtimestatus
          ) {
            this.$refs.realtimestatus.stopRealTimeDataFetch();
          }
          router.push("/");
        });
    },
    getMachineNames: function () {
      axios
        .get("/getTimeSetting/getMachineNames")
        .then(response => {
          for (var i = 0; i < response.data.length; i++) {
            switch (response.data[i].machine_id) {
              case "4-01":
                this.value_01 = response.data[i].machine_name;
                break;
              case "4-02":
                this.value_02 = response.data[i].machine_name;
                break;
              case "4-03":
                this.value_03 = response.data[i].machine_name;
                break;
              case "4-05":
                this.value_05 = response.data[i].machine_name;
                break;
              case "4-06":
                this.value_06 = response.data[i].machine_name;
                break;
              case "4-07":
                this.value_07 = response.data[i].machine_name;
                break;
              case "4-09":
                this.value_09 = response.data[i].machine_name;
                break;
              case "4-C1":
                this.value_c1 = response.data[i].machine_name;
                break;
            }
          }
        })
        .catch(errors => {
          console.log(errors);
        });
    }
  },
  mounted() {
    this.getUserData();
    this.getMachineNames();
    if (localStorage.data_source_flag) {
      this.data_source_flag = (localStorage.data_source_flag == 'true');
    } else {
      this.data_source_flag = false;
    }
  }
};

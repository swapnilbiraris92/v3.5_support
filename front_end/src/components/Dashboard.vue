<!-- Copyright Asquared IoT Pvt. Ltd. 2019
    Asquared IoT Pvt. Ltd. Confidential Information
    Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta
-->
<template>
  <div v-bind:class="{'langeng': ifeng, 'langjpy': ifjpy}">
    <b-navbar toggleable="md" type="dark" style="background-color: #000033;" position="sticky">
      <b-navbar-brand href="#" v-on:click="greet" id="sidebarCollapse">
        <span style="color:#fff;">☰</span>
      </b-navbar-brand>&nbsp;&nbsp;&nbsp;&nbsp;
      <img style="height: 30px;" src="../images/kmnbcrop.png"> &nbsp;&nbsp;&nbsp;&nbsp;
      <span style="color: #fff">Powered by</span> &nbsp;
      <img style="height: 30px;" src="../images/final_a2_logo.png">
      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-button
            id="signout"
            size="sm"
            class="my-2 my-sm-0"
            variant="primary"
            type="submit"
            v-on:click="logout"
            style="margin-top: 0% !important;
                  margin-bottom: 0% !important;"
          >
            {{ $t("Sign Out")}}
            <font-awesome-icon icon="power-off"/>
          </b-button>
        </b-nav-form>
      </b-navbar-nav>
    </b-navbar>
    <div class="wrapper">
      <nav id="sidebar" v-bind:class="{ active: isActive }">
        <div class="sidebar-header logoline">
          <img class="responsive" src="../images/hmnb.png">
        </div>
        <ul class="list-unstyled components">
          <li v-bind:class="{ 'bg-primary': homePrimary }">
            <a @click.prevent="rtsvfun">
              <font-awesome-icon icon="clock"/>
              {{ $t("Real Time Status")}}
            </a>
          </li>
          <li v-bind:class="{ 'bg-primary': analysisPrimary }">
            <a @click.prevent="hdvfun">
              <font-awesome-icon icon="chart-bar"/>
              {{ $t("Charts")}}
            </a>
          </li>
          <li v-on:click="lang">
            <a>
              <font-awesome-icon icon="language"/>
              {{ $t("language")}}
            </a>
          </li>
          <b-button
            v-if="false"
            class="data_source text-left"
            v-on:click="change_data_source()"
            variant="light"
          >{{ $t("data_source_cs")}}</b-button>
          <b-button
            v-if="false"
            class="data_source text-left"
            v-on:click="change_data_source()"
            variant="light"
          >{{ $t("data_source_sa")}}</b-button>
          <li v-if="multiselectVisibility" v-on:click="csv">
            <a>
              <font-awesome-icon icon="download"/>
              {{ $t("Download CSV")}}
            </a>
          </li>
          <li v-if="multiselectVisibility" v-on:click="editMachineNames">
            <a>
              <font-awesome-icon icon="edit"/>
              {{ $t("Edit Machine Names")}}
            </a>
          </li>
          <li class="logoline" v-if="multiselectVisibility" v-on:click="show_machine_list">
            <a>
              <font-awesome-icon icon="arrows-alt-v"/>
              {{ $t("Select Machines")}}
            </a>
          </li>
          <li class="text-center" v-if="show_ml">
            <div class="logoline">
              <label for="4-01">{{value_01}}</label>
              <input type="checkbox" id="4-01" value="4-01" v-model="value">
              <br>
              <label for="4-02">{{value_02}}</label>
              <input type="checkbox" id="4-02" value="4-02" v-model="value">
              <br>
              <label for="4-03">{{value_03}}</label>
              <input type="checkbox" id="4-03" value="4-03" v-model="value">
              <br>
              <label for="4-05">{{value_05}}</label>
              <input type="checkbox" id="4-05" value="4-05" v-model="value">
              <br>
              <label for="4-06">{{value_06}}</label>
              <input type="checkbox" id="4-06" value="4-06" v-model="value">
              <br>
              <label for="4-07">{{value_07}}</label>
              <input type="checkbox" id="4-07" value="4-07" v-model="value">
              <br>
              <label for="4-09">{{value_09}}</label>
              <input type="checkbox" id="4-09" value="4-09" v-model="value">
              <br>
            </div>
            <div class="logoline">
              <label for="4-C1">{{value_c1}}</label>
              <input type="checkbox" id="4-C1" value="4-C1" v-model="value">
            </div>
          </li>
          <li>{{checkedMachines}}</li>
          <li class="text-center" v-if="show_ml">
            <button class="btn tab-button" type="submit" @click.prevent="submit">{{ $t("Apply")}}</button>
          </li>
        </ul>
      </nav>
      <div id="content" style="min-height: 87vh;">
        <real-time-status v-if="realtimestatusvisible" :langvar="lang_var" ref="realtimestatus"></real-time-status>
        <historical-data
          v-if="historicaldatavisible"
          :machineList="value"
          :langvar="lang_var"
          ref="sync"
        ></historical-data>
        <b-modal ref="csvModal" hide-footer text-center>
          {{$t('Select Duration')}}:
          <br>
          <div class="row">
            <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select Starting Month")}}</div>
            <div class="col-xl-6 col-sm-6 mb-6">
              <datepicker
                :format="customMonthFormatter"
                :disabledDates="state.disabledDates"
                placeholder="Select Start Date"
                :minimumView="'month'"
                :maximumView="'year'"
                :initialView="'year'"
                v-model="csv_start_date"
              ></datepicker>
            </div>
          </div>
          <div class="row">
            <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select Ending Month")}}</div>
            <div class="col-xl-6 col-sm-6 mb-6">
              <datepicker
                :format="customMonthFormatter"
                :disabledDates="state.disabledDates"
                placeholder="Select Start Date"
                :minimumView="'month'"
                :maximumView="'year'"
                :initialView="'year'"
                v-model="csv_end_date"
              ></datepicker>
            </div>
          </div>
          <span class="text-danger" v-if="csvwarning01">{{$t("csv_warning")}}</span>
          <b-btn
            class="mt-3"
            variant="outline-primary"
            block
            @click="hideCsvModal"
          >{{ $t("Download as CSV")}}</b-btn>
        </b-modal>
        <b-modal ref="editMachineNamesModal" hide-footer text-center>
          <div class="text-center">
            {{$t('Edit Machine Names')}}:
            <br>
            <br>
            <label for="4-01">4-01</label>
            <input
              id="4-01"
              v-model="value_01"
              style="margin-left:5%;padding-left:5%;border: 1px solid #00ff02;"
            >
            <br>
            <label for="4-02">4-02</label>
            <input
              id="4-02"
              v-model="value_02"
              style="margin-left:5%;padding-left:5%;border: 1px solid #00ff02;"
            >
            <br>
            <label for="4-03">4-03</label>
            <input
              id="4-03"
              v-model="value_03"
              style="margin-left:5%;padding-left:5%;border: 1px solid #00ff02;"
            >
            <br>
            <label for="4-05">4-05</label>
            <input
              id="4-05"
              v-model="value_05"
              style="margin-left:5%;padding-left:5%;border: 1px solid #00ff02;"
            >
            <br>
            <label for="4-06">4-06</label>
            <input
              id="4-06"
              v-model="value_06"
              style="margin-left:5%;padding-left:5%;border: 1px solid #00ff02;"
            >
            <br>
            <label for="4-07">4-07</label>
            <input
              id="4-07"
              v-model="value_07"
              style="margin-left:5%;padding-left:5%;border: 1px solid #00ff02;"
            >
            <br>
            <label for="4-09">4-09</label>
            <input
              id="4-09"
              v-model="value_09"
              style="margin-left:5%;padding-left:5%;border: 1px solid #00ff02;"
            >
            <br>
            <label for="4-C1">4-C1</label>
            <input
              id="4-C1"
              v-model="value_c1"
              style="margin-left:5%;padding-left:5%;border: 1px solid #00ff02;"
            >
          </div>
          <b-btn
            class="mt-3"
            variant="outline-primary"
            block
            @click="hideEditMachineNamesModal"
          >{{ $t("Apply")}}</b-btn>
        </b-modal>
        <b-modal ref="mlwarningModal" hide-footer text-center>
          {{$t('mlwarning')}}:
          <br>
          <b-btn
            class="mt-3"
            variant="outline-primary"
            block
            @click="hidemlwarningModal"
          >{{ $t("ok")}}</b-btn>
        </b-modal>
      </div>
    </div>
    <div class="customfooter">
      <footer class="sticky-footer">
        <div>
          <div class="copyright text-center my-auto">
            <span>Copyright © Asquared IoT Pvt. Ltd. 2019</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
<script src="../js/dashboard.js">
</script>

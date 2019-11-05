<!-- Copyright Asquared IoT Pvt. Ltd. 2019
  Asquared IoT Pvt. Ltd. Confidential Information
  Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta
-->
<template>
  <div>
    <moon-loader id="loader" :loading="loading" :color="color" style="margin-left: 45%"></moon-loader>
    <div id="content-wrapper" v-blur="blurConfig">
      <div id="container-fluid">
        <!-- Icon Cards-->
        <div class="row">
          <div class="col-xl-3 col-sm-6 mb-3">
            <div class="card bg-default o-hidden h-100">
              <div class="card-header">
                <b>{{ $t("Operation Time")}}</b>
              </div>
              <div class="card-body text-center">
                {{$t("Cumulative Operation Time")}}:
                <span style="font-size: 100%;">
                  <b>{{operation_circle_cumulative}}</b>
                </span>
                <br>
                {{cumulative_operation_time}}
                <br>
                {{$t("Average Operation Time")}}:
                <span style="font-size: 100%;">
                  <b>{{operation_circle}}</b>
                </span>
                <br>
                {{average_operation_time}}
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-sm-6 mb-3">
            <div class="card bg-default o-hidden h-100">
              <div class="card-header">
                <b>{{ $t("Down Time")}}</b>
              </div>
              <div class="card-body text-center">
                {{$t("Cumulative Downtime Time")}}:
                <span style="font-size: 100%;">
                  <b>{{downtime_circle_cumulative}}</b>
                </span>
                <br>
                {{cumulative_downtime_time}}
                <br>
                {{$t("Average Downtime Time")}}:
                <span style=" font-size: 100%">
                  <b>{{downtime_circle}}</b>
                </span>
                <br>
                {{average_downtime_time}}
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-sm-6 mb-3">
            <div class="card bg-default o-hidden h-100">
              <div class="card-header">
                <b>{{ $t("Operation Rate")}}</b>
              </div>
              <div class="card-body text-center">
                <span style=" font-size: 100%">
                  <b>{{ operation_rate_circle }}</b>
                </span> %
                <v-progress-circular
                  :rotate="-90"
                  :size="50"
                  :width="15"
                  :value="operation_rate_circle"
                  color="teal"
                ></v-progress-circular>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-sm-6 mb-3">
            <div class="card bg-default o-hidden h-100">
              <div class="card-header">
                <b>{{ $t("Downtime Rate")}}</b>
              </div>
              <div class="card-body text-center">
                <span style=" font-size: 100%">
                  <b>{{ downtime_rate_circle }}</b>
                </span> %
                <v-progress-circular
                  :rotate="-90"
                  :size="50"
                  :width="15"
                  :value="downtime_rate_circle"
                  color="red"
                ></v-progress-circular>
              </div>
            </div>
          </div>
        </div>
        <!--Tab Buttons-->
        <div class="text-center">
          <button
            class="btn tab-button btn-duration"
            type="button"
            v-on:click="changeTimeSetting"
            style="margin-right: 1%"
          >{{$t("Time Setting")}}</button>
          <div aria-label="..." class="btn-group" role="group">
            <button
              class="btn tab-button"
              v-bind:class="{'btn-default':todayDefault, 'btn-duration': todayDefault, 'btn-primary': todayPrimary }"
              v-on:click="today"
              type="button"
            >{{$t("Today")}}</button>
            <button
              class="btn tab-button"
              v-bind:class="{'btn-default': dayDefault, 'btn-duration': dayDefault, 'btn-primary': dayPrimary }"
              v-on:click="day_modal"
              type="button"
            >{{$t("Day")}}</button>
            <button
              class="btn tab-button"
              v-bind:class="{'btn-default': weekDefault, 'btn-duration': weekDefault, 'btn-primary': weekPrimary }"
              type="button"
              v-on:click="week_modal"
            >{{ $t("Week")}}</button>
            <button
              class="btn tab-button"
              v-bind:class="{'btn-default': monthDefault, 'btn-duration': monthDefault, 'btn-primary': monthPrimary }"
              type="button"
              v-on:click="month_modal"
            >{{ $t("Month")}}</button>
            <button
              class="btn tab-button"
              v-bind:class="{'btn-default': sixMonthDefault, 'btn-duration': sixMonthDefault, 'btn-primary': sixMonthPrimary }"
              type="button"
              v-on:click="sixmonth_modal"
            >{{ $t("6 Months")}}</button>
            <button
              class="btn tab-button"
              v-bind:class="{'btn-default': yearDefault, 'btn-duration': yearDefault, 'btn-primary': yearPrimary }"
              type="button"
              v-on:click="year_modal"
            >{{ $t("Year")}}</button>
            <button
              class="btn tab-button"
              v-bind:class="{'btn-default': customDefault, 'btn-duration': customDefault, 'btn-primary': customPrimary }"
              v-on:click="custom"
            >{{ $t("Custom")}}</button>
          </div>
          <b-modal ref="customModal" hide-footer text-center>
            <div class="row">
              <div class="col-xl-12 col-sm-12 mb-12">
                {{$t('Select Duration')}}:
                <br>
              </div>
              <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select Start Date")}}</div>
              <div class="col-xl-6 col-sm-6 mb-6">
                <datepicker
                  :disabledDates="state.disabledDates"
                  placeholder="Select Start Date"
                  v-model="start_date"
                ></datepicker>
              </div>
            </div>
            <div class="row">
              <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select End Date")}}</div>
              <div class="col-xl-6 col-sm-6 mb-6">
                <datepicker
                  :disabledDates="state.disabledDates"
                  placeholder="Select End Date"
                  v-model="end_date"
                ></datepicker>
              </div>
            </div>
            <span class="text-danger" v-if="customwarning01">{{$t("csv_warning")}}</span>
            <b-btn
              class="mt-3"
              variant="outline-primary"
              block
              @click="hideCustomModal"
            >{{ $t("Apply")}}</b-btn>
          </b-modal>

          <b-modal ref="dayModal" hide-footer text-center>
            <div class="row">
              <div class="col-xl-12 col-sm-12 mb-12">
                {{$t('Select Duration')}}:
                <br>
              </div>

              <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select Start Date")}}</div>
              <div class="col-xl-6 col-sm-6 mb-6">
                <datepicker
                  :disabledDates="state.disabledDates"
                  placeholder="Select Start Date"
                  v-model="start_date"
                ></datepicker>
              </div>
            </div>
            <b-btn class="mt-3" variant="outline-primary" block @click="day">{{ $t("Apply")}}</b-btn>
          </b-modal>

          <b-modal ref="weekModal" hide-footer text-center>
            <div class="row">
              <div class="col-xl-12 col-sm-12 mb-12">
                {{$t('Select Duration')}}:
                <br>
              </div>
              <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select Start Date")}}</div>
              <div class="col-xl-6 col-sm-6 mb-6">
                <datepicker
                  placeholder="Select Start Date"
                  :disabledDates="disabledFn"
                  v-model="start_date"
                ></datepicker>
              </div>
            </div>
            <b-btn class="mt-3" variant="outline-primary" block @click="week">{{ $t("Apply")}}</b-btn>
          </b-modal>

          <b-modal ref="monthModal" hide-footer text-center>
            <div class="row">
              <div class="col-xl-12 col-sm-12 mb-12">
                {{$t('Select Duration')}}:
                <br>
              </div>
              <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select Start Date")}}</div>
              <div class="col-xl-6 col-sm-6 mb-6">
                <datepicker
                  :format="customMonthFormatter"
                  :disabledDates="state.disabledDates"
                  placeholder="Select Start Date"
                  :minimumView="'month'"
                  :maximumView="'year'"
                  :initialView="'year'"
                  v-model="start_date"
                ></datepicker>
              </div>
            </div>
            <b-btn class="mt-3" variant="outline-primary" block @click="month">{{ $t("Apply")}}</b-btn>
          </b-modal>

          <b-modal ref="sixmonthModal" hide-footer text-center>
            <div class="row">
              <div class="col-xl-12 col-sm-12 mb-12">
                {{$t('Select Duration')}}:
                <br>
              </div>
              <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select Start Date")}}</div>
              <div class="col-xl-6 col-sm-6 mb-6">
                <datepicker
                  :format="customMonthFormatter"
                  :disabledDates="state.disabledDates"
                  placeholder="Select Start Date"
                  :minimumView="'month'"
                  :maximumView="'year'"
                  :initialView="'year'"
                  v-model="start_date"
                ></datepicker>
              </div>
            </div>
            <b-btn class="mt-3" variant="outline-primary" block @click="sixMonth">{{ $t("Apply")}}</b-btn>
          </b-modal>

          <b-modal ref="yearModal" hide-footer text-center>
            <div class="row">
              <div class="col-xl-12 col-sm-12 mb-12">
                {{$t('Select Duration')}}:
                <br>
              </div>
              <div class="col-xl-6 col-sm-6 mb-6">{{ $t("Select Start Date")}}</div>
              <div class="col-xl-6 col-sm-6 mb-6">
                <datepicker
                  :format="customYearFormatter"
                  :disabledDates="state.disabledDates"
                  placeholder="Select Start Date"
                  :minimumView="'year'"
                  :maximumView="'year'"
                  :initialView="'year'"
                  v-model="start_date"
                ></datepicker>
              </div>
            </div>
            <b-btn class="mt-3" variant="outline-primary" block @click="year">{{ $t("Apply")}}</b-btn>
          </b-modal>
        </div>

        <b-modal size="sm" ref="timeSettingModal" hide-footer text-center >
          <div class="row" style="margin-left: 2%">
            <div class="col-xl-2 col-sm-2 mb-2 ">{{$t('Select Duration')}}:</div>
            <div class="col-xl-4 col-sm-4 mb-4 ">{{ $t("Select Start Time")}}:</div>
            <div class="col-xl-4 col-sm-4 mb-4 " style="margin-left:3%">{{ $t("Select End Time")}}:</div>
          </div>
          <div class="row" style="margin-left: 2%;width:700px;">
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal" >
              <input
                type="radio"
                id="1"
                name="contact"
                value="start_time_to_set_hr_1"
                v-on:change="selectionChange"
                style="margin-left: 40%;"
              >
              <br>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_hr_1" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_min_1" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
            <div class="col-xl-1 col-sm-1 mb-1 col-xl-1modal">-</div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal " style="margin-left:0%">
              <select v-model="end_time_to_set_hr_1" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_min_1" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
          </div>
          <!-- Second one -->
          <div class="row" style="margin-left: 2%;width:700px;">
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <input
                type="radio"
                id="2"
                name="contact"
                value="start_time_to_set_hr_2"
                v-on:change="selectionChange"
                style="margin-left: 40%;"
              >
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_hr_2" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_min_2" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
            <div class="col-xl-1 col-sm-1 mb-1 col-xl-1modal">-</div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_hr_2" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_min_2" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
          </div>
          <!-- third one, start here -->
          <div class="row" style="margin-left: 2%;width:700px;">
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <input
                type="radio"
                id="3"
                name="contact"
                value="start_time_to_set_hr_3"
                v-on:change="selectionChange"
                style="margin-left: 40%;"
              >
            </div>

            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_hr_3" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_min_3" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
            <div class="col-xl-1 col-sm-1 mb-1 col-xl-1modal">-</div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_hr_3" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_min_3" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
          </div>
          <!-- fourth one start -->
          <div class="row" style="margin-left: 2%;width:700px;">
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <input
                type="radio"
                id="4"
                name="contact"
                value="start_time_to_set_hr_4"
                v-on:change="selectionChange"
                style="margin-left: 40%;"
              >
            </div>

            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_hr_4" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_min_4" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
            <div class="col-xl-1 col-sm-1 mb-1 col-xl-1modal">-</div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_hr_4" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_min_4" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
          </div>
          <!-- fifth one -->
          <div class="row" style="margin-left: 2%;width:700px;">
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <input
                type="radio"
                id="5"
                name="contact"
                value="start_time_to_set_hr_5"
                v-on:change="selectionChange"
                style="margin-left: 40%;"
              >
            </div>

            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_hr_5" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_min_5" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>

            <div class="col-xl-1 col-sm-1 mb-1 col-xl-1modal">-</div>

            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_hr_5" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_min_5" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
          </div>

          <!-- sixth one -->
          <div class="row" style="margin-left: 2%;width:700px;">
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <input
                type="radio"
                id="6"
                name="contact"
                value="start_time_to_set_hr_6"
                v-on:change="selectionChange"
                style="margin-left: 40%;"
              >
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_hr_6" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="start_time_to_set_min_6" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
            <div class="col-xl-1 col-sm-1 mb-1 col-xl-1modal">-</div>
            <div class=" col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_hr_6" class="form-control" required>
                <option disabled value>{{ $t("Hour")}}</option>
                <option>00</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
              </select>
            </div>
            <div class="col-xl-2 col-sm-2 mb-2 col-xl-2modal">
              <select v-model="end_time_to_set_min_6" class="form-control" required>
                <option disabled value>{{ $t("Minute")}}</option>
                <option>00</option>
                <option>10</option>
                <option>20</option>
                <option>30</option>
                <option>40</option>
                <option>50</option>
              </select>
            </div>
          </div>

          <b-btn
            class="mt-3"
            variant="outline-primary"
            style="margin: 1%;"
            block
            @click="hideTimeSettingModal"
          >{{ $t("Apply")}}</b-btn>
        </b-modal>
        <b-modal ref="mlwarningModal" hide-footer text-center>
          {{$t('mlwarning')}}
          <br>
          <b-btn
            class="mt-3"
            variant="outline-primary"
            block
            @click="hidemlwarningModal"
          >{{ $t("ok")}}</b-btn>
        </b-modal>

        <b-modal ref="scale_yaxis_operation_modal" hide-footer text-center>
          {{$t('scale_yaxis_modal')}}:
          <br>
          <input type="number" v-model="scale_yaxis_operation_value" class="form-control">
          <span v-if="scale_yaxis_operation_warning">{{$t("scale_yaxis_operation_warning")}}</span>
          <b-btn
            class="mt-3"
            variant="outline-primary"
            block
            @click="hide_scale_yaxis_operation"
          >{{ $t("ok")}}</b-btn>
        </b-modal>

        <div class="row" style="margin-top: 2%">
          <div class="col-xl-12 col-sm-12 mb-12" v-if="operation_time">
            <div class="card" id="performance">
              <div class="card-header">
                <font-awesome-icon icon="chart-bar"/>
                {{ $t("Operation Time")}}
                <span
                  style="padding-top: 6px; margin-left: 2%"
                >{{ st }} to {{ et }}</span>

                <button
                  class="btn tab-button"
                  v-bind:class="{'btn-default': yearDefault, 'btn-duration':   yearDefault, 'btn-primary': yearPrimary }"
                  style="float: right;"
                  type="button"
                  v-on:click="scale_yaxis_operation"
                >{{ $t("scale-yaxis")}}</button>

                <b-dropdown right variant="default" class="chartdropdown" no-caret>
                  <span slot="text">{{ $t("Select Chart")}}</span>
                  <a class="dropdown-item" v-on:click="operation_time_fun">{{ $t("Operation Time")}}</a>
                  <a class="dropdown-item" v-on:click="down_time_fun">{{ $t("Down Time")}}</a>
                  <a class="dropdown-item" v-on:click="operation_rate_fun">{{ $t("Operation Rate")}}</a>
                </b-dropdown>
              </div>
              <div card="body" class="cardbody">
                <div class="chart-container" style="position: relative; height:350px; width:100%">
                  <canvas id="performance-chart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-12 col-sm-12 mb-12" v-if="down_time">
            <div class="card" id="availability">
              <div class="card-header">
                <font-awesome-icon icon="chart-bar"/>
                {{ $t("Down Time")}}
                <span style="padding-top: 6px; margin-left: 2%">{{ st }} to {{ et }}</span>

                <button
                  class="btn tab-button"
                  v-bind:class="{'btn-default': yearDefault, 'btn-duration':   yearDefault, 'btn-primary': yearPrimary }"
                  style="float: right;"
                  type="button"
                  v-on:click="scale_yaxis_operation"
                >{{ $t("scale-yaxis")}}</button>

                <b-dropdown right variant="default" class="chartdropdown" no-caret>
                  <span slot="text">{{ $t("Select Chart")}}</span>
                  <a class="dropdown-item" v-on:click="operation_time_fun">{{ $t("Operation Time")}}</a>
                  <a class="dropdown-item" v-on:click="down_time_fun">{{ $t("Down Time")}}</a>
                  <a class="dropdown-item" v-on:click="operation_rate_fun">{{ $t("Operation Rate")}}</a>
                </b-dropdown>
                <!-- Modal Component -->
              </div>
              <div card="body" class="cardbody">
                <div class="chart-container" style="position: relative; height:350px; width:100%">
                  <canvas id="availability-chart"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-12 col-sm-12 mb-12" v-if="operation_rate">
            <div class="card" id="quality">
              <div class="card-header">
                <font-awesome-icon icon="chart-bar"/>
                {{ $t("Operation Rate")}}
                <span style="padding-top: 6px; margin-left: 2%">{{ st }} to {{ et }}</span>

                <button
                  class="btn tab-button"
                  v-bind:class="{'btn-default': yearDefault, 'btn-duration':   yearDefault, 'btn-primary': yearPrimary }"
                  style="float: right;"
                  type="button"
                  v-on:click="scale_yaxis_operation"
                >{{ $t("scale-yaxis")}}</button>

                <b-dropdown right variant="default" class="chartdropdown" no-caret>
                  <span slot="text">{{ $t("Select Chart")}}</span>
                  <a class="dropdown-item" v-on:click="operation_time_fun">{{ $t("Operation Time")}}</a>
                  <a class="dropdown-item" v-on:click="down_time_fun">{{ $t("Down Time")}}</a>
                  <a class="dropdown-item" v-on:click="operation_rate_fun">{{ $t("Operation Rate")}}</a>
                </b-dropdown>
              </div>
              <div card="body" class="cardbody">
                <div class="chart-container" style="position: relative; height:350px; width:100%">
                  <canvas id="quality-chart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script src="../js/historicalData.js">
</script>

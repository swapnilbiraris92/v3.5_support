<!-- Copyright Asquared IoT Pvt. Ltd. 2019
 Asquared IoT Pvt. Ltd. Confidential Information
 Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta -->
 <template>
  <div id="content-wrapper" >
    <div id="container-fluid" > 
      <b-modal  ref="thresholdSettingModal01"  hide-footer  text-center>
        {{$t('Select New Threshold')}}:
        <input class="form-control" type="number" max="100" min="0" v-model="thresholdtodisplay.thresholdMachine01" >
        <span v-if="thresholdwarning01">{{$t("threshold_warning")}}</span>
        <b-btn class="mt-3" variant="outline-primary" style="margin: 1%;" block @click="hideThresholdSettingModal01"> 
          {{ $t("Apply")}}
        </b-btn>
      </b-modal>

      <b-modal  ref="thresholdSettingModal02"  hide-footer text-center>
        {{$t('Select New Threshold')}}:
        <input  class="form-control" type="number" max="100" min="0" v-model="thresholdtodisplay.thresholdMachine02" >
        <span v-if="thresholdwarning02">{{$t("threshold_warning")}}</span>
        <b-btn class="mt-3" variant="outline-primary" style="margin: 1%;" block @click="hideThresholdSettingModal02">
          {{ $t("Apply")}}
        </b-btn>
      </b-modal>
      <b-modal  ref="thresholdSettingModal03"  hide-footer text-center>
        {{$t('Select New Threshold')}}:
        <input  class="form-control" type="number" max="100" min="0" v-model="thresholdtodisplay.thresholdMachine03" >
        <span v-if="thresholdwarning03">{{$t("threshold_warning")}}</span>
        <b-btn class="mt-3" variant="outline-primary" style="margin: 1%;" block @click="hideThresholdSettingModal03">
          {{ $t("Apply")}}
        </b-btn>
      </b-modal>
      <b-modal  ref="thresholdSettingModal05"  hide-footer  text-center>
        {{$t('Select New Threshold')}}:
        <input type="number" max="100" min="0" v-model="thresholdtodisplay.thresholdMachine05" class="form-control">
        <span v-if="thresholdwarning05">{{$t("threshold_warning")}}</span>
        <b-btn class="mt-3" variant="outline-primary" style="margin: 1%;" block @click="hideThresholdSettingModal05"> 
          {{ $t("Apply")}}
        </b-btn>
      </b-modal>
      <b-modal  ref="thresholdSettingModal06"  hide-footer   text-center>
        {{$t('Select New Threshold')}}:
        <input type="number" max="100" min="0" v-model="thresholdtodisplay.thresholdMachine06" class="form-control">
        <span v-if="thresholdwarning06">{{$t("threshold_warning")}}</span>
        <b-btn class="mt-3" variant="outline-primary" style="margin: 1%;" block @click="hideThresholdSettingModal06">
          {{ $t("Apply")}}
        </b-btn>
      </b-modal>
      <b-modal  ref="thresholdSettingModal07"  hide-footer text-center>
        {{$t('Select New Threshold')}}:
        <input type="number" max="100" min="0" v-model="thresholdtodisplay.thresholdMachine07" class="form-control">
        <span v-if="thresholdwarning07">{{$t("threshold_warning")}}</span>
        <b-btn class="mt-3" variant="outline-primary" style="margin: 1%;" block @click="hideThresholdSettingModal07">
          {{ $t("Apply")}}
        </b-btn>
      </b-modal>
      <b-modal  ref="thresholdSettingModal09"  hide-footer text-center>
        {{$t('Select New Threshold')}}:
        <input type="number" max="100" min="0" v-model="thresholdtodisplay.thresholdMachine09" class="form-control">
        <span v-if="thresholdwarning09">{{$t("threshold_warning")}}</span>
        <b-btn class="mt-3" variant="outline-primary" style="margin: 1%;" block @click="hideThresholdSettingModal09">
          {{ $t("Apply")}}
        </b-btn>
      </b-modal>

      <div class="row" >
        <div class="col-xl-4 col-sm-6 mb-3">
          <div class="card" v-bind:class="{'bg-warning': warning['machine01'], 'bg-success':success['machine01'],'bg-danger': danger['machine01'], 'bg-default': mdefault['machine01'], 'border-3':borderColor.machine01}" v-bind:style="{color: defaultTextColor.machine01}">
            <div class="card-header">
              <b>{{value_01}}</b>
              <div style="float: right;">
              <button class="btn tab-button btn-duration"  type="button" v-on:click="changeThresholdSetting01" >
                {{ $t("Threshold Setting")}}
              </button>&nbsp;&nbsp;{{thresholdtodisplay.thresholdMachine01}}
            </div>
            </div>
            <div class="card-body text-center" v-if="dnc_list['machine01']">
              <span v-if="con_stat_con['machine01']"> {{ $t("Device is connecting")}}</span>
              <span v-if="con_stat_not_con['machine01']"> {{ $t("Device is not connected")}}</span>
            </div>
            <div class="card-body" v-if="cbodyVisible_list['machine01']">
              <span>
                <b> {{ $t("Status")}}: {{ status.machine01 }}</b><br>
                <b> {{ $t("Operation Time")}}: {{operation_time.machine01}}</b><br>
                <b> {{ $t("Down Time")}}: {{downtime.machine01}}</b><br>
                <b> {{ $t("Operation Rate")}}: 
                  <span v-bind:style="{ color: textColor.machine01}">
                    {{operation_rate.machine01}}%
                  </span>
                </b><br>
                <b> {{ $t("Downtime Rate")}}: {{downtime_rate.machine01}}%</b><br>
                <b> {{ $t("Total Cutting Number")}}: {{job_count.machine01}}</b><br>
                <b> {{ $t("Barcode_Id")}}: {{ barcode.machine01 }}</b>
              </span>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 mb-3">
          <div class="card" v-bind:class="{'bg-warning':warning['machine02'], 'bg-success':success['machine02'],
          'bg-danger': danger['machine02'], 'bg-default': mdefault['machine02'], 'border-3': borderColor.machine02}" v-bind:style="{color: defaultTextColor.machine02}">
            <div class="card-header">
              <b>{{value_02}}</b>
              <div style="float: right;">
              <button class="btn tab-button btn-duration"  type="button" v-on:click="changeThresholdSetting02" >
                {{ $t("Threshold Setting")}}
              </button>&nbsp;&nbsp;{{thresholdtodisplay.thresholdMachine02}}
            </div>
            </div>
            <div class="card-body text-center" v-if="dnc_list['machine02']">
             <span v-if="con_stat_con['machine02']"> {{ $t("Device is connecting")}}</span>
              <span v-if="con_stat_not_con['machine02']"> {{ $t("Device is not connected")}}</span>
            </div>
            <div class="card-body" v-if="cbodyVisible_list['machine02']">
              <span>
                <b> {{ $t("Status")}}: {{ status.machine02 }}</b><br>
                <b> {{ $t("Operation Time")}}: {{operation_time.machine02}}</b><br>
                <b> {{ $t("Down Time")}}: {{downtime.machine02}}</b><br>
                <b> {{ $t("Operation Rate")}}: 
                  <span v-bind:style="{ color: textColor.machine02}">
                    {{operation_rate.machine02}}%
                  </span>
                </b><br>
                <b> {{ $t("Downtime Rate")}}: {{downtime_rate.machine02}}%</b><br>
                <b> {{ $t("Total Cutting Number")}}: {{job_count.machine02}}</b><br>
                <b> {{ $t("Barcode_Id")}}: {{ barcode.machine02 }}</b>
              </span>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 mb-3">
          <div class="card" v-bind:class="{'bg-warning':warning['machine03'], 'bg-success':success['machine03'], 'bg-danger': danger['machine03'], 'bg-default': mdefault['machine03'], 'border-3': borderColor.machine03}" v-bind:style="{color: defaultTextColor.machine03}">
            <div class="card-header">
              <b>{{value_03}}</b>
              <div style="float: right;">
              <button class="btn tab-button btn-duration"  type="button" v-on:click="changeThresholdSetting03" >
                {{ $t("Threshold Setting")}}
              </button>&nbsp;&nbsp;{{thresholdtodisplay.thresholdMachine03}}
            </div>
            </div>
            <div class="card-body text-center" v-if="dnc_list['machine03']">
              <span v-if="con_stat_con['machine03']"> {{ $t("Device is connecting")}}</span>
              <span v-if="con_stat_not_con['machine03']"> {{ $t("Device is not connected")}}</span>
            </div>
            <div class="card-body" v-if="cbodyVisible_list['machine03']">
              <span>
                <b> {{ $t("Status")}}: {{ status.machine03 }}</b><br>
                <b> {{ $t("Operation Time")}}: {{operation_time.machine03}}</b><br>
                <b> {{ $t("Down Time")}}: {{downtime.machine03}}</b><br>
                <b> {{ $t("Operation Rate")}}: 
                  <span v-bind:style="{ color: textColor.machine03}">
                    {{operation_rate.machine03}}% 
                  </span>
                </b><br>
                <b> {{ $t("Downtime Rate")}}: {{downtime_rate.machine03}}%</b><br>
                <b> {{ $t("Total Cutting Number")}}: {{job_count.machine03}}</b><br>
                <b> {{ $t("Barcode_Id")}}: {{ barcode.machine03 }}</b>
              </span>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 mb-3">
          <div class="card " v-bind:class="{'bg-warning':warning['machine05'], 'bg-success':success['machine05'],'bg-danger': danger['machine05'], 'bg-default': mdefault['machine05'], 'border-3': borderColor.machine05}" v-bind:style="{color: defaultTextColor.machine05}">
            <div class="card-header">
              <b>{{value_05}}</b>
              <div style="float: right;">
              <button class="btn tab-button btn-duration"  type="button" v-on:click="changeThresholdSetting05" >
                {{ $t("Threshold Setting")}}
              </button>&nbsp;&nbsp;{{thresholdtodisplay.thresholdMachine05}}
            </div>
            </div>
            <div class="card-body text-center" v-if="dnc_list['machine05']">
              <span v-if="con_stat_con['machine05']"> {{ $t("Device is connecting")}}</span>
              <span v-if="con_stat_not_con['machine05']"> {{ $t("Device is not connected")}}</span>
            </div>
            <div class="card-body" v-if="cbodyVisible_list['machine05']">
              <span>
                <b> {{ $t("Status")}}: {{ status.machine05 }}</b><br>
                <b> {{ $t("Operation Time")}}: {{operation_time.machine05}}</b><br>
                <b> {{ $t("Down Time")}}: {{downtime.machine05}}</b><br>
                <b> {{ $t("Operation Rate")}}: 
                  <span v-bind:style="{ color: textColor.machine05}">
                    {{operation_rate.machine05}}%
                  </span>
                </b><br>
                <b> {{ $t("Downtime Rate")}}: {{downtime_rate.machine05}}%</b><br>
                <b> {{ $t("Total Cutting Number")}}: {{job_count.machine05}}</b><br>
                <b> {{ $t("Barcode_Id")}}: {{ barcode.machine05 }}</b>
              </span>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 mb-3">
          <div class="card" v-bind:class="{'bg-warning':warning['machine06'], 'bg-success':success['machine06'],'bg-danger': danger['machine06'], 'bg-default': mdefault['machine06'], 'border-3': borderColor.machine06}" v-bind:style="{color: defaultTextColor.machine06}">
            <div class="card-header">
              <b>{{value_06}}</b>
              <div style="float: right;">
              <button class="btn tab-button btn-duration"  type="button" v-on:click="changeThresholdSetting06" >
                {{ $t("Threshold Setting")}}
              </button>&nbsp;&nbsp;{{thresholdtodisplay.thresholdMachine06}}
            </div>
            </div>
            <div class="card-body text-center" v-if="dnc_list['machine06']">
              <span v-if="con_stat_con['machine06']"> {{ $t("Device is connecting")}}</span>
              <span v-if="con_stat_not_con['machine06']"> {{ $t("Device is not connected")}}</span>
            </div>
            <div class="card-body" v-if="cbodyVisible_list['machine06']">
              <span>
                <b> {{ $t("Status")}}: {{ status.machine06 }}</b><br>
                <b> {{ $t("Operation Time")}}: {{operation_time.machine06}}</b><br>
                <b> {{ $t("Down Time")}}: {{downtime.machine06}}</b><br>
                <b> {{ $t("Operation Rate")}}: 
                  <span v-bind:style="{ color: textColor.machine06}">  
                    {{operation_rate.machine06}}%
                  </span>
                </b><br>
                <b> {{ $t("Downtime Rate")}}: {{downtime_rate.machine06}}%</b><br>
                <b> {{ $t("Total Cutting Number")}}: {{job_count.machine06}}</b><br>
                <b> {{ $t("Barcode_Id")}}: {{ barcode.machine06 }}</b>
              </span>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 mb-3">
          <div class="card" v-bind:class="{'bg-warning':warning['machine07'], 'bg-success':success['machine07'],'bg-danger': danger['machine07'], 'bg-default': mdefault['machine07'], 'border-3': borderColor.machine07}" v-bind:style="{color: defaultTextColor.machine07}">
            <div class="card-header">
              <b>{{value_07}}</b>
              <div style="float: right;">
              <button class="btn tab-button btn-duration"  type="button" v-on:click="changeThresholdSetting07" >
                {{ $t("Threshold Setting")}}
              </button>&nbsp;&nbsp;{{thresholdtodisplay.thresholdMachine07}}
            </div>
            </div>
            <div class="card-body text-center" v-if="dnc_list['machine07']">
              <span v-if="con_stat_con['machine07']"> {{ $t("Device is connecting")}}</span>
              <span v-if="con_stat_not_con['machine07']"> {{ $t("Device is not connected")}}</span>
            </div>
            <div class="card-body" v-if="cbodyVisible_list['machine07']">
              <span>
                <b> {{ $t("Status")}}: {{ status.machine07 }}</b><br>
                <b> {{ $t("Operation Time")}}: {{operation_time.machine07}}</b><br>
                <b> {{ $t("Down Time")}}: {{downtime.machine07}}</b><br>
                <b> {{ $t("Operation Rate")}}: 
                  <span v-bind:style="{ color: textColor.machine07}"> 
                    {{operation_rate.machine07}}%
                  <span></span>
                </b><br>
                <b> {{ $t("Downtime Rate")}}: {{downtime_rate.machine07}}%</b><br>
                <b> {{ $t("Total Cutting Number")}}: {{job_count.machine07}}</b><br>
                <b> {{ $t("Barcode_Id")}}: {{ barcode.machine07 }}</b>
              </span>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 mb-3">
          <div class="card" v-bind:class="{'bg-warning':warning['machine09'], 'bg-success':success['machine09'],'bg-danger': danger['machine09'], 'bg-default': mdefault['machine09'], 'border-3': borderColor.machine09}" v-bind:style="{color: defaultTextColor.machine09}">
            <div class="card-header">
              <b>{{value_09}}</b>
              <div  style="float: right;">
              <button class="btn tab-button btn-duration"  type="button" v-on:click="changeThresholdSetting09" >
                {{ $t("Threshold Setting")}}
              </button>&nbsp;&nbsp;{{thresholdtodisplay.thresholdMachine09}}
            </div>
            </div>
            <div class="card-body text-center" v-if="dnc_list['machine09']">
              <span v-if="con_stat_con['machine09']"> {{ $t("Device is connecting")}}</span>
              <span v-if="con_stat_not_con['machine09']"> {{ $t("Device is not connected")}}</span>
            </div>
            <div class="card-body" v-if="cbodyVisible_list['machine09']">
              <span>
                <b> {{ $t("Status")}}: {{ status.machine09 }}</b><br>
                <b> {{ $t("Operation Time")}}: {{operation_time.machine09}}</b><br>
                <b> {{ $t("Down Time")}}: {{downtime.machine09}}</b><br>
                <b> {{ $t("Operation Rate")}}: 
                  <span v-bind:style="{ color: textColor.machine09}">
                    {{operation_rate.machine09}}%
                  </span>
                </b><br>
                <b> {{ $t("Downtime Rate")}}: {{downtime_rate.machine09}}%</b><br>
                <b> {{ $t("Total Cutting Number")}}: {{job_count.machine09}}</b><br>
                <b> {{ $t("Barcode_Id")}}: {{ barcode.machine09 }}</b>
              </span>         
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-6 mb-3">
          <div class="card" v-bind:class="{'bg-warning':warning['machineC1'], 'bg-success':success['machineC1'], 'bg-danger': danger['machineC1'], 'bg-default': mdefault['machineC1']}"  v-bind:style="{color: defaultTextColor.machineC1}">
            <div class="card-header">
              <b>4-C1</b>
            </div>
            <div class="card-body text-center" v-if="dnc_list['machineC1']">
              <span v-if="con_stat_con['machineC1']"> {{ $t("Device is connecting")}}</span>
              <span v-if="con_stat_not_con['machineC1']"> {{ $t("Device is not connected")}}</span>
            </div>
            <div class="card-body" v-if="cbodyVisible_list['machineC1']">
              <span>
                <b> {{ $t("Status")}}: {{ status.machineC1 }}</b><br>
                <b> {{ $t("Operation Time")}}: {{operation_time.machineC1}}</b><br>
                <b> {{ $t("Down Time")}}: {{downtime.machineC1}}</b><br>
                <b> {{ $t("Operation Rate")}}: {{operation_rate.machineC1}}%</b><br>
                <b> {{ $t("Downtime Rate")}}: {{downtime_rate.machineC1}}%</b>
              </span>
            </div>  
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script src="../js/realTimeStatus.js">
</script>
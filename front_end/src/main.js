// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
// Shared with Koninca Minolta Inc on March 08, 2019, under NDA between Asqaured IoT and Konica Minolta


// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import App from './App'
import router from './router'
import '@babel/polyfill'
import Vue from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { faLanguage } from '@fortawesome/free-solid-svg-icons'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons'
 
import './css/progress-circle.css'
import './css/number-of-cuts-progress-circle.css'
import './css/occupancy-rate-progress-circle.css'
import './css/down-time-progress-circle.css'
//import './css/bootstrap-datetimepicker-standalone.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import i18n from './i18n'
import vBlur from "v-blur";
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './css/sidebarstyle.css'
import './css/custom.css'
 
Vue.use(Vuetify)
Vue.use(vBlur);
Vue.use(VueAxios, axios)

library.add(faEllipsisV)
library.add(faPowerOff)
library.add(faHome)
library.add(faCog)
library.add(faChartBar)
library.add(faClock)
library.add(faLanguage)
library.add(faDownload)
library.add(faArrowsAltV)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false


Vue.use(BootstrapVue);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  i18n,
  template: '<App/>'
})

import 'core-js/stable'
import Vue from 'vue'
import App from './App'
import router from './router'
//import CoreuiVue from '@coreui/vue'
//import CoreuiVue from '@coreui/vue-pro'
import CoreuiVuePro from '../node_modules/@coreui/vue-pro/src/index.js'
import { iconsSet as icons } from './assets/icons/icons.js'
import store from './store'
import Axios from 'axios'
import { cibNextJs } from '@coreui/icons'
import Vuelidate from 'vuelidate'
import Multiselect from 'vue-multiselect'
import VueMoment from 'vue-moment'
import moment from 'moment-timezone'
import VueMarkdown from 'vue-markdown'
import VueClipboard from 'vue-clipboard2'
import Prism from 'prismjs';
import VueSimpleContextMenu from "vue-simple-context-menu";
import VCalendar from 'v-calendar';
import { CMultiSelect } from '@coreui/vue-pro';
import Editor from 'v-markdown-editor'
import VueApexCharts from 'vue-apexcharts'
import JSONView from 'vue-json-component';
import VueTour from 'vue-tour'

require('vue-tour/dist/vue-tour.css')

Vue.config.performance = true
Vue.use(CoreuiVuePro)
Vue.use(Vuelidate)
Vue.component('multiselect', Multiselect)
Vue.use(VueMoment, {moment})
Vue.use(VueClipboard)
Vue.use(VCalendar)
Vue.use(Editor);
Vue.use(VueApexCharts)
Vue.use(JSONView)
Vue.use(VueTour)

Vue.component('apexchart', VueApexCharts)
Vue.component('vue-markdown', VueMarkdown)
Vue.component("vue-simple-context-menu", VueSimpleContextMenu);
Vue.component(CMultiSelect)

Vue.prototype.$log = console.log.bind(console)
Vue.prototype.$http = Axios;

const access_token = localStorage.getItem('access_token')
if (access_token) {
  Vue.prototype.$http.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
}

Vue.prototype.$http.interceptors.response.use(function(response) {
      return response
  },
  function(error) {
    return new Promise(function (resolve, reject) {
      const {status} = error.response
      if(status === 401) {
        store.dispatch('logout')
        window.location.href = '/#/login'
      }
      if(status === 404) {
        window.location.href = '/#/404'
      }
      if(status === 403) {
        store.dispatch('logout')
        window.location.href = '/#/login'
      }
      reject(error)
    }
  )
})


new Vue({
  el: '#app',
  router,
  store,
  icons,
  template: '<App/>',
  components: {
    App
  }
})


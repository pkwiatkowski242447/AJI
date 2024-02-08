import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import {createPinia, PiniaVuePlugin} from "pinia";

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(PiniaVuePlugin)

Vue.config.productionTip = false

const pinia = createPinia();

new Vue({
  pinia,
  render: h => h(App),
}).$mount('#app')

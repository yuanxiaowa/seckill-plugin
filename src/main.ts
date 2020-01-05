/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:12:05
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-23 15:17:47
 */
import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./msg";
import "./filters";
import "./components";
// import router from "./router";

Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  // router,
  render: h => h(App)
}).$mount("#app");

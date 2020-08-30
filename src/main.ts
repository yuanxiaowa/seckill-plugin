/*
 * @Author: oudingyin
 * @Date: 2019-07-01 09:12:05
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-23 15:17:47
 */
import Vue from "vue";
import router from "./router";
import App from "./App.vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./msg";
import "./filters";
import "./directives";
import "./components";

Vue.use(ElementUI, { size: "mini" });
// Vue.prototype.$ELEMENT = { size: "small" };

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");

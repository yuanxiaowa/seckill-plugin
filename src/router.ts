import VueRouter from "vue-router";
import Vue from "vue";

Vue.use(VueRouter);
const routeRequire = require.context("./views");
console.log(routeRequire.keys());
const routes = [
  ...new Set(routeRequire.keys().map((key) => key.replace(/\.vue$/, ""))),
].map((key) => ({
  name: key.substring(2),
  path: key.substring(1),
  component: routeRequire(key).default,
}));

export default new VueRouter({
  mode: "hash",
  routes: [...routes],
});

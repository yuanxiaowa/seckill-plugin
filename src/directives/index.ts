import Vue from "vue";

Vue.directive("storage", {
  bind(ele, { value }) {
    var str = localStorage.getItem(value.name);
    if (str) {
      value.setValue(value.name, str);
    }
  },
  componentUpdated(ele, { value }) {
    if (!/\d/.test(value.value)) {
      return;
    }
    localStorage.setItem(value.name, value.value);
  },
});

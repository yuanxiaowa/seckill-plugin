import Vue from "vue";
import { MessageBox } from "element-ui";
import QRCode from "qrcode";

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

Vue.prototype.$getQrcodeUrl = function(url: string) {
  return QRCode.toDataURL(url);
};

Vue.prototype.$showQrcode = function(url: string, title: string = "二维码") {
  this.$getQrcodeUrl(url).then((url) => {
    MessageBox.alert(
      this.$createElement("img", {
        domProps: {
          src: url,
        },
      }),
      title,
      {
        center: true,
        closeOnClickModal: true,
        closeOnPressEscape: true,
      }
    );
  });
};
// @ts-ignore
window.__Vue = Vue;

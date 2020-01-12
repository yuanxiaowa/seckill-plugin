import { set_config, set_accounts } from "./common/setting";

chrome.runtime.onInstalled.addListener(() => {
  var _config = localStorage.getItem("config");
  var _accounts = localStorage.getItem("accounts");
  if (_config) {
    set_config(JSON.parse(_config));
  }
  if (_accounts) {
    set_accounts(JSON.parse(_accounts));
  }
  /* chrome.storage.local.get(data => {
    Object.assign(config, data);
  }); */
});

var version = Number(/Chrome\/(\d+)/.exec(navigator.userAgent)![1]);

chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    if (details.type === "xmlhttprequest") {
      let headers = details.requestHeaders;
      if (headers) {
        headers.forEach(item => {
          if (item.name.startsWith("_")) {
            let name = item.name.substring(1);
            if (name === "user-agent" || name === "origin") {
              headers!.find(item => item.name.toLowerCase() === name)!.value =
                item.value;
            }
            item.name = name;
          }
        });
      }
      return {
        requestHeaders: details.requestHeaders
      };
    }
  },
  {
    urls: ["*://*.taobao.com/*", "*://*.tmall.com/*", "*://*.jd.com/*"]
  },
  version > 76
    ? ["blocking", "requestHeaders", "extraHeaders"]
    : ["blocking", "requestHeaders"]
);

import { set_config, set_accounts } from "./common/setting";

function init() {
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
}

chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(init);

var version = Number(/Chrome\/(\d+)/.exec(navigator.userAgent)![1]);

chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    if (details.type === "xmlhttprequest") {
      let headers = details.requestHeaders;
      if (headers) {
        headers.forEach(item => {
          if (item.name.startsWith("_")) {
            let name = item.name.substring(1);
            if (
              name === "user-agent" ||
              name === "origin" ||
              name === "cookie"
            ) {
              let _item = headers!.find(
                item => item.name.toLowerCase() === name
              );
              if (_item) {
                _item.value = item.value;
              }
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
    urls: [
      "*://*.taobao.com/*",
      "*://*.tmall.com/*",
      "*://*.jd.com/*",
      "https://activity.baidu.com/*"
    ]
  },
  version > 76
    ? ["blocking", "requestHeaders", "extraHeaders"]
    : ["blocking", "requestHeaders"]
);

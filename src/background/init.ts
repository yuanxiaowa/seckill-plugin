import { config } from "./common/setting";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(data => {
    Object.assign(config, data);
  });
});

var version = Number(/Chrome\/(\d+)/.exec(navigator.userAgent)![1]);

chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    if (details.type === "xmlhttprequest") {
      let headers = details.requestHeaders;
      if (headers) {
        headers.forEach(item => {
          if (item.name.startsWith("_")) {
            item.name = item.name.substring(1);
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

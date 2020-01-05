chrome.webRequest.onResponseStarted.addListener(
  details => {
    console.log(
      details,
      details.url.includes("mtop.alimama.vegas.center.flb.coupon.query")
    );
    if (details.url.includes("mtop.alimama.vegas.center.flb.coupon.query")) {
      setTimeout(() => {
        chrome.tabs.executeScript({
          code: 'document.querySelector(".btn-text").click()'
        });
        setTimeout(() => {
          chrome.tabs.remove(details.tabId);
        }, 300);
      }, 300);
    }
    return details;
  }
  // {
  //   // tabId: tab.id,
  //   urls: ["*://h5api.m.taobao.com/h5/*/*"]
  // }
);

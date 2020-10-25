function getScript() {
  function handler() {
    var list = document.querySelectorAll(".address-list>div");
    var b = false;
    var currentPrice = +document.querySelector(".realpay--price").textContent;
    function exchangeAddress() {
      if (b) {
        list[0].click();
      } else {
        list[1].click();
      }
      b = !b;
    }
    const btn = document.querySelector("#submitOrderPC_1 a:last-child");
    function submit() {
      btn.click();
    }

    send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(data) {
      if (this.__sufei_url.startsWith("/auction/json/async_linkage.do?")) {
        const listener = () => {
          const { data } = JSON.parse(this.responseText);
          if (+data.realPayPC_1.fields.price < currentPrice) {
            submit();
          } else {
            exchangeAddress();
          }
          this.removeEventListener("load", listener);
        };
        this.addEventListener("load", listener);
      }
      return send.call(this, data);
    };
    exchangeAddress();
  }
  var ele = document.createElement("script");
  ele.textContent = `(${handler.toString()})()`;
  document.body.appendChild(ele);
  document.body.removeChild(ele);
}

document.querySelector("button").onclick = () => {
  chrome.tabs.executeScript({
    code: `(${getScript.toString()})()`,
  });
  chrome.extension.getBackgroundPage().executeScript(() => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, ([tab]) => {
      function handler() {

      }
      chrome.webNavigation.onCompleted.addListener(details => {
        if(details.tabId === tab.id) {
          // https://buy.tmall.com/auction/order/TmallConfirmOrderError.htm?__buy_error_code=USING_PROMOTION_FAIL&__buy_error_trace_id=7019391d16035066132543483e&__buy_error_original_code=F-10005-11-10-003&__buy_error_bizorder_id=
          if (new URL(details.url).pathname.includes('/auction/order/TmallConfirmOrderError.htm')) {
            chrome.webNavigation.onCompleted.removeListener(handler)
            chrome.tabs.executeScript({
              code: 'location.back()'
            })
          }
        }
      })
    })
  })
};

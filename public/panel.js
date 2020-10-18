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

document.querySelector("button").onclick = () => {
  chrome.tabs.executeScript({
    code: `console.log(\`(${handler.toString().replace(/`/g, '\\`')})()\`)`,
  });
};

import { UA } from "@/background/common/setting";
import { excutePageAction } from "@/background/page";
import qs_lib from "querystring";
import { logFile } from ".";

export function pay(url: string, pass: string) {
  if (url.startsWith("//")) {
    url = "https:" + url;
  }
  var code = `
    console.log("enter1")
    var $eles = document.querySelectorAll(".am-button.am-button-blue")
    if ($eles.length>1) {
      $eles[1].click();
    }
    console.log("enter2")
    var pass = '${pass}';
    // document.querySelector('.J-encryptpwd').val([...pass].map(c => encrypt(c)).join(','))
    var pwd = document.querySelector('.J-pwd')
    for(let i = 0; i < pass.length; i++) {
      pwd.value += pass[i];
      pwd.dispatchEvent(new Event("input"))
    }
  `;
  console.log(url, code);
  excutePageAction(url, {
    code,
    // autoclose: false
    close_delay: 3000,
    run_delay: 2000,
  });
}

// @ts-ignore
window.pay = pay;

let lastValidateTime = 0;

export function goValidate(args) {
  const now = Date.now();
  if (now - lastValidateTime > 3000) {
    window.open(
      `https://main.m.taobao.com/order/index.html?` +
        qs_lib.stringify(
          Object.assign(
            {
              exParams: JSON.stringify({
                tradeProtocolFeatures: "5",
                userAgent: UA.wap,
              }),
            },
            args.data
          )
        )
    );
    return;
  }
  lastValidateTime = now;
}

function collectValidationData() {
  var ele1 = document.querySelector<HTMLDivElement>("#nc_1_n1z")!;
  var touched = false;
  var arr: any = [];
  var start_time = 0;
  function getData(e) {
    var data = {};
    for (let i in e) {
      data[i] = e[i];
    }
    return data;
  }
  ele1.addEventListener("mousedown", (e) => {
    start_time = Date.now();
    arr = [e];
    touched = true;
  });
  ele1.addEventListener("mouseup", (e) => {
    arr.push(e);
    touched = false;
    console.log(Date.now() - start_time);
    console.log(arr.map(getData));
  });
  ele1.addEventListener("mousemove", (e) => {
    if (touched) {
      arr.push(e);
    }
  });
}

function doValidation() {
  var ele1 = document.querySelector<HTMLDivElement>("#nc_1_n1z")!;
  var ele2 = document.querySelector<HTMLDivElement>("#nc_1__scale_text")!;

  var rect1 = ele1.getBoundingClientRect();
  var rect2 = ele2.getBoundingClientRect();

  var length = rect2.x - rect1.x - rect1.width;
  var total = 3000;

  ele1.dispatchEvent(
    new MouseEvent("mousedown", {
      clientX: rect1.x + rect1.width / 2,
      clientY: rect1.y + rect1.height / 2,
    })
  );
  var start_time = Date.now();
  function move() {
    var diff = Date.now() - start_time;
    if (diff > total) {
      document.dispatchEvent(
        new MouseEvent("mouseup", {
          clientX: rect1.x + rect1.width / 2 + (diff / total) * length,
          clientY: rect1.y + rect1.height / 2,
        })
      );
      return;
    }
    document.dispatchEvent(
      new MouseEvent("mousemove", {
        clientX: rect1.x + rect1.width / 2 + (diff / total) * length,
        clientY: rect1.y + rect1.height / 2,
        movementX: 1,
        movementY: 0,
      })
    );
    setTimeout(move, 30);
  }
  requestAnimationFrame(move);
}

import { requestData } from "./tools";
import { getTab, destroyTab } from "../page";
import { delay } from "../common/tool";
import { request } from "../common/request";
import $ from "jquery";
import { fromPairs } from "ramda";

export async function checkStatus() {
  var tab = await getTab();
  // "https://login.taobao.com/member/login.jhtml?spm=a21bo.2017.754894437.1.5af911d9Ycypny&f=top&redirectURL=https%3A%2F%2Fwww.taobao.com%2F"
  await delay(3000);
  destroyTab(tab.id!);
  // axios.get("");
}

export async function preserveStatus() {}

export async function getAddresses() {
  var { code, message, returnValue } = await requestData(
    "mtop.taobao.mbis.getdeliveraddrlist",
    {
      data: {},
      version: "1.0"
    }
  );
  if (code !== "0") {
    throw new Error(message);
  }
  return JSON.parse(returnValue);
}

export async function getMyCoupons({ page }) {
  var html = await request.get(
    `https://taoquan.taobao.com/coupon/list_my_coupon.htm?sname=&ctype=44,61,65,66,247&sortby=&order=desc&page=${page}`
  );
  var $root = $(`<div>${/<body[^>]*>([\s\S]*)<\/body>/.exec(html)![1]}</div>`);
  var $eles = $root.find("#coupon-list .tmall-coupon-box");
  var items = $eles
    .map((_, ele) => {
      var $ele = $(ele);
      if ($ele.hasClass("tmall-coupon-used")) {
        return;
      }
      var url = $ele.find(".btn").attr("href")!;
      var price_text = $ele.find(".key-detail").text();
      var price_arr = /([\.\d]+)[^\.\d]*([\.\d]+)/g.exec(price_text)!;
      var quota = Number(price_arr[1]);
      var discount = Number(price_arr[2]);
      var s_params = new URL(url);
      var title = $ele.find(".sub-title").text();
      var params = fromPairs([...s_params.searchParams.entries()]);
      return {
        title,
        url,
        quota,
        discount,
        params
      };
    })
    .get();
  // @ts-ignore
  window.$root = $root;
  return {
    page,
    items,
    more: items.length > 0
  };
}

import { requestData, getUserName } from "./tools";
import { request, isRedirectedUrl } from "../common/request";
import $ from "jquery";
import { fromPairs } from "ramda";
import { newPage } from "../page";
import { accounts } from "../common/setting";

export async function isLogin() {
  return !(await isRedirectedUrl(
    `https://i.taobao.com/my_taobao.htm?spm=a21bo.2017.754894437.3.5af911d9wQ8Njb&ad_id=&am_id=&cm_id=&pm_id=1501036000a02c5c3739`
  ));
}

export async function login() {
  var page = await newPage();
  await page.goto(
    "https://login.taobao.com/member/login.jhtml?from=taobaoindex&f=top&style=&sub=true&redirect_url=https%3A%2F%2Fi.taobao.com%2Fmy_taobao.htm%3Fspm%3Da21bo.2017.754894437.3.5af911d9wQ8Njb%26ad_id%3D%26am_id%3D%26cm_id%3D%26pm_id%3D1501036000a02c5c3739"
  );
  await page.evaluate(account => {
    document.querySelector<HTMLInputElement>("#TPL_username_1")!.value =
      account.username;
    document.querySelector<HTMLInputElement>("#TPL_password_1")!.value =
      account.username;
    document.querySelector<HTMLButtonElement>("#J_SubmitStatic")!.click();
  }, accounts.taobao);
  await page.waitForNavigation();
  page.close();
  /* window.open(
    "https://login.taobao.com/member/login.jhtml?from=taobaoindex&f=top&style=&sub=true&redirect_url=https%3A%2F%2Fi.taobao.com%2Fmy_taobao.htm%3Fspm%3Da21bo.2017.754894437.3.5af911d9wQ8Njb%26ad_id%3D%26am_id%3D%26cm_id%3D%26pm_id%3D1501036000a02c5c3739"
  ); */
}

export async function logout() {
  window.open(
    "https://login.taobao.com/member/logout.jhtml?spm=a21bo.2017.754894437.7.5af911d9e4nvqR&f=top&out=true&redirectURL=https%3A%2F%2Fwww.taobao.com%2F"
  );
}

export async function checkStatus() {
  // var tab = await getTab();
  // // "https://login.taobao.com/member/login.jhtml?spm=a21bo.2017.754894437.1.5af911d9Ycypny&f=top&redirectURL=https%3A%2F%2Fwww.taobao.com%2F"
  // await delay(3000);
  // destroyTab(tab.id!);
  // axios.get("");
  if (!(await isLogin())) {
    login();
    return false;
  }
  return getUserName();
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
      if (
        $ele.hasClass("tmall-coupon-used") ||
        $ele.hasClass("tmall-coupon-out")
      ) {
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
  return {
    page,
    items,
    more: items.length > 0
  };
}

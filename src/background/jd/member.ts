import { request, isRedirectedUrl } from "../common/request";
import { newPage } from "../page";
import { accounts } from "../common/setting";
import { delay, formatUrl } from "../common/tool";
import { getCookie } from "./tools";
import moment from "moment";
import { runJdTasks } from './task';

export async function isLoginMobile() {
  var { retcode } = await request.jsonp(
    `https://wq.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&_=${Date.now()}&sceneval=2&g_login_type=1&callback=GetJDUserInfoUnion&g_ty=ls`,
    {
      referer: "https://home.m.jd.com/myJd/newhome.action",
    }
  );
  return retcode === 0;
}

export async function loginMobile() {
  var page = await newPage();
  await page.goto(
    "https://plogin.m.jd.com/login/login?appid=300&returnurl=https%3A%2F%2Fwqlogin2.jd.com%2Fpassport%2FLoginRedirect%3Fstate%3D1100300751178%26returnurl%3D%252F%252Fhome.m.jd.com%252FmyJd%252Fnewhome.action%253Fsceneval%253D2%2526ufc%253D%2526&source=wq_passport"
  );
  if (!accounts.jingdong.password) {
    return;
  }
  await delay(2000);
  await page.evaluate(function(account) {
    var sw = document.querySelector<HTMLLinkElement>(".planBLogin")!;
    if (sw.textContent === "帐号密码登录") {
      sw.click();
    }
    var username = document.querySelector<HTMLInputElement>("#username")!;
    username.value = account.username;
    username.dispatchEvent(new Event("input"));
    var pwd = document.querySelector<HTMLInputElement>("#pwd")!;
    pwd.value = account.password;
    pwd.dispatchEvent(new Event("input"));
    document.querySelector<HTMLLinkElement>(".btn")!.click();
  }, accounts.jingdong);
  await page.waitForNavigation()
  await delay(2000)
  runJdTasks();
  /* await page.waitForResponse(
    startsWith("https://jcap.m.jd.com/cgi-bin/api/check")
  ); */
  // await page.waitForNavigation();
  // page.close();
}

export async function isLoginPc() {
  return !(await isRedirectedUrl("https://order.jd.com/center/list.action"));
}

export async function loginPc() {
  var page = await newPage();
  await page.goto("https://order.jd.com/center/list.action");
  if (!accounts.jingdong.password) {
    return;
  }
  await delay(1000);
  await page.evaluate((account) => {
    var sw = document.querySelector<HTMLLinkElement>(".login-tab-r a")!;
    if (!sw.classList.contains("active")) {
      sw.click();
    }
    document.querySelector<HTMLInputElement>("#loginname")!.value =
      account.username;
    document.querySelector<HTMLInputElement>("#nloginpwd")!.value =
      account.password;
    document.querySelector<HTMLLinkElement>("#loginsubmit")!.click();
  }, accounts.jingdong);
  /* window.open(
    "https://qq.jd.com/new/qq/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F"
  ); */
  // await page.waitForNavigation();
  // page.close();
}

var mobile_logined = false;
export function checkStatusMobile() {
  isLoginMobile().then((b) => {
    console.log("m", b);
    if (!b) {
      loginMobile();
    }
    return b;
  });
}
var pc_logined = false;
export function checkStatusPc() {
  isLoginPc().then((b) => {
    console.log("p", b);
    if (!b) {
      loginPc();
    }
  });
}

export function checkStatus() {
  checkStatusPc();
  checkStatusMobile();
}

export async function getMyCoupons({ page }) {
  var text = await request.get(
    "https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=3&wxadd=1&_=1566400385806&sceneval=2&g_login_type=1&callback=queryjdcouponcb3&g_ty=ls",
    {
      referer:
        "https://wqs.jd.com/my/coupon/index.shtml?ptag=7155.1.18&sceneval=2",
    }
  );
  var text2 = /\(([\s\S]*)\);/.exec(text)![1];
  var {
    coupon: { useable },
  } = JSON.parse(text2);
  return {
    items: useable.map((item) => ({
      ...item,
      title: item.couponTitle,
      url: formatUrl(item.linkStr),
      params: {
        couponbatch: item.batchid,
        ptag: "37070.3.11",
        coupon_shopid: item.shopId,
        couponid: item.couponid,
      },
      startTime: moment(+item.beginTime).format(
        moment.HTML5_FMT.DATETIME_LOCAL
      ),
      endTime: moment(+item.endTime).format(moment.HTML5_FMT.DATETIME_LOCAL),
      discount: +item.discount,
      quota: +item.quota,
      store: {
        name: item.shopName,
        url: formatUrl(item.linkStr),
      },
      canDelete: true,
    })),
    page,
    more: false,
  };
}

export async function deleteCoupon({ couponid }) {
  return request.form(
    "https://quan.jd.com/lock_coupon.action?r=0.23514173076717948",
    {
      couponId: couponid,
      pin: await getCookie("pin"),
    },
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      referer: "https://quan.jd.com/user_quan.action",
    }
  );
}

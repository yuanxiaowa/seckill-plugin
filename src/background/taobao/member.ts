import { requestData, getUserName } from "./tools";
import { request, isRedirectedUrl } from "../common/request";
import $ from "jquery";
import { fromPairs } from "ramda";
import { newPage } from "../page";
import { accounts } from "../common/setting";
import moment from "moment";
import { formatUrl } from "../common/tool";

export async function isLogin() {
  return !(await isRedirectedUrl(
    `https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?spm=a1z02.1.1997525045.2.HxoGVH`
  ));
}

export async function login() {
  var page = await newPage();
  await page.goto(
    "https://login.taobao.com/member/login.jhtml?from=taobaoindex&f=top&style=&sub=true&redirect_url=https%3A%2F%2Fi.taobao.com%2Fmy_taobao.htm%3Fspm%3Da21bo.2017.754894437.3.5af911d9wQ8Njb%26ad_id%3D%26am_id%3D%26cm_id%3D%26pm_id%3D1501036000a02c5c3739"
  );
  await page.evaluate((account) => {
    document.querySelector<HTMLInputElement>(
      "#TPL_username_1,#fm-login-id"
    )!.value = account.username;
    document.querySelector<HTMLInputElement>(
      "#TPL_password_1,#fm-login-password"
    )!.value = account.password;
    document
      .querySelector<HTMLButtonElement>("#J_SubmitStatic,button.fm-submit")!
      .click();
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
  var { addressList } = await requestData(
    "com.taobao.mtop.deliver.getAddressList",
    {
      data: { addrOption: "0", sortType: "0" },
      version: "2.0",
      apiHost: "tmall",
      referer:
        "https://buy.m.tmall.com/order/addressList.htm?enableStation=true&requestStationUrl=%2F%2Fstationpicker-i56.m.taobao.com%2Finland%2FshowStationInPhone.htm&_input_charset=utf8&hidetoolbar=true&bridgeMessage=true",
    }
  );
  return addressList;
}

export async function getMyCoupons({ page, type }) {
  var ctype =
    {
      0: "0",
      1: "1",
    }[type] || "44,61,65,66,247";
  var html = await request.get(
    `https://taoquan.taobao.com/coupon/list_my_coupon.htm?${page}`,
    {
      qs: {
        sname: "",
        ctype,
        sortby: "",
        order: "desc",
        page,
      },
    }
  );
  var items: any[] = [];
  var $root = $(
    `<div>${/<body[^>]*>([\s\S]*)<\/body>/.exec(html)![1]}</div>`
  ).find("#coupon-list");
  if (type == "0" || type == "1") {
    let $eles = $root.find(".coupon-box");
    let type_name = ""; // `[${type == "0" ? "店铺券" : "商品券"}]`;
    items = $eles
      .map((index, ele) => {
        var $ele = $(ele);
        var $shop = $ele.find(".shop-name");
        const storeName = $shop.text().trim();
        const storeUrl = $shop.attr("href")!;
        const valideTime_arr = $ele
          .find(".valid-date")
          .text()
          .trim()
          .split(/\s+至\s+/);
        var startTime = moment(valideTime_arr[0], "yyyy.MM.DD").format(
          "MM-DD HH:mm"
        );
        var endTime = moment(valideTime_arr[1], "yyyy.MM.DD")
          .add("day", 1)
          .format("MM-DD HH:mm");
        var url =
          type == "0" ? storeUrl : $ele.find(".specified").attr("href")!;
        var id = $ele.find(".J_Delete").attr("cid");
        return {
          id,
          title: storeName + type_name,
          url: formatUrl(url),
          startTime,
          endTime,
          type: type_name,
          quota: +$ele
            .find(".use-cond")
            .text()
            .substring(1),
          discount: +$ele.find(".amount")[0].lastChild!.textContent!.trim(),
          store: {
            name: storeName,
            url: formatUrl(storeUrl),
          },
          canDelete: true,
          params: {
            cid: id,
            ctype: type,
          },
        };
      })
      .get();
  } else {
    var $eles = $root.find(".tmall-coupon-box");
    items = $eles
      .map((_, ele) => {
        var $ele = $(ele);
        if (
          $ele.hasClass("tmall-coupon-used") ||
          $ele.hasClass("tmall-coupon-out") ||
          $ele.hasClass("tmall-coupon-deleted")
        ) {
          return;
        }
        var url = $ele.find(".btn").attr("href")!;
        var price_text = $ele.find(".key-detail").text();
        var price_arr = /([\.\d]+)[^\.\d]*([\.\d]+)/g.exec(price_text)!;
        var quota = Number(price_arr[1]);
        var discount = Number(price_arr[2]);
        var title = $ele.find(".sub-title").text();
        var s_params = new URL(url);
        var params = fromPairs([...s_params.searchParams.entries()]);
        return {
          title,
          url,
          quota,
          discount,
          params,
          canDelete: false,
          type: "天猫购物券",
        };
      })
      .get();
  }
  console.log(items);
  return {
    page,
    items,
    more: items.length > 0,
  };
}

export async function deleteCoupon({ cid, ctype }) {
  await request.get("https://taoquan.taobao.com/coupon/resultMessage.htm", {
    qs: {
      cid,
      ctype,
      action: "coupon/couponUnifyAction",
      event_submit_doDeleteBuyerCoupon: "true",
      _tb_token_: "e1b075ed3eee1",
    },
  });
}

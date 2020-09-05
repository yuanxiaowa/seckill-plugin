/*
 * @Author: oudingyin
 * @Date: 2019-07-12 17:17:39
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 17:12:55
 */
import { Notification } from "element-ui";
import { super_user } from "./config";
export * from "./api_common";

var taobao: any = {};
if (process.env.NODE_ENV === "production") {
  // @ts-ignore
  taobao = chrome.extension.getBackgroundPage()!.taobao;
} else {
  taobao = new Proxy(taobao, {
    get(target, name) {
      return (...args) => {
        var id = Math.random().toString();
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            "gbifmajjnoldpbblbhdkigdfkajbekjg",
            {
              id,
              name,
              args,
            },
            ({ success, err, data }) => {
              if (success) {
                resolve(data);
              } else {
                reject(err);
              }
            }
          );
        });
      };
    },
  });
}

function handleError(e: Error) {
  Notification.error(e.message);
  throw e;
}

export function invoke(name: string, args?: any) {
  return taobao[name](args).catch(handleError);
}

export function getUserName(platform: string) {
  return invoke("getUserName", { platform });
}

export function logout(platform: string) {
  return invoke("logout", { platform });
}

export function cartList(data): Promise<any> {
  return invoke("cartList", data);
}
export function cartBuy(data): Promise<any> {
  return invoke("cartBuy", data);
}
export function cartToggle(data: any): Promise<any> {
  return invoke("cartToggle", data);
}
export function cartToggleAll(data: any): Promise<any> {
  return invoke("cartToggleAll", data);
}
export function cartAdd(data: any, platform: string): Promise<any> {
  return invoke("cartAdd", { ...data, platform });
}
export function cartDel(data: any, platform: string): Promise<any> {
  return invoke("cartDel", {
    ...data,
    platform,
  });
}
export function cartUpdateQuantity(data: any, platform: string): Promise<any> {
  return invoke("cartUpdateQuantity", { ...data, platform });
}
export function cartUpdateSku(data: any, platform: string): Promise<any> {
  return invoke("cartUpdateSku", { ...data, platform });
}
export function buyDirect(
  data: any,
  t: string,
  platform: string
): Promise<any> {
  return invoke("buy", { ...data, t, platform });
}
export function coudan(data: any, platform: string): Promise<any> {
  return invoke("coudan", { ...data, platform });
}
export function qiangquan(
  data: any,
  t: string,
  platform: string
): Promise<any> {
  return invoke("qiangquan", {
    ...data,
    t,
    platform,
  });
}

export function getAddresses(platform: string) {
  return invoke("getAddresses", { platform });
}
export function commentList(data: any, platform: string): Promise<any> {
  return invoke("getCommentList", { data, platform });
}
export function comment(data: any, platform: string): Promise<any> {
  return invoke("comment", { data, platform });
}
export function resolveUrl(data: any, platform: string): Promise<any> {
  return invoke("resolveUrl", { data: data.data, platform });
}
export function getRedirectedUrl(url: string): Promise<string> {
  return invoke("getRedirectedUrl", { url });
}

export function getQrcode(url: string) {
  return invoke("getQrcode", { url });
}
export async function getSixtyCourseList(): Promise<any> {}

export async function replyixtyCourse(params: any): Promise<any> {}

export function checkStatus(platform: string, qq = super_user) {
  return invoke("checkStatus", { qq, platform });
}

export function sysTime(platform: string) {
  return invoke("sysTime", { platform });
}

export function goodsList(args: any) {
  return invoke("goodsList", args);
}

export function goodsInfo(params: any) {
  return invoke("goodsInfo", {
    ...params,
  });
}

export function getGoodsSkus(params: any, platform: string) {
  return invoke("getGoodsSkus", {
    ...params,
    platform,
  });
}

export function getGoodsPromotions(params) {
  return invoke("getGoodsPromotions", {
    ...params,
  });
}

export function applyCoupon(params) {
  return invoke("applyCoupon", {
    ...params,
  });
}

export function getConfig() {
  return invoke("getConfig");
}

export function setConfig(data: any) {
  return invoke("setConfig", data);
}

export function getAccounts() {
  return invoke("getAccounts");
}

export function setAccounts(data: any) {
  return invoke("setAccounts", data);
}

export function getTasks() {
  return invoke("getTasks");
}

export function cancelTask(id: string) {
  return invoke("cancelTask", { id });
}

export function getCollection(params: any) {
  return invoke("getCollection", params);
}

export function delCollection(data: any, platform: string) {
  return invoke("delCollection", {
    ...data,
    platform,
  });
}

export function getSeckillList(params) {
  return invoke("getSeckillList", params);
}

export function getMyCoupons(params) {
  return invoke("getMyCoupons", params);
}

export function deleteCoupon(params) {
  return invoke("deleteCoupon", params);
}

export function getPlusQuanpinList() {
  return invoke("getPlusQuanpinList");
}

export function getPlusQuanpin(data) {
  return invoke("getPlusQuanpin", data);
}

export function testOrder(params: any) {
  return invoke("testOrder", params);
}

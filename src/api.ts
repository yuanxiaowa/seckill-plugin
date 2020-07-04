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
} else if (window.parent !== window) {
  const mp: Record<string, Function> = {};
  window.addEventListener("message", (e) => {
    if (!e.data || !e.data.id) {
      return;
    }
    var { id, data } = e.data;
    mp[id](data);
    delete mp[id];
  });
  taobao = new Proxy(taobao, {
    get(target, name) {
      return (...args) => {
        var id = Math.random().toString();
        window.parent.postMessage(
          JSON.stringify({
            id,
            name,
            args,
          }),
          "chrome-extension://gbifmajjnoldpbblbhdkigdfkajbekjg"
        );
        return new Promise((resolve) => {
          mp[id] = resolve;
        });
      };
    },
  });
}

function handleError(e: Error) {
  console.error(e);
  Notification.error(e.message);
}

export function invoke(name: string, args?: any) {
  return taobao[name](args).catch(handleError);
}

export function getUserName(platform: string) {
  return taobao.getUserName(platform).catch(handleError);
}

export function logout(platform: string) {
  return taobao.logout(platform).catch(handleError);
}

export function cartList(platform: string, from_pc = false): Promise<any> {
  return taobao.cartList(platform).catch(handleError);
}
export function cartBuy(data: any, t: string, platform: string): Promise<any> {
  return taobao.cartBuy(data, t, platform).catch(handleError);
}
export function cartToggle(data: any, platform: string): Promise<any> {
  return taobao.cartToggle(data, platform).catch(handleError);
}
export function cartToggleAll(data: any, platform: string): Promise<any> {
  return taobao.cartToggleAll(data, platform).catch(handleError);
}
export function cartAdd(data: any, platform: string): Promise<any> {
  return taobao.cartAdd(data, platform).catch(handleError);
}
export function cartDel(data: any, platform: string): Promise<any> {
  return taobao.cartDel(data, platform).catch(handleError);
}
export function cartUpdateQuantity(data: any, platform: string): Promise<any> {
  return taobao.cartUpdateQuantity(data, platform).catch(handleError);
}
export function buyDirect(
  data: any,
  t: string,
  platform: string
): Promise<any> {
  return taobao.buy(data, t, platform).catch(handleError);
}
export function coudan(data: any, platform: string): Promise<any> {
  return taobao.coudan(data, platform).catch(handleError);
}
export function qiangquan(
  data: any,
  t: string,
  platform: string
): Promise<any> {
  return taobao
    .qiangquan(
      Object.assign(
        {
          t,
          platform,
        },
        data
      )
    )
    .catch(handleError);
}

export function getAddresses(platform: string) {
  return taobao.getAddresses(platform).catch(handleError);
}
export function commentList(data: any, platform: string): Promise<any> {
  return taobao.getCommentList(data, platform).catch(handleError);
}
export function comment(data: any, platform: string): Promise<any> {
  return taobao.comment(data, platform).catch(handleError);
}
export function resolveUrl(data: any, platform: string): Promise<any> {
  return taobao.resolveUrl(data.data, platform).catch(handleError);
}
export function getRedirectedUrl(url: string): Promise<string> {
  return taobao.getRedirectedUrl(url).catch(handleError);
}

export function getQrcode(url: string) {
  return taobao.getQrcode(url).catch(handleError);
}
export async function getSixtyCourseList(): Promise<any> {}

export async function replyixtyCourse(params: any): Promise<any> {}

export function checkStatus(platform: string, qq = super_user) {
  return taobao.checkStatus(qq, platform).catch(handleError);
}

export function sysTime(platform: string) {
  return taobao.sysTime(platform).catch(handleError);
}

export function goodsList(args: any) {
  var platform = args.platform;
  delete args.platform;
  return taobao.goodsList(args, platform).catch(handleError);
}

export function goodsDetail(params: any, platform: string) {
  return taobao.goodsDetail(params, platform).catch(handleError);
}

export function getConfig() {
  return taobao.getConfig().catch(handleError);
}

export function setConfig(data: any) {
  return taobao.setConfig(data).catch(handleError);
}

export function getAccounts() {
  return taobao.getAccounts().catch(handleError);
}

export function setAccounts(data: any) {
  return taobao.setAccounts(data).catch(handleError);
}

export function getTasks() {
  return taobao.getTasks().catch(handleError);
}

export function cancelTask(id: string) {
  return taobao.cancelTask(id).catch(handleError);
}

export function getCollection(params: any) {
  return taobao.getCollection(params).catch(handleError);
}

export function delCollection(data: any, platform: string) {
  return taobao.delCollection(data).catch(handleError);
}

export function getSeckillList(params) {
  return taobao.getSeckillList(params, params.platform).catch(handleError);
}

export function getMyCoupons(params) {
  return taobao.getMyCoupons(params, params.platform).catch(handleError);
}

export function deleteCoupon(params) {
  return taobao.deleteCoupon(params, params.platform).catch(handleError);
}

export function getPlusQuanpinList() {
  return taobao.getPlusQuanpinList().catch(handleError);
}

export function getPlusQuanpin(data) {
  return taobao.getPlusQuanpin(data).catch(handleError);
}

export function testOrder(params: any) {
  return taobao.testOrder(params).catch(handleError);
}

interface Handler {
  resolveUrls(text: string): Promise<string[]>;
  qiangquan(url: string): Promise<any>;
  qiangdan(url: string, num: number, t: string): Promise<any>;
  coudan(url: string[]): Promise<any>;
  getCartInfo(): Promise<any>;
  cartBuy(time: string, data?: any): Promise<any>;
  directBuy(time: string, url: string): Promise<any>;
  toggleCart(data: any, checked: boolean, type: 0 | 1 | 2): Promise<any>;
  delCartItem(item: any): Promise<any>;
  addToCart(item: any): Promise<any>;
  getCoupons(): Promise<any[]>;
  delCoupon(item: any): Promise<any>;
  getCommentsInfo(): Promise<any[]>;
  comment(item: any): Promise<any>;
}

export type Platform = "taobao" | "jingdong";

// @ts-ignore
const handlers: Record<Platform, Handler> = {};

const keys: (keyof Handler)[] = [
  "resolveUrls",
  "qiangdan",
  "qiangquan",
  "getCartInfo",
  "cartBuy",
  "directBuy",
  "coudan",
  "toggleCart",
  "delCartItem",
  "addToCart",
  "getCoupons",
  "delCoupon",
  "getCommentsInfo",
  "comment"
];

(<Platform[]>["taobao", "jingdong"]).forEach(name => {
  handlers[name] = <Handler>keys.reduce((state, key) => {
    // @ts-ignore
    state[key] = window[name + key.replace(/^\w/, _ => _.toUpperCase())];
    return state;
  }, {});
});

console.log(handlers);

export default handlers;

import {
  getCartListFromMobile,
  addCartFromMobile,
  updateCartFromMobile,
} from "./mobile";
import { getCartListFromPc } from "./pc";

export interface CartItemBase {
  id: string;
  title: string;
  valid: boolean;
  quantity: number;
  skuId: string;
  price: number;
  img: string;
  url: string;
}

export interface CartVendorInfoBase<T extends CartItemBase = CartItemBase> {
  id: string;
  title: string;
  valid: boolean;
  url: string;
  items: T[];
}

export interface VendorInfo extends CartVendorInfoBase {
  sellerId: string;
  shopId: string;
}

export interface CartItem extends CartItemBase {
  settlement: string;
  sellerId: string;
  cartId: string;
  shopId: string;
  itemId: string;
}

export async function getCartList({ from_pc }: { from_pc?: boolean }) {
  let items: any[];
  if (from_pc) {
    items = await getCartListFromPc();
  } else {
    items = await getCartListFromMobile();
  }
  return {
    items,
  };
}

export interface ParamsOfAddCart {
  url: string;
  quantity: number;
  skuId?: string;
  from_pc?: boolean;
  jianlou?: number;
}

export function addCart(args: ParamsOfAddCart) {
  return addCartFromMobile(args);
}

export function updateCart(
  args: {
    items: any[];
    from_pc: boolean;
  },
  action: string
) {
  return updateCartFromMobile(args, action);
}

export async function cartToggle() {
  // const page = await newPage();
  // await page.goto("https://cart.taobao.com/cart.htm");
  // // await page.waitForSelector("#J_Go");
  // // @ts-ignore
  // let firstData = await page.evaluate(() => window.firstData);
  // var cartIds: string[] = [];
  // var sellerids: string[] = [];
  // var items: {
  //   cartId: string;
  //   itemId: string;
  //   skuId: string;
  //   quantity: number;
  //   createTime: number;
  //   attr: string;
  // }[] = [];
  // firstData.list.forEach((shop: any) => {
  //   shop.bundles[0].items.forEach((item: any) => {
  //     cartIds.push(item.cartId);
  //     sellerids.push(item.sellerid);
  //     items.push({
  //       cartId: item.cartId,
  //       itemId: item.itemId,
  //       skuId: item.skuId,
  //       quantity: item.amount.now,
  //       createTime: item.createTime,
  //       attr: item.attr
  //     });
  //   });
  // });
  // var data = {
  //   hex: "n",
  //   cartId: cartIds.reverse().join(","),
  //   sellerid: sellerids.join(","),
  //   cart_param: JSON.stringify({
  //     items: items.reverse()
  //   }),
  //   unbalance: "",
  //   delCartIds: cartIds.join(","),
  //   use_cod: false,
  //   buyer_from: "cart",
  //   page_from: "cart",
  //   source_time: Date.now()
  // };
  // await page.evaluate((data: any) => {
  //   var form = document.createElement("form");
  //   form.method = "post";
  //   form.action =
  //     "https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined";
  //   Object.keys(data).map(key => {
  //     var input = document.createElement("input");
  //     input.type = "hidden";
  //     input.value = data[key];
  //     form.appendChild(input);
  //   });
  //   document.body.appendChild(form);
  //   form.submit();
  // }, data);
  // await page.waitForNavigation();
  // if (!isSubmitOrder) {
  //   await page.setOfflineMode(true);
  // }
  // await page.click(".go-btn");
}

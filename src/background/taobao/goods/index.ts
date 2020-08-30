import { request } from "../../common/request";
import {
  getGoodsDetailFromMobile,
  getGoodsInfoFromMobile,
  getGoodsPromotionsFromMobile,
  applyCouponFromMobile,
} from "./mobile";

export const getItemId = (url: string) => {
  if (/\/i(\d+)\.htm?/.test(url)) {
    return RegExp.$1;
  }
  return /id=(\d+)/.exec(url)![1];
};
export function getGoodsUrl(id) {
  return `https://detail.tmall.com/item.htm?id=${id}`;
}

export async function getGoodsSkus({ url }: { url: string }) {
  let itemId = getItemId(url);
  let { item, prop, skuMap } = await request.get(
    `https://tbskip.taobao.com/json/item_sku.do?item_num_id=${itemId}&_ksTS=1593914768673_421`
  );
  let minPrice = item.price / 100;
  let maxPrice = minPrice;
  let skus = [];
  if (prop) {
    const cates = Object.keys(prop).map((key) => ({
      key,
      item: prop[key],
    }));
    const propSerials = Object.keys(skuMap)[0]
      .split(";")
      .slice(1, -1)
      .map((key) => cates.find(({ item }) => item[key]));
    function handle(i, keys) {
      let prop = propSerials[i]!;
      if (i === propSerials.length - 1) {
        return Object.keys(prop.item)
          .map((value) => {
            const key = [...keys, value, ""].join(";");
            const item = skuMap[key];
            if (!item) {
              return;
            }
            let price = item.price / 100;
            maxPrice = Math.max(price, maxPrice);
            return {
              name: prop.key,
              label: prop.item[value][0],
              value,
              children: [
                {
                  label: `￥${price}，${item.stock}`,
                  value: item.skuId,
                },
              ],
            };
          })
          .filter(Boolean);
      }
      return Object.keys(prop.item).map((value) => ({
        name: prop.key,
        label: prop.item[value][0],
        value,
        children: handle(i + 1, [...keys, value]),
      }));
    }
    skus = handle(0, [""]);
  }
  return {
    skus: {
      children: skus,
    },
    price: [...new Set([minPrice, maxPrice])].join("-"),
    quantity: +item.stock,
  };
}

export async function getGoodsDetail(url: string) {
  return getGoodsDetailFromMobile(url);
}

export async function getGoodsInfo(url: string, skuId?: string) {
  return getGoodsInfoFromMobile(url, skuId);
}

export function getGoodsPromotions(item: any) {
  return getGoodsPromotionsFromMobile(item);
}

export function applyCoupon(params: any) {
  return applyCouponFromMobile(params);
}

import { getItemId } from ".";
import { requestData } from "../tools";
import { flatten } from "ramda";
import { formatUrl } from "@/background/common/tool";
import moment from "moment";

export async function getGoodsDetailFromMobile(url: string) {
  var itemId = getItemId(url);
  /* 
    ttid: "2017@taobao_h5_6.6.0",
    AntiCreep: "true",
   */
  var { apiStack, item, skuBase: p_skuBase } = await requestData(
    "mtop.taobao.detail.getdetail",
    {
      data: { itemNumId: itemId },
      version: "6.0",
    }
  );
  let { skuBase, skuCore } = JSON.parse(apiStack[0].value);
  let sku_ret;
  let quantity = 0;
  let price: string = "0";
  if (!skuBase) {
    skuBase = p_skuBase;
  }
  if (skuBase) {
    let { props, skus } = skuBase;
    let sortOrders = props
      .map(({ values }, index) => ({
        sortOrder: +values[0].sortOrder,
        index,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ index }) => index);
    function f(i, vids: string[]) {
      var parent = {
        pid: props[i].pid,
        name: props[i].name,
        children: props[i].values
          .map((item) => {
            var data: any = {
              value: item.vid,
              label: item.name,
            };
            vids[i] = props[i].pid + ":" + item.vid;
            if (i < props.length - 1) {
              Object.assign(data, f(i + 1, vids));
            } else {
              let vid_str = sortOrders.map((i) => vids[i]).join(";");
              let sku = skus.find((item) => item.propPath === vid_str);
              if (!sku) {
                return;
              }
              let { skuId } = sku;
              let { quantity, price } = skuCore.sku2info[skuId];
              // if (+quantity === 0) {
              //   return;
              // }
              data.children = [
                {
                  label: `￥${price.priceText}, ${quantity}`,
                  value: skuId,
                },
              ];
            }
            return data;
          })
          .filter(Boolean),
      };
      return parent;
    }
    sku_ret = f(0, []);
  }
  if (skuCore && skuCore.sku2info) {
    if (skuCore.sku2info[0]) {
      quantity = +skuCore.sku2info[0].quantity;
      price = skuCore.sku2info[0].price.priceText;
    }
  }
  return { skus: sku_ret, item, title: item.title, quantity, price };
}

export async function getGoodsInfoFromMobile(url: string, skuId?: string) {
  var itemId = getItemId(url);
  var data = await requestData("mtop.taobao.detail.getdetail", {
    data: { itemNumId: itemId },
    version: "6.0",
  });
  return transformMobileGoodsInfo(data, skuId);
}

export async function getGoodsPromotionsFromMobile(item: any) {
  var { coupons } = await requestData("mtop.tmall.detail.couponpage", {
    data: { itemId: Number(item.itemId), source: "tmallH5" },
    version: "1.0",
  });
  return flatten(
    coupons.map(({ arg1, couponList, title, type }) => {
      if (arg1 === "CategoryCoupon") {
        return couponList.map((coupon) => {
          const { activityUrl, subtitles, hasReceived, enabled, uuid } = coupon;
          const discount = Number(coupon.title);
          let quota = 300;
          if (/满(\d+)/.test(subtitles[0])) {
            quota = Number(RegExp.$1);
          }
          const time_arr = subtitles[1].split("至");
          return {
            url: formatUrl(activityUrl),
            title: `[${title}] ${quota}-${discount}`,
            quota,
            discount,
            startTime: moment(time_arr[0], "yyyy.MM.DD HH:mm"),
            endTime: moment(time_arr[1], "yyyy.MM.DD HH:mm"),
            hasReceived,
            enabled,
            params: {
              asac: coupon.asac,
              couponType: String(type),
              lotteryId: "",
              sellerId: item.sellerId,
              source: "tmallH5",
              trackBtnParams: JSON.stringify(coupon.trackBtnParams),
              ua:
                "134#8KXImJXwXGfcz/y2W6M9UX0D3QROwKO9sE/w4/PLri5WnZfY6PX1kXXy4DwzM3MrCj6pjoeQRKVEk/jTR8fl/FLghJowqqX3IkuU+4qqXTqqZjXxzsefqTg7oXoXqRyKTybJbsfAqcqqZJL0+001HBzKkGJtqHpqqyFU+gd8rqqAZrww+Tv66CIonTi+4a4DNBPwrnlCkbcPCMtC/0QuekvgJZOYDkASkfAWgTr1HCLGmhSZNpjWY0MMhrgIWvPucBG+T5lSiqaW/z3Wjua5zBIi2eLHV6Xy7twm2Pvoy8rAhWpI2s7WiKj064N+1PUe3LgeL/uXhni8Sow7w0MFDTp5sG3wr8PyMfZwJJX3yR1Fl4izL3fKcOEK4s1mTxKb37ltjTo+lJW2Q2+tdq4TNLoiLOiLsKUGkZnxyefupZl4uzj1mYKrXozrFrB188T46iK6dDOrxDlTI5MGfuGrewhSIo3MqA+uBaOpJAQf3NTpJfL0EV3fgGJhQ++3jam9+9mbHXGGS+OgXTsnCF7KoQNJT9v0aksIJiQqF92ZlEcFS5rIxpl3q9fvONmy9BBlvrite2+6Rvfw9IYOr618nslh3EwSyha9mqhDnnvt/71Qp194bJIyn+EVUqhwqY0K/Pjdh8yJ3UXWeRjwVGUg+C4D149CSDqkx7kcTplI8EcJxo7aEOUJAZdMVU5nrMiHx23peLg4zVMUs/jwAm3N4eNfKHiMzaTv0dSjt77KLI5KPGzcgbaUhVKgU9Sf0LgENJ1iT0riCiQZ/RhyCtQjAm8ackpwBDr6XEpNLW+PFypjAtOJOzxmfxeuhU/MZhA9v0kJKZMUz3xbADaCOauRh3h+hN/i0XQVtoS7KmftwTZHuUG0CbsYJ4GM2mHif9/7Cp/xvAcxjgkFbVgpO19KKJ7lna7TBn00jS2rt+6JGv2W",
              uuid,
            },
          };
        });
      }
      if (arg1 === "ShopCoupon") {
        return couponList.map((coupon) => {
          const { activityUrl, subtitles, hasReceived, enabled, uuid } = coupon;
          const discount = Number(coupon.title);
          let quota = 300;
          if (/满(\d+)/.test(subtitles[0])) {
            quota = Number(RegExp.$1);
          }
          const time_arr = subtitles[1].split("至");
          return {
            url: formatUrl(activityUrl),
            title: `[${title}] ${quota}-${discount}`,
            quota,
            discount,
            startTime: moment(time_arr[0], "yyyy.MM.DD HH:mm"),
            endTime: moment(time_arr[1], "yyyy.MM.DD HH:mm"),
            hasReceived,
            enabled,
            params: {
              asac: "",
              couponType: String(type),
              lotteryId: "",
              sellerId: item.sellerId,
              source: "tmallH5",
              ua:
                "134#8KXImJXwXGfcz/y2W6M9UX0D3QROwKO9sE/w4/PLri5WnZfY6PX1kXXy4DwzM3MrCj6pjoeQRKVEk/jTR8fl/FLghJowqqX3IkuU+4qqXTqqZjXxzsefqTg7oXoXqRyKTybJbsfAqcqqZJL0+001HBzKkGJtqHpqqyFU+gd8rqqAZrww+Tv66CIonTi+4a4DNBPwrnlCkbcPCMtC/0QuekvgJZOYDkASkfAWgTr1HCLGmhSZNpjWY0MMhrgIWvPucBG+T5lSiqaW/z3Wjua5zBIi2eLHV6Xy7twm2Pvoy8rAhWpI2s7WiKj064N+1PUe3LgeL/uXhni8Sow7w0MFDTp5sG3wr8PyMfZwJJX3yR1Fl4izL3fKcOEK4s1mTxKb37ltjTo+lJW2Q2+tdq4TNLoiLOiLsKUGkZnxyefupZl4uzj1mYKrXozrFrB188T46iK6dDOrxDlTI5MGfuGrewhSIo3MqA+uBaOpJAQf3NTpJfL0EV3fgGJhQ++3jam9+9mbHXGGS+OgXTsnCF7KoQNJT9v0aksIJiQqF92ZlEcFS5rIxpl3q9fvONmy9BBlvrite2+6Rvfw9IYOr618nslh3EwSyha9mqhDnnvt/71Qp194bJIyn+EVUqhwqY0K/Pjdh8yJ3UXWeRjwVGUg+C4D149CSDqkx7kcTplI8EcJxo7aEOUJAZdMVU5nrMiHx23peLg4zVMUs/jwAm3N4eNfKHiMzaTv0dSjt77KLI5KPGzcgbaUhVKgU9Sf0LgENJ1iT0riCiQZ/RhyCtQjAm8ackpwBDr6XEpNLW+PFypjAtOJOzxmfxeuhU/MZhA9v0kJKZMUz3xbADaCOauRh3h+hN/i0XQVtoS7KmftwTZHuUG0CbsYJ4GM2mHif9/7Cp/xvAcxjgkFbVgpO19KKJ7lna7TBn00jS2rt+6JGv2W",
              uuid,
            },
          };
        });
      }
    })
  );
}

function transformMobileGoodsInfo({ apiStack, item }, skuId?: string) {
  let { delivery, trade, skuBase, skuCore, price } = JSON.parse(
    apiStack[0].value
  );
  let buyEnable = trade.buyEnable === "true";
  let cartEnable = trade.cartEnable === "true";
  let msg: string | undefined;
  let cuxiao: any;
  let quantity = 0;
  if (!buyEnable) {
    if (trade.hintBanner) {
      msg = trade.hintBanner.text;
    } else {
      msg = trade.reason;
    }
  }
  if (!skuId) {
    skuId = "0";
  }
  /* if (skuBase && skuBase.props) {
    if (skus) {
      let propPath = skuBase.props
        .map(
          ({ pid, values }, i) =>
            `${pid}:${
              values[((skus[i] || 0) + values.length) % values.length].vid
            }`
        )
        .join(";");
      let skuItem = skuBase.skus.find(item => item.propPath === propPath);
      if (!skuItem) {
        throwError("指定商品型号不存在");
      } else {
        skuId = skuItem.skuId;
      }
    }
  } */
  if (skuCore) {
    if (skuId === "0") {
      let min = Infinity;
      for (let key of Object.keys(skuCore.sku2info)) {
        if (key === "0") {
          continue;
        }
        let { price, quantity } = skuCore.sku2info[key];
        if (price.priceText.includes("-") || !(Number(quantity) > 0)) {
          continue;
        }
        let p = Number(price.priceText);
        if (p < min) {
          min = p;
          skuId = key;
        }
      }
    }
    let item = skuCore.sku2info[skuId];
    if (item) {
      quantity = Number(item.quantity);
      price = item;
    }
  }
  if (price.shopProm) {
    cuxiao = price.shopProm.map(
      (p: { type: number; content: string[]; title: string }) => {
        var quota = 0;
        var discount = 1;
        var amount = 1;
        if (p.type === 3) {
          // 满多少件打折
          let arr = /满(\d+)件,打(\d+)折/.exec(p.content[0])!;
          amount = +arr[1];
          discount = +arr[2] / 10;
        } else if (p.type === 5) {
          // 送积分
          discount = Number(/(\d+)/.exec(p.content[0]![1]));
        }
        return {
          type: p.type,
          title: p.title,
          quota,
          discount,
          amount,
        };
      }
    );
  }
  return {
    itemId: item.itemId,
    title: item.title,
    quantity,
    buyEnable,
    cartEnable,
    msg,
    skuId,
    delivery,
    price: +price.price.priceText,
    cuxiao,
  };
}

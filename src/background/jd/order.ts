import qs_lib from "querystring";
import { getStock, getGoodsInfo, getSkuId } from "./goods";
import { ArgBuyDirect, ArgOrder } from "../taobao/structs";
import { config, accounts } from "../common/setting";
import { delay } from "../common/tool";
import moment from "moment";
import { taskManager } from "../common/task-manager";
import { sendQQMsg } from "../common/message";
import { request } from "../common/request";
import { getCookie } from "./tools";
import { excuteRequestAction, newPage } from "../page";

const user: any = {};

export async function waitForStock(
  args: Parameters<typeof getStock>[0],
  duration: number
): Promise<any> {
  var data = await getStock(args, {});
  return {
    success: JSON.stringify(data).includes("无货"),
    data
  };
}

export async function buyDirect(
  args: ArgBuyDirect,
  p?: Promise<void>
): Promise<any> {
  var skuId = getSkuId(args.url);
  var data = await getGoodsInfo(skuId);
  if (args.diejia) {
    if (args.quantity === 1) {
      let num = (args.diejia / data.price.p) >> 0;
      if (args.diejia - num * data.price.p > 1) {
        num++;
      }
      args.quantity = num;
    }
  }
  var next = async () => {
    let res = await getNextDataByGoodsInfo({ skuId }, args.quantity, data.miao);
    return submitOrder(
      Object.assign(
        {
          title: data.item.skuName,
          data: res
        },
        args
      ),
      p
    );
  };
  if (args.jianlou && data.stock.StockState === 34) {
    waitForStock(
      [
        {
          skuId,
          num: String(args.quantity)
        }
      ],
      args.jianlou
    ).then(() => {
      console.log("有库存了，去下单");
      next();
    });
    return;
  }
  return next();
}
export function cartBuy(data: any, p?: Promise<void>) {
  return submitOrder(
    Object.assign(
      {
        data: {
          submit_url: "https://trade.jd.com/shopping/order/getOrderInfo.action"
          // submit_url: "https://p.m.jd.com/norder/order.action"
        },
        other: {},
        is_pc: true
      },
      data
    ),
    p
  );
}
export async function getOrderPage() {
  /* var page = await newPage({
    width: 400,
    height: 573
  });
  page.setRequestInterception(true);
  page.on("request", request => {
    var type = request.resourceType();
    if (type === "image" || type === "stylesheet") {
      request.respond({
        body: ""
      });
    } else {
      request.continue();
    }
  });
  return page; */
}

export async function submitOrder(
  args: ArgOrder<{
    submit_url: string;
  }>,
  p?: Promise<void>
): Promise<any> {
  if (args.is_pc) {
    return submitOrderPc(args, p);
  }
  var page = await newPage();
  var startTime = Date.now();
  try {
    if (p) {
      await p;
    }
    page.goto(args.data.submit_url);
    await page.waitForResponse(url => url.includes("userasset"));
    await delay(300);
    page.evaluate(
      function f(pass, expectedPrice) {
        if (typeof expectedPrice === "number") {
          let price = Number(
            document.querySelector(".price strong")!.textContent!.substring(1)
          );
          if (price > expectedPrice + 0.1) {
            throw new Error("价格太高了");
          }
        }
        // var script_content = document.querySelector(".wx_wrap")!
        //   .previousElementSibling!.textContent!;
        // var text = /(window\.dealData\s=[\s\S]*)/.exec(script_content)![1];
        // eval(text);
        // // @ts-ignore
        // var dealData = window.dealData;
        // var order = dealData.order;
        // var vendorCart = order.venderCart;
        // var address = order.address;

        // var products = (vendorCart[0].mfsuits || vendorCart[0].mzsuits)[0]
        //   .products;
        var btn = Array.from(
          document.querySelectorAll<HTMLDivElement>(".mod_btns")
        )
          .filter(ele => ele.style.display !== "none")
          .reverse()[0]
          .querySelector<HTMLLinkElement>("a")!;
        // var data = {
        //   skuNumList: products.map(({ mainSku }) => ({
        //     skuId: mainSku.skuId,
        //     num: mainSku.num
        //   })),
        //   areaRequest: {
        //     provinceId: address.provId,
        //     cityId: address.cityId,
        //     countyId: address.countyId,
        //     townId: address.townId
        //   },
        //   coordnateRequest: {
        //     longtitude: address.longitude,
        //     latitude: address.latitude
        //   }
        // };
        // function check() {
        //   return fetch(`https://trade.jd.com/api/v1/batch/stock`, {
        //     method: "post",
        //     body: JSON.stringify(data),
        //     headers: {
        //       Accept: "application/json",
        //       "Content-Type": "application/json"
        //     }
        //   })
        //     .then(res => res.json())
        //     .then(
        //       ({ result }) =>
        //         !Object.keys(result).find(key =>
        //           result[key].status.includes("无货")
        //         )
        //     );
        // }
        // function handler() {
        //   check().then(b => {
        //     if (!b) {
        //       return handler();
        //     }
        //     submit();
        //   });
        // }
        function submit() {
          // console.log(new Date(), "去下单");
          btn.click();
          setTimeout(submit, 500);
        }
        setInterval(() => {
          // handler();
          var ele = document.querySelector<HTMLDivElement>(".ui-dialog");
          if (ele) {
            ele.parentNode!.removeChild(ele);
          }
        }, 5000);
        setTimeout(() => {
          var ele = document.querySelector<HTMLInputElement>("#shortid")!;
          ele.value = pass;
          ele.dispatchEvent(new Event("focus"));
          ele.dispatchEvent(new Event("input"));
          ele.dispatchEvent(new Event("blur"));
          submit();
        }, 500);
      },
      accounts.jingdong.paypass,
      args.expectedPrice
    );
    // let text_userasset = await page
    //   .waitForResponse(res => res.url().includes("userasset"))
    //   .then(res => res.text());
    // if (typeof args.expectedPrice === "number") {
    //   let {
    //     order: {
    //       orderprice: { totalPrice }
    //     }
    //   } = JSON.parse(/\((.*)\)\}catch/.exec(text_userasset)![1]);
    //   totalPrice = totalPrice / 100;
    //   if (args.expectedPrice < totalPrice) {
    //     throw new Error(
    //       `太贵了，期望价格:${args.expectedPrice}, 实际价格：${totalPrice}`
    //     );
    //   }
    // }
    // if (!config.isSubmitOrder) {
    //   await page.setOfflineMode(true);
    // }
    // // await delay(5000);
    // /* await page.evaluate(pass => {
    //   document.querySelector<HTMLInputElement>(
    //     "#shortPassInput,#shortid"
    //   )!.value = pass;
    // }, user.paypass); */
    // // await page.waitForSelector("#shotDot");
    // // await page.click("#shotDot");
    // await page.evaluate(() => {
    //   document.querySelector<HTMLInputElement>("#shotDot")!.click();
    // });
    // await delay(100);
    // await page.type("#shotDot", user.paypass);
    // // page.keyboard.type(user.paypass)
    // // // @ts-ignore
    // // global.page = page;
    // let action = async () => {
    //   try {
    //     console.log("jingdong开始提交下单");
    //     await page.evaluate(() => {
    //       // (<HTMLDivElement>document.getElementById("btnPayOnLine")).click();
    //       var links = [
    //         ...document.querySelectorAll<HTMLLinkElement>(".mod_btns a")
    //       ];
    //       links.find(link => link.textContent!.includes("在线支付"))!.click();
    //     });
    //     console.log("jingdong点击提交订单按钮，等待回应");
    //     var res = await page.waitForResponse(res =>
    //       res.url().startsWith("https://wqdeal.jd.com/deal/msubmit/confirm?")
    //     );
    //     var text = await res.text();
    //     console.log(text);
    //     return text;
    //   } catch (e) {
    //     console.error(e);
    //     throw e;
    //   }
    // };
    // let submit = async () => {
    //   let text = await action();
    //   if (text.includes("您要购买的商品无货了") && args.jianlou) {
    //     console.log(moment().format(moment.HTML5_FMT.TIME), "开始刷库存");
    //     let {
    //       order: { address, venderCart }
    //       // @ts-ignore
    //     } = await page.evaluate(() => window.dealData);
    //     var skulist: any[] = [];
    //     if (venderCart[0].mfsuits) {
    //       venderCart.forEach(({ mfsuits }) => {
    //         mfsuits.forEach(({ products }) => {
    //           products.forEach(({ mainSku }) => {
    //             skulist.push({
    //               skuId: mainSku.id,
    //               num: mainSku.num
    //             });
    //           });
    //         });
    //       });
    //     } else if (venderCart[0].mzsuits) {
    //       venderCart.forEach(({ mzsuits }) => {
    //         mzsuits.forEach(({ products }) => {
    //           products.forEach(({ mainSku }) => {
    //             skulist.push({
    //               skuId: mainSku.id,
    //               num: mainSku.num
    //             });
    //           });
    //         });
    //       });
    //     } else {
    //       venderCart.forEach(({ products }) => {
    //         products.forEach(({ mainSku }) => {
    //           skulist.push({
    //             skuId: mainSku.id,
    //             num: mainSku.num
    //           });
    //         });
    //       });
    //     }
    //     var comment = await page.evaluate(() => {
    //       return Array.from(
    //         document.querySelectorAll<HTMLLinkElement>(".fn strong")
    //       )
    //         .map(link => link.textContent!.trim())
    //         .join("~")
    //         .substring(0, 50);
    //     });
    //     var p = taskManager.registerTask(
    //       {
    //         name: "刷库存",
    //         platform: "jingdong",
    //         comment,
    //         async handler() {
    //           var result = await getStock(skulist, address);
    //           var n = Object.keys(result).find(key =>
    //             result[key].status.includes("无货")
    //           );
    //           return !n;
    //         },
    //         time: startTime + args.jianlou * 1000 * 60,
    //         interval: {
    //           handler: async () => {
    //             // taskManager.cancelTask(p.id);
    //             // page.reload()
    //             page.close();
    //             page = await getOrderPage();
    //             page.goto(args.data.submit_url);
    //             await page
    //               .waitForResponse(res => res.url().includes("userasset"))
    //               .then(res => res.text());
    //             await page.evaluate(pass => {
    //               document.querySelector<HTMLInputElement>(
    //                 "#shortPassInput"
    //               )!.value = pass;
    //             }, user.paypass);
    //           },
    //           t: 30 * 60 * 1000
    //         }
    //       },
    //       0,
    //       "刷到库存了，去下单"
    //     );
    //     await p;
    //     return submit();
    //   } else {
    //     if (text.includes(`"errId":"0"`)) {
    //       sendQQMsg(text);
    //       return;
    //     }
    //   }
    //   throw new Error(text);
    // };
    // (async () => {
    //   try {
    //     await submit();
    //     console.log("下单成功");
    //     await page.waitForNavigation();
    //   } catch (e) {
    //     if (e.message.includes("多次提交过快，请稍后再试")) {
    //       await delay(2000);
    //       console.log("retry");
    //       return submitOrder(args);
    //     }
    //     throw e;
    //   } finally {
    //     await page.close();
    //   }
    // })();
    // return delay(50);
    // "errId":"9075","errMsg":"您的下单操作过于频繁，请稍后再试."
    // "errId":"8730","errMsg":"您要购买的商品无货了，换个收货地址或者其他款式的商品试试"
  } catch (e) {
    if (page!) {
      page!.close();
    }
    throw e;
  }
}

export async function submitOrderPc(
  args: ArgOrder<{
    submit_url: string;
  }>,
  p?: Promise<void>
): Promise<any> {
  var page = await newPage();
  try {
    if (p) {
      await p;
    }
    await page.goto(args.data.submit_url);
    page.evaluate(
      (pass, expectedPrice) => {
        var meta_text = document.getElementById("skuDetailInfo")!.textContent!;
        var skuNumList = [];
        if (meta_text) {
          let meta_data = JSON.parse(meta_text);
          skuNumList = meta_data.map(item => ({
            skuId: item.skuId,
            num: item.num
          }))
        } else {
          Array.from(document.querySelectorAll('.goods-item')).map(item => {
            var skuId = item.getAttribute('goods-id')!
            var num = item.querySelector('.p-num')!.textContent!.trim().substring(1)
            return {
              skuId,
              num
            }
          })
        }
        var area_ele = document.querySelector<HTMLDivElement>(
          ".consignee-item.item-selected"
        )!;
        var btn = document.getElementById("enterPriseUserPaymentSubmit")!;
        if (typeof expectedPrice === "number") {
          let price = +document
            .getElementById("sumPayPriceId")!
            .textContent!.substring(1);
          if (price - expectedPrice > 0.1) {
            throw new Error("太贵了");
          }
        }
        var data = {
          skuNumList,
          areaRequest: {
            provinceId: area_ele.getAttribute("provinceId"),
            cityId: area_ele.getAttribute("cityId"),
            countyId: area_ele.getAttribute("countyId"),
            townId: area_ele.getAttribute("townId")
          },
          coordnateRequest: {
            longtitude: area_ele.getAttribute("gcLng"),
            latitude: area_ele.getAttribute("gcLat")
          }
        };
        function check() {
          return fetch(`https://trade.jd.com/api/v1/batch/stock`, {
            method: "post",
            body: JSON.stringify(data),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            }
          })
            .then(res => res.json())
            .then(
              ({ result }) =>
                !Object.keys(result).find(key =>
                  result[key].status.includes("无货")
                )
            );
        }
        function handler() {
          check().then(b => {
            if (!b) {
              return handler();
            }
            submit();
          });
        }
        function submit() {
          console.log(new Date(), "去下单");
          btn.click();
          setTimeout(() => {
            handler();
            var ele = document.querySelector<HTMLDivElement>(".ui-dialog");
            if (ele) {
              ele.parentNode!.removeChild(ele);
            }
          }, 5000);
        }
        let input_pass = document.querySelector<HTMLInputElement>(
          ".quark-pw-result-input"
        )!;
        input_pass.value = pass;
        input_pass.dispatchEvent(new Event("input"));
        submit();
      },
      accounts.jingdong.paypass,
      args.expectedPrice
    );
  } catch (e) {
    if (page!) {
      page!.close();
    }
    throw e;
  }
}

export async function getNextDataByGoodsInfo(
  { skuId }: any,
  quantity: number,
  isSeckill = false
) {
  var submit_url =
    (isSeckill
      ? "https://wqs.jd.com/order/s_confirm_miao.shtml?"
      : "https://wq.jd.com/deal/confirmorder/main?") +
    qs_lib.stringify({
      sceneval: "2",
      bid: "",
      wdref: `https://item.m.jd.com/product/${skuId}.html`,
      scene: "jd",
      isCanEdit: "1",
      EncryptInfo: "",
      Token: "",
      commlist: [skuId, "", quantity, skuId, 1, 0, 0].join(","),
      locationid: ((await getCookie("jdAddrId")) || "")
        .split("_")
        .slice(0, 3)
        .join("-"),
      type: "0",
      lg: "0",
      supm: "0"
    });
  return {
    submit_url
  };
}

export type ArgCoudan = {
  quantities: number[];
  urls: string[];
  expectedPrice: number;
  addressId?: string;
  other: any;
};
export async function coudan(data: ArgCoudan): Promise<any> {
  var ret = await request.get(
    `https://cart.jd.com/reBuyForOrderCenter.action`,
    {
      qs: {
        wids: data.urls.map(getSkuId).join(","),
        nums: data.quantities.join(",")
      }
    }
  );
  return cartBuy(data);
}

import { BaseHandler } from "@/structs/api";
import { getGoodsInfo, getItemId } from "../goods";
import { getGoodsInfoFromPc } from "../goods/pc";
import { ArgBuyDirect, ArgCartBuy, ArgOrder } from "../structs";
import { newPage } from "@/background/page";
import { delay } from "@/background/common/tool";
import setting from "../setting";
import { logFile } from ".";
import { request } from "@/background/common/request";
import { taskManager } from "@/background/common/task-manager";
import { config } from "@/background/common/setting";
import { sendQQMsg } from "@/background/common/message";

export const buyDirectFromPc: BaseHandler["buy"] = async function(args) {
  var {
    itemDO,
    tradeConfig,
    tradeType,
    form,
    detail,
  } = await getGoodsInfoFromPc(args.url, true);
  if (!args.ignoreRepeat) {
    if (prev_id === itemDO.itemId) {
      throw new Error("重复下单");
    }
  }
  Object.assign(form, {
    quantity: args.quantity,
  });
  /* if (!p && !itemDO.isOnline) {
    throw new Error("商品已下架");
  } */
  prev_id = itemDO.itemId;

  var type = "tmall";
  var addr_url = "https:";
  if (form.etm === "") {
    if (detail.isHkItem) {
      addr_url += tradeConfig[tradeType];
    } else {
      addr_url += tradeConfig[1];
      type = "taobao";
    }
  } else {
    addr_url += tradeConfig[2];
  }
  function submit() {
    var nextData: any = {
      data: {
        form,
        addr_url,
        referer: args.url,
      },
      // @ts-ignore
      other: {},
      title: itemDO.title,
      ...args,
    };
    if (args.from_browser) {
      return submitOrderFromBrowser2(nextData, type);
    }
    return () => submitOrder(nextData, type);
  }
  try {
    var f = await submit();
    if (args.jianlou) {
      waitForStock(
        {
          id: getItemId(args.url),
          quantity: args.quantity,
          skuId: form.skuId,
          url: args.url,
          title: itemDO.title,
        },
        args.jianlou
      ).then(f);
      return "正在捡漏中";
    }
    return f();
    /* var ret = await req.post("https:" + tradeConfig[2], {
      form,
      qs: qs_data
    }); */
  } catch (e) {
    console.error("订单提交出错", e);
  }
};

export const coudanFromPc: BaseHandler["coudan"] = async function(args) {};

export const cartBuyFromPc: BaseHandler["cartBuy"] = async function(args) {
  const { items, from_browser, ...restArgs } = args;
  var cartIdStr = items.map(({ cartId }) => cartId).join(",");
  var sellerIdStr = [...new Set(items.map(({ sellerId }) => sellerId))].join(
    ","
  );
  var goods = items.map(
    ({ cartId, itemId, skuId, quantity, createTime, attr }) => ({
      cartId,
      itemId,
      skuId,
      quantity,
      createTime,
      attr,
    })
  );
  var data: any;
  var type = "";
  if (items[0].toBuy === "taobao") {
    type = "taobao";
    data = {
      form: {
        // 1477911576836_599254259447_1_0_3099613854_0_0_0_buyerCondition~0~~dpbUpgrade~null~~cartCreateTime~1567339151000_{"attributes":{"itemExtra":"{}"}}_0
        // 1475854274052_571869707416_1_0_2219509495_0_0_0_buyerCondition~0~~dpbUpgrade~null~~cartCreateTime~1567176717000_{"attributes":{"itemExtra":"{}"}}_0
        item: items
          .map(
            (item) =>
              `${item.cartId}_${item.itemId}_${item.quantity}_0_${item.sellerId}_0_0_0_buyerCondition~0~~dpbUpgrade~null~~cartCreateTime~${item.createTime}_{"attributes":{"itemExtra":"{}"}}_0`
          )
          .join(","),
        buyer_from: "cart",
        source_time: Date.now(),
      },
      addr_url: `https://buy.taobao.com/auction/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined`,
      referer: `https://cart.taobao.com/cart.htm?spm=a220o.1000855.a2226mz.12.5ada2389fIdDSp&from=btop`,
    };
  } else {
    type = "tmall";
    data = {
      form: {
        hex: "n",
        cartId: cartIdStr,
        sellerid: sellerIdStr,
        cart_param: JSON.stringify({
          items: goods,
        }),
        unbalance: "",
        delCartIds: cartIdStr,
        use_cod: false,
        buyer_from: "cart",
        page_from: "cart",
        source_time: Date.now(),
      },
      addr_url: `https://buy.tmall.com/order/confirm_order.htm?spm=a1z0d.6639537.0.0.undefined`,
      referer: `https://cart.taobao.com/cart.htm?spm=a21bo.2017.1997525049.1.5af911d97tfEQo&from=mini&ad_id=&am_id=&cm_id=&pm_id=1501036000a02c5c3739`,
    };
  }
  const nextData = {
    data,
    other: {},
    ...restArgs,
    title: items.map(({ title }) => title).join(","),
  };
  if (from_browser) {
    return submitOrderFromBrowser2(nextData, type);
  }
  return () => submitOrder(nextData, type);
};

async function waitForStock(
  args: {
    skuId?: string;
    id: string;
    quantity: number;
    url: string;
    title: string;
  },
  duration: number
): Promise<any> {
  var time = Date.now() + duration * 1000 * 60;
}
let prev_id = "";

async function submitOrder(
  args: ArgOrder<{
    form: Record<string, any>;
    addr_url: string;
    referer: string;
  }>,
  type: string,
  retryCount = 0
): Promise<any> {
  var {
    data: { form, addr_url, referer },
  } = args;
  console.log(args.title + ":准备进入订单结算页:");
  // logFile(addr_url + "\n" + JSON.stringify(form), "pc-准备进入订单结算页");
  var start_time = Date.now();
  var html: string = await request.form(addr_url, form, {
    referer,
  });
  var time_diff = Date.now() - start_time;
  function checkValidate(html: string) {
    if (html.lastIndexOf("security-X5", html.indexOf("</title>")) > -1) {
      let msg = "进入订单结算页碰到验证拦截";
      console.log(`-------${msg}--------`);
      // logFile(html, "pc-订单提交验证拦截");
      goValidate(args);
      throw new Error(msg);
    }
  }
  checkValidate(html);
  console.log(args.title + ":进入订单结算页用时：" + time_diff);
  logFile(addr_url + "\n" + html, "pc-订单结算页", ".html");
  var text = /var orderData\s*=(.*);/.exec(html)![1];
  var res: OrderData = JSON.parse(text);
  /* console.log(args.noinvalid);
    if (args.noinvalid && structure.invalidGroup_2) {
      throw new Error("存在无效商品");
    } */
  var meta = getOrderDataMeta(res);
  if (!meta.success) {
    console.error(`${args.title}:${meta.msg}`);
    if (!args.jianlou) {
      if (!args.seckill) {
        return;
      }
      if (retryCount >= 1) {
        throw new Error(args.title + ":已失败两次，放弃治疗");
      }
      submitOrder(args, type, retryCount + 1);
      return;
    }
    await waitExpectedOrderData();
  }
  function getFormData(
    { endpoint, data, linkage, hierarchy: { structure } }: OrderData,
    isUpdate = false,
    i = 0
  ) {
    var { submitOrderPC_1 } = data;
    var qs_data;
    var operator;
    var common;
    var input: string[];
    var lifecycle;
    var submit_url;
    var formData;
    if (data.submitOrderPC_1) {
      if (isUpdate) {
        operator = "addressPC_1";
        data.addressPC_1.fields.selectedId =
          data.addressPC_1.fields.options[i].deliveryAddressId;
        common = {
          compress: true,
          queryParams: linkage.common.queryParams,
          validateParams: linkage.common.validateParams,
        };
        input = [operator].concat(linkage.input);
        lifecycle = "null";
        submit_url = linkage.url;
        submitOrderPC_1.fields.priceTips = "";
      } else {
        qs_data = {
          spm: `a220l.1.a22016.d011001001001.undefined`,
          submitref: submitOrderPC_1.hidden.extensionMap.secretValue,
          sparam1: submitOrderPC_1.hidden.extensionMap.sparam1,
          sparam2: submitOrderPC_1.hidden.extensionMap.sparam2,
        };
        common = {
          compress: true,
          submitParams: linkage.common.submitParams,
          validateParams: linkage.common.validateParams,
        };
        input = Object.keys(data).filter((key) => data[key].submit);
        submit_url = submitOrderPC_1.hidden.extensionMap.pcSubmitUrl;
      }
      formData = {
        endpoint: JSON.stringify(endpoint),
        operator,
        linkage: JSON.stringify({
          common,
          signature: linkage.signature,
        }),
        data: JSON.stringify(
          input.reduce((state: any, name) => {
            var item = data[name];
            /* if (item.tag === "submitOrder") {
                        if (item.fields) {
                          if (ua_log) {
                            item.fields.ua = ua_log;
                          }
                        }
                      } */
            if (item.tag === "eticketDesc") {
              item.fields.value = args.other.mobile;
            } else if (item.tag === "itemInfoPC") {
              let { priceInfo, quantity } = item.fields;
              if (quantity) {
                priceInfo.valueStyles.bold = true;
                quantity.min = +quantity.min;
                quantity.quantity = +quantity.quantity;
                quantity.step = +quantity.step;
                quantity.max = +quantity.max;
              }
            }
            state[name] = item;
            return state;
          }, {})
        ),
        hierarchy: JSON.stringify({
          structure,
        }),
        lifecycle,
      };
      if (!isUpdate) {
        Object.assign(formData, {
          input_charset: submitOrderPC_1.hidden.extensionMap.input_charset,
          event_submit_do_confirm:
            submitOrderPC_1.hidden.extensionMap.event_submit_do_confirm,
          action: submitOrderPC_1.hidden.extensionMap.action,
          praper_alipay_cashier_domain: "cashierstl",
          _tb_token_: /name=['"]_tb_token_['"].*? value=['"](.*?)['"]/.exec(
            html
          )![1],
        });
        ["endpoint", "linkage", "data", "hierarchy"].forEach((key) => {
          formData[key] = encodeURIComponent(formData[key]);
        });
      }
      submit_url = `https://buy.tmall.com${submit_url}`;
    } else {
      let { confirmOrder_1 } = data;
      let ua_log =
        "119#MlKA70vEMnDyqMMzZR0mfhNqsAOCc0zzNoYqOxPXiX8rOLMlRvBsQHACBLnD7HNkVW6u+TJDO2dsHEKw83cWa2lUDbCsSUkGMZA8RJBONt8LfoHMRPPe3FN8fHhS4Q9LdeNMR2VVNlsCqwMJqQPOutK6fusG4lhLPGg1RJ+q+NFGf/VwKSqj+EAL9eVH4QyG2eALRJE+EE387nASRVTmHNA6h2+S4lca0rA87PjVNN3Mxe3RaB0U3FNcQ1hzcDbL3e3My2I3TAFGfoZEh/loEEAL9weXLl9Lt1ELKlGv86GGMaASRBSUWLNN2I75eGcR3oALR2V48iVNNJd6+7hSzsyTgYCQM6ILf9lNDKDMyaD6cQ9YCYbCuYUcuuFM5yEg02+qaowfKLyxBXU8Ft9A4ia4LltAFPd5qdtAcnn8R7ho4LbVKKgB53QfxeC/hIJxtmKJZd2VBm5lz/LN09il3DbBKeaRMc/J1eugCy8Kb5lyXIoB3cfAkvUQjSDL5n4ubXZdBj4MiYX2BOsZRSfmWR8hVf5yn53hSaCZTLHKt7FbC9ZydWY1AB8+IFCJ8Qh2z9vM3TX/7pzXKH6MJcjYR8YntN9rmxnMKSOr/5hyWOGahQLHimcEeBmyWCbwLD6v6OOjualjPSwjk9VCx/yX2GAI4QJJ8bq3XA4b9z1AfjWmSe8/iedwoUahD6NT5zB3M0tAqy0vMv65kYVzj9Mvr/RimM2FHuErzYj9IjC0JJOFgnEYuAnMrRUvdLZjWqlyrIus3RbKuEM5E++wjfaqXGWRQny9BCGg+hJJIilFDyuuF3EitezdHX8mWypJ6e+MjAkDwq8Q7LIo5cANFZSQF3qpJun7d671jsKQLSuFgNPISBEAQWAy7+ZM3Y+biHaMRCXlYnMbY0EI";

      if (isUpdate) {
        operator = "address_1";
        common = {
          compress: true,
          queryParams: linkage.common.queryParams,
          validateParams: linkage.common.validateParams,
        };
        input = [operator].concat(linkage.input);
        lifecycle = "null";
        submit_url = linkage.url;
      } else {
        input = Object.keys(data).filter((key) => data[key].submit);
        common = {
          compress: true,
          submitParams: linkage.common.submitParams,
          validateParams: linkage.common.validateParams,
        };
        submit_url =
          confirmOrder_1.fields.pcSubmitUrl ||
          /var submitURL="([^"]+)/.exec(html)![1];
      }
      formData = {
        operator,
        hierarchy: JSON.stringify({
          structure,
        }),
        data: JSON.stringify(
          input.reduce((state: any, name) => {
            var item = data[name];
            if (item.tag === "submitOrder") {
              if (item.fields) {
                if (ua_log) {
                  item.fields.ua = ua_log;
                }
              }
            } else if (item.tag === "eticketDesc") {
              item.fields.value = args.other.mobile;
            }
            state[name] = item;
            return state;
          }, {})
        ),
        linkage: JSON.stringify({
          common: linkage.common,
          signature: linkage.signature,
        }),
        lifecycle,
      };
      if (!isUpdate) {
        formData.praper_alipay_cashier_domain = "cashierstl";
        [
          "_tb_token_",
          "action",
          "event_submit_do_confirm",
          "input_charset",
          // "praper_alipay_cashier_domain",
          "authYiYao",
          "authHealth",
          "F_nick",
        ].forEach((name) => {
          var arr = new RegExp(
            `name=['"]${name}['"].*? value=['"](.*?)['"]`
          ).exec(html);
          if (arr) {
            formData[name] = arr![1];
          }
        });
        qs_data = {
          spm: `a220l.1.a22016.d011001001001.undefined`,
          submitref: confirmOrder_1.fields.secretValue,
          sparam1: confirmOrder_1.fields.sparam1,
          sparam2: confirmOrder_1.fields.sparam2,
        };
      }
      submit_url = `https://buy.taobao.com${submit_url}`;
    }
    return {
      qs_data,
      formData,
      submit_url,
    };
  }
  function getOrderDataMeta(orderData: OrderData) {
    var success = true;
    var msg;
    var {
      linkage,
      data: { realPayPC_1, realPay_1 },
    } = orderData;
    if (!linkage.input) {
      success = false;
      msg = args.title + ":存在无效商品";
    } else {
      if (typeof args.expectedPrice !== "undefined") {
        let price = realPayPC_1
          ? +realPayPC_1.fields.price
          : +realPay_1.fields.price;
        if (price > +args.expectedPrice) {
          success = false;
          msg = `${args.title}: 期望价格:${args.expectedPrice}, 实际价格：${price}`;
        }
      }
    }
    return {
      success,
      msg,
    };
  }
  function waitExpectedOrderData1() {
    return taskManager.registerTask(
      {
        name: "捡漏",
        platform: "taobao-pc",
        comment: args.title,
        handler: async () => {
          try {
            var html: string = await request.form(addr_url, form, {
              referer,
            });
            checkValidate(html);
            var text = /var orderData\s*=(.*);/.exec(html)![1];
            res = JSON.parse(text);
            return getOrderDataMeta(res).success;
          } catch (e) {}
        },
        time: start_time + 1000 * 60 * args.jianlou!,
      },
      0,
      "刷到库存了，去下单---"
    );
  }
  function waitExpectedOrderData() {
    var i = 0;
    return taskManager.registerTask(
      {
        name: "捡漏",
        platform: "taobao-pc",
        comment: args.title,
        handler: async () => {
          try {
            i = 1 - i;
            var { submit_url, formData, qs_data } = getFormData(res, true, i);
            var resData = await request.form(submit_url, formData, {
              qs: qs_data,
              referer: addr_url,
              headers: {
                "x-requested-with": "XMLHttpRequest",
                "content-type":
                  "application/x-www-form-urlencoded; charset=UTF-8",
              },
            });
            var { data, endpoint, linkage, hierarchy } = resData;
            Object.assign(res.data, data);
            res.endpoint = endpoint;
            res.linkage = linkage;
            if (hierarchy) {
              res.hierarchy = hierarchy;
            }
            /* setting.req.post("http://localhost:88", {
                qs: qs_data,
                form: formData,
                headers: {
                  Referer: addr_url,
                  "x-requested-with": "XMLHttpRequest"
                  // origin: "https://buy.tmall.com"
                }
              }); */
            return getOrderDataMeta(res).success;
          } catch (e) {}
        },
        time: start_time + 1000 * 60 * args.jianlou!,
      },
      0,
      "刷到库存了，去下单---"
    );
  }
  if (!config.isSubmitOrder) {
    return;
  }
  var submit = () => {
    console.log(args.title + "-----开始提交订单----");
    var { submit_url, qs_data, formData } = getFormData(res);
    addQueue(async () => {
      try {
        let ret = "";
        try {
          ret = await request.form(submit_url, formData, {
            qs: qs_data,
            referer: addr_url,
          });
        } catch (err) {
          const { request } = err;
          if (
            request.responseURL.startsWith(
              "/auction/order/TmallConfirmOrderError.htm"
            )
          ) {
            let msg = /<h2 class="sub-title">([^<]*)/.exec(request.data)![1];
            console.log(args.title + ":" + msg);
            // 购买数量超过了限购数。可能是库存不足，也可能是人为限制。
            if (
              msg.includes("优惠信息变更") ||
              msg.startsWith("购买数量超过了限购数")
            ) {
              if (args.expectedPrice && args.expectedPrice < 1) {
                return;
              }
              if (args.jianlou && args.jianlou > 0) {
                await waitExpectedOrderData();
                await submit();
              }
              return;
            }
            if (
              msg.includes("请填写正确的") ||
              msg.includes("商品在收货地址内不可售")
            ) {
              return;
            }
            throw new Error(args.title + ":" + msg);
          }
          throw err;
        }
        if (ret.trim().startsWith("<a")) {
          console.log(args.title + "：订单被拦截");

          goValidate(args);
          sendQQMsg(`${args.title}(${setting.username}) pc订单被拦截`);
          return;
        }
        if (ret.indexOf("security-X5") > -1) {
          goValidate(args);
          console.log(args.title + "-------提交碰到验证拦截--------");
          logFile(ret, "pc-订单提交验证拦截");
          return;
        }
        // /auction/confirm_order.htm
        logFile(ret, "pc-订单已提交");
        let p_url = /window\.location\s*=\s*"([^"]+)/.exec(ret);
        if (!p_url) {
          sendQQMsg(`${args.title}(${setting.username}) pc订单提交失败`);
          return;
        }
        console.log(args.title + "-----订单提交成功，等待付款----");
        sendQQMsg(
          `${args.title}(${setting.username}) pc订单提交成功，速度去付款`
        );
        if (args.expectedPrice && args.expectedPrice < 1) {
          (async () => {
            await delay(3000);
            let pass = "";
            if (setting.username === "yuanxiaowaer") {
              pass = "870092";
            } else if (setting.username === "15262677381欧泽和") {
              pass = "869328";
            } else {
              return;
            }
            let page = await newPage();
            try {
              // await page.setRequestInterception(true);
              page.goto(p_url[1]);
              // await page.waitForResponse(res =>
              //   res.url().startsWith("https://tscenter.alipay.com/home/pc.htm")
              // );
              await page.waitForSelector("#J_authSubmit");
              await page.evaluate((pass: string) => {
                var ele = document.querySelector<HTMLInputElement>(
                  "#payPassword_rsainput"
                )!;
                ele.value = pass;
              }, pass);
              await page.click("#J_authSubmit");
              await page.waitForNavigation();
              sendQQMsg(`${args.title}(${setting.username}) pc订单已付款`);
            } finally {
              await page.close();
            }
          })();
        }
      } catch (e) {
        console.trace(e);
        if (retryCount >= 3) {
          return console.error(args.title + ":重试失败3次，放弃治疗");
        }
        console.log(args.title + ":重试中");
        submitOrder(args, type, retryCount + 1);
      }
    });
  };
  await delay(config.delay_submit);
  await submit();
}

// @Serial(0)
async function addQueue(f: Function) {
  f();
  await delay(config.interval_submit);
}

async function submitOrderFromBrowser(
  args: ArgOrder<{
    form: Record<string, any>;
    addr_url: string;
    referer: string;
  }>,
  type: string,
  p?: Promise<void>
) {
  var {
    data: { form, addr_url, referer },
  } = args;
  var page = await newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    // if (
    //   request
    //     .url()
    //     .startsWith(
    //       "https://cashierstl.alipay.com/standard/fastpay/channelExtInfo.json"
    //     )
    // ) {
    //   (async () => {
    //     await page.waitForSelector("#J_authSubmit");
    //     await page.evaluate(() => {
    //       var ele = document.querySelector<HTMLInputElement>(
    //         "#payPassword_rsainput"
    //       )!;
    //       console.log(ele);
    //       ele.value = "870092";
    //     });
    //     // await page.type("#payPassword_rsainput", "870092");
    //     await page.click("#J_authSubmit");
    //   })();
    // }
    var type = request.resourceType();
    if (type === "image" || type === "stylesheet" || type === "font") {
      request.respond({
        body: "",
      });
    } else {
      request.continue();
    }
  });
  await page.goto(referer);
  await page.evaluate(createForm, form, addr_url);
  if (p) {
    await p;
  }
  page.evaluate(() => {
    document.querySelector<HTMLFormElement>("#__form")!.submit();
  });
  await page.waitForNavigation();
  // await delay(30);
  page.click(".go-btn");
}

async function submitOrderFromBrowser2(
  args: ArgOrder<{
    form: Record<string, any>;
    addr_url: string;
    referer: string;
  }>,
  type: string
) {
  var {
    data: { form, addr_url, referer },
  } = args;
  var page = await newPage();
  await page.goto(referer);
  // await page.setRequestInterception(true);
  // page.on("request", request => {
  //   // if (
  //   //   request
  //   //     .url()
  //   //     .startsWith(
  //   //       "https://cashierstl.alipay.com/standard/fastpay/channelExtInfo.json"
  //   //     )
  //   // ) {
  //   //   (async () => {
  //   //     await page.waitForSelector("#J_authSubmit");
  //   //     await page.evaluate(() => {
  //   //       var ele = document.querySelector<HTMLInputElement>(
  //   //         "#payPassword_rsainput"
  //   //       )!;
  //   //       console.log(ele);
  //   //       ele.value = "870092";
  //   //     });
  //   //     // await page.type("#payPassword_rsainput", "870092");
  //   //     await page.click("#J_authSubmit");
  //   //   })();
  //   // }
  //   var type = request.resourceType();
  //   if (type === "image" || type === "stylesheet" || type === "font") {
  //     request.respond({
  //       body: ""
  //     });
  //   } else {
  //     request.continue();
  //   }
  // });
  await page.evaluate(createForm, form, addr_url);
  return async () => {
    page.evaluate(() => {
      document.querySelector<HTMLFormElement>("#__form")!.submit();
    });
    await page.waitForNavigation();
    await delay(1000);
    page.evaluate(getScript, args.expectedPrice);
    // await page.reload();
    // page.click('.addr-default+div')
    // await page.waitForResponse(res => res.url().startsWith('https://buy.tmall.com/auction/json/async_linkage.do'))
    // await delay(16)
    // page.click(".go-btn");
  };
}

function getScript(price = 10) {
  function handler(maxPrice?: number) {
    var isTaobao = location.hostname.includes("taobao.");
    if (isTaobao) {
      window.confirm = () => true;
    }
    var list = document.querySelectorAll<HTMLDivElement>(
      isTaobao ? ".addr-item-wrapper label" : ".address-list>div"
    );
    if (list.length === 0) {
      return;
    }
    var b = false;
    // var currentPrice = Number(
    //   document.querySelector<HTMLDivElement>(".realpay--price")!.textContent
    // );
    function exchangeAddress() {
      if (b) {
        list[0].click();
      } else {
        list[1].click();
      }
      b = !b;
    }
    let btn = document.querySelector<HTMLDivElement>(
      "#submitOrderPC_1 a:last-child"
    )!;
    function submit() {
      if (!btn) {
        btn = document.querySelector<HTMLDivElement>(
          "#submitOrderPC_1 a:last-child"
        )!;
      }
      btn.click();
    }

    var send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(data) {
      // @ts-ignore
      if (this.__sufei_url.startsWith("/auction/json/async_linkage.do?")) {
        const listener = () => {
          try {
            const { data } = JSON.parse(this.responseText);
            if (
              data.realPayPC_1 &&
              +data.realPayPC_1.fields.price <= maxPrice!
            ) {
              submit();
              return;
            }
          } catch (e) {
            console.log(e);
            exchangeAddress();
          }
          exchangeAddress();
          // this.removeEventListener("load", listener);
        };
        this.addEventListener("load", listener);
        this.addEventListener("error", listener);
        this.addEventListener("timeout", listener);
      }
      return send.call(this, data);
    };
    exchangeAddress();
  }
  var ele = document.createElement("script");
  var scriptContent = `(${handler.toString()})(${price})`;
  console.log(scriptContent);
  ele.textContent = scriptContent;
  document.body.appendChild(ele);
  document.body.removeChild(ele);
}

function createForm(data, action, need_submit = false) {
  var form = document.createElement("form");
  form.action = action;
  form.method = "post";
  form.id = "__form";
  Object.keys(data).forEach((key) => {
    var input = document.createElement("input");
    input.name = key;
    input.value = data[key];
    form.appendChild(input);
  });
  document.body.appendChild(form);
  if (need_submit) {
    form.submit();
  }
}

let lastValidateTime = 0;

async function goValidate(args) {
  var now = Date.now();
  if (now - lastValidateTime > 1000 * 10) {
    lastValidateTime = now;

    var {
      data: { form, addr_url, referer },
    } = args;
    var page = await newPage();

    await page.goto(referer || "https://www.taobao.com/");
    await page.evaluate(createForm, form, addr_url, true);
  }
}

interface OrderData {
  endpoint: {
    mode: string;
    osVersion: string;
    protocolVersion: string;
    ultronage: string;
  };
  data: Record<
    string,
    {
      submit: boolean;
      tag: string;
      fields: any;
    }
  > & {
    confirmOrder_1: {
      fields: {
        pcSubmitUrl: string;
        secretValue: string;
        sparam1: string;
        sparam2: string;
        sourceTime: string;
      };
    };
    submitOrderPC_1: {
      hidden: {
        extensionMap: {
          action: string;
          event_submit_do_confirm: string;
          input_charset: string;
          pcSubmitUrl: string;
          secretKey: string;
          secretValue: string;
          sparam1: string;
          sparam2?: string;
          unitSuffix: string;
        };
      };
      fields: {
        priceTips: string;
        showPrice: string;
      };
    };
    addressPC_1: {
      fields: {
        options: {
          deliveryAddressId: string;
        }[];
        selectedId: string;
      };
    };
    realPayPC_1: {
      fields: {
        price: string;
      };
      hidden: {
        extensionMap: {
          timestamp: string;
        };
      };
    };
  };
  linkage: {
    common: {
      compress: boolean;
      queryParams: string;
      submitParams: string;
      validateParams: string;
    };
    signature: string;
    input?: string[];
    url: string;
  };
  hierarchy: {
    structure: Record<string, string[]>;
  };
}

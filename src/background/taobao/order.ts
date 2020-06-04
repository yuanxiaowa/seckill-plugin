import Vue from "vue";
import { ArgOrder, ArgBuyDirect, CoudanArg } from "./structs";
import { requestData, getUserName } from "./tools";
import { getGoodsInfo } from "./goods";
import { addCart, getCartList } from "./cart";
import qs_lib from "querystring";
import { config, UA, accounts } from "../common/setting";
import { delay } from "../common/tool";
import { taskManager } from "../common/task-manager";
import { notify, sendQQMsg } from "../common/message";
import { excutePageAction } from "../page";

function logFile(a: any, b?: any, c?: any) {}

function transformOrderData(
  orderdata: any,
  args: ArgOrder<any>,
  operator?: string,
  new_structure?: any
) {
  var {
    data,
    linkage,
    hierarchy: { structure, root },
    endpoint,
  } = orderdata;
  if (operator !== "address_1") {
    let invalids = structure[root].filter((name) => name.startsWith("invalid"));
    if (invalids.length > 0) {
      throw {
        message: `${args.title} 有失效宝贝`,
        code: 2,
      };
    }
    let price = data.realPay_1
      ? +data.realPay_1.fields.price
      : data.submitOrder_1.hidden.extensionMap.showPrice;
    if (typeof args.expectedPrice === "number") {
      if (Number(args.expectedPrice) < Number(price) - 0.1) {
        throw {
          message: `${args.title} 价格太高，期望${args.expectedPrice}，实际${price}`,
          code: 2,
        };
      }
    }
  }
  // if (dataSubmitOrder.hidden) {
  // var realPay = data.realPay_1;
  var orderData = Object.keys(data).reduce((state, name) => {
    var item = data[name];
    // item._request = request_tags[item.tag];
    if (item.submit) {
      let i = name.indexOf("_");
      let tag = name.substring(0, i);
      let id = name.substring(i + 1);
      item.fields.value = args.other[item.tag] || item.fields.value;
      item.id = id;
      item.tag = tag;
      state[name] = item;
    }
    return state;
  }, <any>{});
  // } else {
  //   let realPay = data.realPay_1;
  //   endpoint = undefined;
  //   price = realPay.fields.price;
  //   var orderData = Object.keys(data).reduce(
  //     (state, name) => {
  //       var item = data[name];
  //       item._request = request_tags[item.tag];
  //       if (item.submit) {
  //         item.fields.value = args.other[item.tag];
  //         state[name] = item;
  //       }
  //       return state;
  //     },
  //     <any>{}
  //   );
  //   var address = data.address_1;
  //   realPay.fields.currencySymbol = "￥";
  //   dataSubmitOrder._realPay = realPay;
  //   if (address) {
  //     let { fields } = address;
  //     fields.info = {
  //       value: fields.options[0].deliveryAddressId.toString()
  //     };
  //     fields.url =
  //       "//buy.m.tmall.com/order/addressList.htm?enableStation=true&requestStationUrl=%2F%2Fstationpicker-i56.m.taobao.com%2Finland%2FshowStationInPhone.htm&_input_charset=utf8&hidetoolbar=true&bridgeMessage=true";
  //     fields.title = "管理收货地址";
  //     dataSubmitOrder._address = address;
  //   }
  //   var coupon = data.coupon_3;
  //   if (coupon && coupon.fields.totalValue) {
  //     coupon.fields.value =
  //       "-" + Number(/￥(.*)/.exec(coupon.fields.totalValue)![1]).toFixed(2);
  //   }
  // }
  var ua =
    "120#bX1bSbnosGDVHyn4GCwVLGU/qhVnPz7gXEWbpeS3BWDqxvHnn5lbFazGrvimIXiCHD7UAc0M2w+P7Kfq6seiXL43dPZhT8GsVJxqI1hO5pn0FZqOHHxEb+SDknLFlAPg9GwNUK3PYbkIPXIbbUDONee/P8Lw6HPIbOrA46pVSxtkOyzBz7iDwUM4AoTzGn/90yrFLO3G+rJ6P7+sMwCXDz/N0SfEPlbi7PrCoAFDGtdGZpidU604NtyrUhPPrZdWgGjYcB/El9OAzLmzmr8y2dwGHV7jQ62eEmmJAXLdZR1O1HN659N54xjQn5DvPxZn+QOZlmhE4x82LuhqpkBfqONOw6/Q6bqc3gRTExBUAhYLsjDquA1eIjj7oJ8cHNZp8qRhrqjTLybJadlqKxiCGXED2IYBiu1GrDmVtJFidJHXe3/z83vuWtU9AtSUM1xzE+Zj5Nja2aXk8qxB+WUy0WHZ8XlEmG3+Cn6lVxy1X9rjaZiolupmFWAyWixVo6oNo9t/JU+9x1vuy/Y+SOPcmLNSHhHUI82BO6C3fnGKeanPtZ5eA8T60dCWiXGdNcG0MXaPjwR5fYl7BjrcOb/z4UX1tN7uBZR1RVY6/En0Wj0DvpNy2sUG353sdPT9g4YTsgRcuJA1g9RJySfifhuNEh/Hh2pciXhwrpJUPV3R2aFW//d8UpQbXM+oOjKaDcVQJEMBEqZYjoQDIe6b/aYjfNtpDMsM8O+9jI1QgwXdsId5V2AkxiYFzPNUzsnPgzoO1OpA+yDFf9JEXPOTnzF2TX/a7R0phyFAFGuMBNfqHcQN24fqstfOO0A=";
  var common: any;

  var { address_1 } = orderData;
  if (args.addressId) {
    address_1.hidden.extensionMap.selectedId = String(args.addressId);
  }
  if (operator === "address_1") {
    let input = linkage.input;
    if (!input) {
      input = Object.keys(orderData).filter((key) => orderData[key].submit);
    }
    orderData = input.reduce(
      (state, key) => {
        state[key] = orderData[key];
        return state;
      },
      {
        address_1,
      }
    );
    let baseDeliverAddressDO = JSON.parse(
      address_1.hidden.extensionMap.options
    )[0].baseDeliverAddressDO;
    endpoint = undefined;
    let selectedId = address_1.hidden.extensionMap.selectedId;
    let info = {
      value: selectedId,
      addressId: selectedId,
    };
    let desc =
      baseDeliverAddressDO.fullName +
      "：" +
      baseDeliverAddressDO.province +
      baseDeliverAddressDO.city +
      baseDeliverAddressDO.area +
      baseDeliverAddressDO.addressDetail;
    address_1.fields.cornerType = "both";
    [
      address_1.fields,
      ...address_1.events.itemClick.map((item) => item.fields.params),
    ].forEach((item) => {
      item.info = info;
      item.desc = desc;
    });
    common = {
      compress: linkage.common.compress,
      queryParams: linkage.common.queryParams,
      validateParams: linkage.common.validateParams,
    };
  } else {
    common = {
      compress: linkage.common.compress,
      submitParams: linkage.common.submitParams,
      validateParams: linkage.common.validateParams,
    };
    if (new_structure) {
      structure = new_structure;
    }
    let { coupon_3, tbgold_1 } = orderData;
    address_1.fields.cornerType = "both";
    if (coupon_3) {
      coupon_3.fields.cornerType = "bottom";
    }
    if (tbgold_1) {
      tbgold_1.fields.cornerType = "top";
    }
  }
  var postdata = {
    params: JSON.stringify({
      data: JSON.stringify(orderData),
      endpoint: JSON.stringify(endpoint),
      hierarchy: JSON.stringify({
        structure,
      }),
      linkage: JSON.stringify({
        common,
        signature: linkage.signature,
      }),
      operator,
    }),
    // ua
  };
  return postdata;
}

export async function submitOrder(args: ArgOrder<any>, retryCount = 0) {
  var startDate = new Date();
  var startTime = startDate.getTime();
  console.time("订单结算 " + args.title + startTime);
  // other.memo other.ComplexInput
  console.log(`\n😎----准备进入手机订单结算页：${args.title}`);
  var data1;
  try {
    // {
    //   jsv: "2.4.7",
    //   appKey: appKey,
    //   api: "mtop.trade.buildOrder.h5",
    //   v: "3.0",
    //   type: "originaljson",
    //   timeout: "20000",
    //   isSec: "1",
    //   dataType: "json",
    //   ecode: "1",
    //   ttid: "#t#ip##_h5_2014",
    //   AntiFlood: "true",
    //   LoginRequest: "true",
    //   H5Request: "true"
    // }
    data1 = await requestData("mtop.trade.order.build.h5", {
      data: Object.assign(
        {
          exParams: JSON.stringify({
            tradeProtocolFeatures: "5",
            userAgent: UA.wap,
          }),
        },
        args.data
      ),
      method: "post",
      advance: 1500,
    });
  } catch (e) {
    console.error(`\n😵获取订单信息出错：${args.title}`, e);
    if (retryCount >= 1) {
      console.error(`已经重试两次，放弃治疗：${args.title}`);
      if (e.name === "FAIL_SYS_TRAFFIC_LIMIT" || e.message.includes("被挤爆")) {
        window.open(
          `https://main.m.taobao.com/order/index.html?` +
            qs_lib.stringify(
              Object.assign(
                {
                  exParams: JSON.stringify({
                    tradeProtocolFeatures: "5",
                    userAgent: UA.wap,
                  }),
                },
                args.data
              )
            )
        );
      }
      throw e;
    }
    if (e.name === "FAIL_SYS_TRAFFIC_LIMIT" || e.message.includes("被挤爆")) {
      console.log(`太挤了，正在重试：${args.title}`);
      submitOrder(args, retryCount + 1);
      return;
    }
    throw e;
  }
  console.timeEnd("订单结算 " + args.title + startTime);
  console.log(`\n-----已经进入手机订单结算页：${args.title}`);
  logFile(data1, "手机订单结算页", ".json");
  console.log(`-----准备提交：${args.title}`);
  var postdata;
  var structure;
  var expire_count = 0;
  async function getNewestOrderData() {
    let { params } = transformOrderData(data1, args, "address_1");
    try {
      let data = await requestData("mtop.trade.order.adjust.h5", {
        data: {
          params,
          feature: `{"gzip":"false"}`,
        },
        method: "post",
        ttid: "#t#ip##_h5_2019",
      });
      ["endpoint", "linkage" /* , "hierarchy" */].forEach((key) => {
        if (data[key]) {
          data1[key] = data[key];
        }
      });
      if (data.hierarchy) {
        structure = data.hierarchy.structure;
      }
      if (data.data.submitOrder_1) {
        data1.data = data.data;
      }
      expire_count = 0;
    } catch (e) {
      if (e.message !== "对不起，系统繁忙，请稍候再试") {
        if (e.message === "令牌过期") {
          if (expire_count > 0) {
            window.open(
              "https://login.taobao.com/member/login.jhtml?spm=a21bo.2017.754894437.1.5af911d9pLCy1I&f=top&redirectURL=https%3A%2F%2Fwww.taobao.com%2F"
            );
            e.skip = true;
          }
          expire_count++;
        }
        throw e;
      }
    }
  }

  var prev_error_msg;
  async function handleOrderData() {
    try {
      postdata = transformOrderData(data1, args, undefined, structure);
      startTime = Date.now();
      logFile(postdata, "订单结算页提交的数据", ".json");
      /* writeFile("a1.json", getTransformData(postdata));
    writeFile("a2.json", getTransformData(await getPageData(args))); */
      return true;
    } catch (e) {
      if (e.code === 2) {
        if (e.message !== prev_error_msg) {
          console.log(e.message);
          prev_error_msg = e.message;
        }
        await getNewestOrderData();
      } else {
        throw new Error(e.message);
      }
    }
  }
  var _n = args.bus ? 2 : 1;

  var submit = async (retryCount = 0) => {
    try {
      if (args.jianlou && !args.no_interaction) {
        if (!args.bus) {
          args.bus = new Vue();
          console.log(`\n${_n}打开另一个捡漏-${args.title}`);
          submitOrder(args, 1);
        } else {
          let b = false;
          while (Date.now() - startDate.getTime() < config.delay_submit || b) {
            console.log("\n" + _n + "不到时间,再刷:" + args.title);
            try {
              await delay(16);
              await getNewestOrderData();
              await doJianlou(_n + "(时间不够)");
            } catch (e) {
              b = true;
              console.log("\n" + _n + "不到时间,出错:" + args.title, e.message);
              if (e.message === "非法请求") {
                console.error("......", args.title);
                return;
              }
              if (e.skip) {
                return;
              }
            }
          }
          console.log("\n" + _n + "捡漏结束，去通知下单..." + args.title);
          args.bus.$emit("continue");
        }
        await new Promise((resolve) => {
          args.bus!.$once("continue", resolve);
        });
        startDate = new Date();
      } else {
        await delay(config.delay_submit);
      }
      // let now = Date.now();
      /* let diff = 10 * 1000 - (now - prev_submit_time);
        if (diff > 0) {
          console.log("\n提交订单太快，稍等一下");
          await delay(diff);
        } */
      // prev_submit_time = startTime = now;
      console.time(_n + "订单提交 " + startTime);
      let ret = await requestData("mtop.trade.order.create.h5", {
        data: postdata,
        method: "post",
        qs: {
          [data1.global.secretKey]: data1.global.secretValue,
        },
        referer: `https://main.m.taobao.com/order/index.html?${qs_lib.stringify(
          args.data
        )}`,
        origin: "https://main.m.taobao.com",
      });
      logFile(ret, `手机订单提交成功`);
      console.log(`\n😃${_n} ----------手机订单提交成功：${args.title}`);
      console.timeEnd(_n + "订单提交 " + startTime);
      let msg = `(${await getUserName()})手机订单提交成功，速度去付款：${
        args.title
      }`;
      notify(msg);
      sendQQMsg(msg);
      if (
        (args.autopay || args.expectedPrice! <= 0.3) &&
        accounts.taobao.paypass
      ) {
        console.log(ret);
        pay(ret.alipayWapCashierUrl, accounts.taobao.paypass);
      }
    } catch (e) {
      startTime = Date.now();
      if (
        e.message.includes("优惠信息变更") ||
        e.message.startsWith("购买数量超过了限购数")
      ) {
        if (args.jianlou) {
          console.error("\n😝", e.message, _n + "正在捡漏重试：" + args.title);
          await getNewestOrderData();
          await doJianlou("(变更)");
          return submit(retryCount);
        }
      }
      if (retryCount >= 1) {
        console.error("\n😝" + e.message + ":" + args.title);
        console.error(_n + `已经重试两次，放弃治疗：${args.title}`);
        throw e;
      }
      if (
        e.message.includes("对不起，系统繁忙，请稍候再试") ||
        e.message.includes("被挤爆")
      ) {
        if (args.jianlou) {
          console.log("\n😝", e.message, _n + "正在捡漏重试：" + args.title);
          await getNewestOrderData();
          await doJianlou("(挤爆)");
          return submit(retryCount + 1);
        }
      } else if (
        e.message === "当前访问页面失效，可能您停留时间过长，请重新提交申请"
      ) {
        console.error(e);
        return submitOrder(args, retryCount);
      } else if (
        e.message !== "活动火爆，名额陆续开放，建议后续关注！" &&
        !e.message.startsWith("您已经从购物车购买过此商品")
      ) {
        console.log("\n😝", e.message, "正在重试：" + args.title);
        // B-15034-01-01-001: 您已经从购物车购买过此商品，请勿重复下单
        // RGV587_ERROR: 哎哟喂,被挤爆啦,请稍后重试
        // F-10007-10-10-019: 对不起，系统繁忙，请稍候再试
        // FAIL_SYS_TOKEN_EXOIRED: 令牌过期
        // F-10003-11-16-001: 购买数量超过了限购数。可能是库存不足，也可能是人为限制。
        // FAIL_SYS_HSF_ASYNC_TIMEOUT: 抱歉，网络系统异常
        return submit(retryCount + 1);
      }
      throw e;
    }
  };
  function doJianlou(t = "") {
    return taskManager.registerTask(
      {
        name: "捡漏",
        platform: "taobao-mobile",
        comment: args.title,
        handler: handleOrderData,
        time: startTime + 1000 * 60 * args.jianlou!,
      },
      16,
      `\n🐱${_n}刷到库存了${t}---${args.title}`
    );
  }
  (async () => {
    try {
      postdata = transformOrderData(data1, args);
      logFile(postdata, "订单结算页提交的数据", ".json");
    } catch (e) {
      if (args.jianlou) {
        await doJianlou();
      } else {
        throw e;
      }
    }
    if (!config.isSubmitOrder) {
      return;
    }
    return submit();
  })();
  // return delay(70);
}

function getNextDataByGoodsInfo({ delivery, skuId, itemId }, quantity: number) {
  return {
    buyNow: true,
    exParams: JSON.stringify({
      addressId: delivery.areaSell === "true" ? delivery.addressId : undefined,
      buyFrom: "tmall_h5_detail",
    }),
    itemId,
    quantity,
    serviceId: null,
    skuId,
  };
}

export async function buyDirect(
  args: ArgBuyDirect,
  p?: Promise<void> & { id: number }
) {
  var data = await getGoodsInfo(args.url, args.skuId);
  if (p) {
    taskManager.setTitle(p.id, data.title);
    await p;
  } else if (!args.no_interaction) {
    if (!data.buyEnable) {
      throw new Error(data.msg || "不能购买");
    }
  }
  if (typeof args.expectedPrice === "number") {
    args.expectedPrice = Math.min(data.price, args.expectedPrice);
  }
  return submitOrder(
    Object.assign(args, {
      data: getNextDataByGoodsInfo(data, args.quantity),
      title: data.title,
    })
  );
}

export async function coudan(data: CoudanArg): Promise<any> {
  var ids = await Promise.all(
    data.urls.map((url, i) =>
      addCart({
        url,
        quantity: data.quantities[i],
      })
    )
  );
  var list = await getCartList();
  var datas: any[] = [];
  list.forEach(({ items }) => {
    items.forEach((item) => {
      if (ids.includes(item.id)) {
        datas.push(item);
      }
    });
  });
  return cartBuy({ items: datas, ...data });
}

export async function cartBuy(
  args: {
    items: any[];
    jianlou?: number;
    expectedPrice?: number;
    no_interaction?: boolean;
    addressId?: string;
    other: any;
  },
  p?: Promise<void>
) {
  if (p) {
    await p;
  }
  var items = args.items;
  delete args.items;

  if (!args.other) {
    args.other = {};
  }
  return submitOrder({
    data: {
      buyNow: "false",
      buyParam: items.map(({ settlement }) => settlement).join(","),
      spm: "a222m.7628550.0.0",
    },
    title: items.map(({ title }) => title).join("~"),
    ...args,
  });
}

// @ts-ignore
window.pay = pay;

function pay(url: string, pass: string) {
  if (url.startsWith("//")) {
    url = "https:" + url;
  }
  var code = `
    console.log("enter1")
    var $eles = document.querySelectorAll(".am-button.am-button-blue")
    if ($eles.length>1) {
      $eles[1].click();
    }
    console.log("enter2")
    var pass = '${pass}';
    // document.querySelector('.J-encryptpwd').val([...pass].map(c => encrypt(c)).join(','))
    var pwd = document.querySelector('.J-pwd')
    for(let i = 0; i < pass.length; i++) {
      pwd.value += pass[i];
      pwd.dispatchEvent(new Event("input"))
    }
  `;
  console.log(url, code);
  excutePageAction(url, {
    code,
    // autoclose: false
    close_delay: 3000,
    run_delay: 2000,
  });
}

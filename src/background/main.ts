import moment from "moment";
import * as R from "ramda";
// import "./externals/intercept";
import "./init";
import { taskManager } from "./common/task-manager";
import {
  config,
  set_config,
  get_config,
  get_accounts,
  accounts,
  set_accounts,
} from "./common/setting";
import { getRedirectedUrl } from "./common/request";
import tb from "./taobao";
import jd from "./jd";

import {
  getCouponCenterCoupon,
  getCouponCenterItems,
} from "./jd/coupon-center";
import { runJdTasks } from "./jd/task";
// import "./baidu";
import { HandlerWithAll } from "@/structs/api";
import { ifElse, propIs } from "ramda";

function wrappedDelay<TArgs = any, TReturn = any>({
  name,
  comment,
  handler,
}: {
  name: string;
  comment: string;
  handler(
    args: TArgs
  ): ((() => Promise<TReturn>) | TReturn) & {
    title?: string;
  };
}) {
  return async ({ t, ...restArgs }: any): Promise<TReturn> => {
    const f = await handler(restArgs);
    let id;
    if (t) {
      let time = moment(t).valueOf();
      let diff = time - Date.now();
      if (diff > 0) {
        const task = taskManager.registerTask(
          {
            name,
            time: t,
            platform: restArgs.platform,
            comment,
          },
          time
        );
        id = task.id;
        await task;
      }
    }
    if (typeof f === "function") {
      if (f.title && id) {
        taskManager.setTitle(id, f.title);
      }
      // @ts-ignore
      return f();
    }
    // @ts-ignore
    return f;
  };
}

// @ts-ignore
const qiangquan: HandlerWithAll["qiangquan"] = async function({
  data,
  t,
  platform,
}: {
  data: string;
  t?: string;
  platform: string;
}) {
  const handlers =
    platform === "jingdong" ? jd.couponHandlers : tb.couponHandlers;
  const handler = handlers.find((handler) => handler.test(data));
  if (handler) {
    return wrappedDelay({
      name: "抢券",
      comment: "",
      handler() {
        return (handler.page || handler.api)!(data);
      },
    })({ t });
  }
  return { url: data, success: true };
};

async function getConfig() {
  return get_config();
}

async function setConfig(_config) {
  if (JSON.stringify(_config) === JSON.stringify(config)) {
    return;
  }
  set_config(_config);
  if (_config.is_main) {
    jd.checkStatus();
  }
}

async function getAccounts() {
  return get_accounts();
}

async function setAccounts(_accounts) {
  if (JSON.stringify(_accounts) === JSON.stringify(accounts)) {
    return;
  }
  set_accounts(_accounts);
}

async function getTasks() {
  return R.map(
    (item: any) =>
      Object.assign(item, {
        time: moment(item.time).format(moment.HTML5_FMT.TIME),
      }),
    R.sort(
      (a, b) => moment(a.time).valueOf() - moment(b.time).valueOf(),
      taskManager.items
    )
  );
}

async function cancelTask({ id }: { id: number }) {
  return taskManager.cancelTask(id);
}
const isJd = (args) => {
  const platform = args.platform;
  delete args.platform;
  return platform === "jingdong";
};
const taobao = {
  resolveUrl: ifElse(
    isJd,
    R.compose(jd.resolveUrl, R.prop("data")),
    R.compose(tb.resolveUrl, R.prop("data"))
  ),
  qiangquan,
  buy(args) {
    return wrappedDelay({
      name: "抢单",
      comment: args._comment,
      handler: ifElse(isJd, jd.buyDirect, tb.buyDirect),
    })(args);
  },
  cartBuy(args) {
    return wrappedDelay({
      name: "从购物车抢单",
      comment: args._comment,
      handler: ifElse(isJd, jd.cartBuy, tb.cartBuy),
    })(args);
  },
  getConfig,
  setConfig,
  getAccounts,
  setAccounts,
  cartAdd: ifElse(isJd, jd.addCart, tb.addCart),
  cartList: ifElse(isJd, jd.getCartList, tb.getCartList),
  cartDel: ifElse(isJd, jd.cartDel, tb.cartDel),
  cartUpdateQuantity: ifElse(
    isJd,
    jd.cartUpdateQuantity,
    tb.cartUpdateQuantity
  ),
  cartUpdateSku: tb.cartUpdateSku,
  cartToggle: ifElse(isJd, jd.cartToggle, tb.cartToggle),
  coudan: ifElse(isJd, jd.coudan, tb.coudan),
  checkStatus: ifElse(isJd, jd.checkStatus, tb.checkStatus),
  sysTime: ifElse(isJd, jd.sysTime, tb.sysTime),
  goodsList: ifElse(isJd, jd.getGoodsList, tb.getGoodsList),
  goodsInfo: ifElse(isJd, jd.getGoodsInfo, tb.getGoodsInfo),
  getTasks,
  cancelTask,
  getAddresses: ifElse(isJd, jd.getAddresses, tb.getAddresses),
  getMyCoupons: ifElse(isJd, jd.getMyCoupons, tb.getMyCoupons),
  deleteCoupon: ifElse(isJd, jd.deleteCoupon, tb.deleteCoupon),
  getSeckillList: tb.seckillList,
  getJdMillionList: jd.getBillionList,
  getJdMillion: jd.getBillion,
  getUserName: tb.getUserName,
  getPlusQuanpinList: jd.getPlusQuanpinList,
  async getPlusQuanpin(item) {
    if (item.datetime) {
      let t = moment(item.datetime);
      await taskManager.registerTask(
        {
          name: "抢券",
          platform: "jingdong",
          comment: "京东plus券",
          time: t.valueOf(),
        },
        t.valueOf()
      );
    }
    return jd.getPlusQuanpin(item);
  },
  logout: ifElse(isJd, jd.logout, tb.logout),
  getRedirectedUrl,
  getCouponCenterItems,
  getCouponCenterCoupon,
  getCommentList: tb.getCommentList,
  getGoodsSkus: tb.getGoodsSkus,
  getGoodsPromotions: tb.getGoodsPromotions,
  applyCoupon: tb.applyCoupon,
  getOrderRecords: tb.getOrderRecords,
  deleteOrderRecords: tb.deleteOrderRecords,
  relayOrderRecords: tb.relayOrderRecords,
};

// @ts-ignore
window.taobao = taobao;

taobao.checkStatus("taobao");
if (config.is_main) {
  taobao.checkStatus("jingdong");
  if (accounts.jingdong.password) {
    runJdTasks();
  }
}

chrome.runtime.onMessageExternal.addListener(function(
  { name, args },
  sender,
  sendResponse
) {
  taobao[name](...args)
    .then((res) =>
      sendResponse({
        success: true,
        data: res,
      })
    )
    .catch((err) =>
      sendResponse({
        success: false,
        err,
      })
    );
});
// @ts-ignore
window.executeScript = (fn: string | Function, ...args: any[]) => {
  const code = typeof fn === "function" ? fn.toString() : fn;
  return eval(
    `(${code})(${args.map((item) => JSON.stringify(item)).join(",")})`
  );
};

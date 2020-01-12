import moment from "moment";
import * as R from "ramda";
// import "./externals/intercept";
import {
  buyDirect as taobao_buyDirect,
  cartBuy as taobao_cartBuy,
  coudan
} from "./taobao/order";
import {
  getCartList as taobao_getCartList,
  addCart as taobao_add_cart,
  updateCart
} from "./taobao/cart";
import { resolveUrl as taobao_resolve_url, getUserName } from "./taobao/tools";
import {
  addCart as jd_add_cart,
  getCartList as jd_getCartList
} from "./jd/cart";
import {
  getGoodsDetail as jd_getGoodsDetail,
  getGoodsList as taobao_getGoodsList
} from "./taobao/goods";
import {
  checkStatus as taobao_check_status,
  getAddresses,
  getMyCoupons as taobao_getMyCoupons,
  logout
} from "./taobao/member";
import { checkStatus as jd_check_status } from "./jd/member";
import { handlers as taobao_coupons_handlers } from "./taobao/coupon";
import "./init";
import { taskManager } from "./common/task-manager";
import {
  config,
  set_config,
  get_config,
  get_accounts,
  accounts,
  set_accounts
} from "./common/setting";
import { sysTaobaoTime } from "./common/time";
import { resolveUrl as jd_resolve_url } from "./jd/tools";
import { handlers as jd_coupons_handlers } from "./jd/coupon";
import { getGoodsList as jd_getGoodsList } from "./jd/goods";
import { getMyCoupons as jd_getMyCoupons } from "./jd/member";
import { seckillList } from "./taobao/seckill";
import { getBillionList, getBillion } from "./jd/billion";
import { getPlusQuanpin, getPlusQuanpinList } from "./jd/plus";
import { getRedirectedUrl } from "./common/request";
import { buyDirect as jd_buyDirect, cartBuy as jd_cartBuy } from "./jd/order";

import "./jd/task";

async function qiangquan({
  data,
  t,
  platform
}: {
  data: string;
  t?: string;
  platform: string;
}) {
  var handlers =
    platform === "jingdong" ? jd_coupons_handlers : taobao_coupons_handlers;

  for (let handler of handlers) {
    if (handler.test(data)) {
      let h = (handler.page || handler.api)!;
      if (t) {
        let time = moment(t).valueOf();
        let diff = time - Date.now();
        if (diff > 0) {
          let p = taskManager.registerTask(
            {
              name: "抢券",
              time: t,
              platform,
              comment: ""
            },
            time
          );
          await p;
          return h(data);
        }
      }
      return h(data);
    }
  }
  return { url: data };
}

async function buy(args: any, t: string, platform: string) {
  var handler = platform === "jingdong" ? jd_buyDirect : taobao_buyDirect;
  if (t) {
    let time = moment(t).valueOf();
    let diff = time - Date.now();
    if (diff > 0) {
      let p = taskManager.registerTask(
        {
          name: "抢单",
          time: t,
          platform,
          comment: args._comment
        },
        time
      );
      handler(args, p);
      return;
    }
  }
  return handler(args);
}

async function buy_from_cart(args: any, t: string, platform: string) {
  var handler = platform === "jingdong" ? jd_cartBuy : taobao_cartBuy;
  if (t) {
    let time = moment(t).valueOf();
    let diff = time - Date.now();
    if (diff > 0) {
      let p = taskManager.registerTask(
        {
          name: "抢单",
          time: t,
          platform: "taobao",
          comment: args._comment
        },
        time
      );
      handler(args, p);
      return;
    }
  }
  return handler(args);
}

async function getConfig() {
  return get_config();
}

async function setConfig(_config) {
  if (JSON.stringify(_config) === JSON.stringify(config)) {
    return;
  }
  set_config(_config);
  if (_config.is_main) {
    jd_check_status();
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

function cartDel(data) {
  return updateCart(data, "deleteSome");
}

function cartUpdateQuantity(data) {
  return updateCart(data, "update");
}

async function getTasks() {
  return R.map(
    (item: any) =>
      Object.assign(item, {
        time: moment(item.time).format(moment.HTML5_FMT.TIME)
      }),
    R.sort(
      (a, b) => moment(a.time).valueOf() - moment(b.time).valueOf(),
      taskManager.items
    )
  );
}

async function cancelTask(id: number) {
  return taskManager.cancelTask(id);
}

const taobao = {
  resolveUrl(url: string, platform: string) {
    if (platform === "jingdong") {
      return jd_resolve_url(url);
    }
    return taobao_resolve_url(url);
  },
  qiangquan,
  buy,
  cartBuy: buy_from_cart,
  // getCartList: taobao_getCartList,
  getConfig,
  setConfig,
  getAccounts,
  setAccounts,
  cartAdd(args, platform: string) {
    if (platform === "jingdong") {
      return jd_add_cart(args);
    }
    return taobao_add_cart(args);
  },
  async cartList(platform: string) {
    if (platform === "jingdong") {
      return jd_getCartList();
    }
    return {
      items: await taobao_getCartList()
    };
  },
  cartDel,
  cartUpdateQuantity,
  async cartToggle() {},
  coudan,
  async checkStatus(platform: string) {
    if (platform === "jingdong") {
      return jd_check_status();
    }
    return taobao_check_status();
  },
  sysTime: sysTaobaoTime,
  goodsList(data, platform: string) {
    if (platform === "taobao") {
      return taobao_getGoodsList(data);
    }
    return jd_getGoodsList(data);
  },
  goodsDetail({ url }, platform: string) {
    if (platform === "taobao") {
      return jd_getGoodsDetail(url);
    }
  },
  getTasks,
  cancelTask,
  getAddresses,
  getMyCoupons(arg, platform: string) {
    if (platform === "taobao") {
      return taobao_getMyCoupons(arg);
    }
    return jd_getMyCoupons();
  },
  getSeckillList(args) {
    return seckillList(args.url);
  },
  getJdMillionList: getBillionList,
  getJdMillion: getBillion,
  getUserName,
  getPlusQuanpinList,
  async getPlusQuanpin(item) {
    if (item.datetime) {
      let t = moment(item.datetime);
      await taskManager.registerTask(
        {
          name: "抢券",
          platform: "jingdong",
          comment: "京东plus券",
          time: t.valueOf()
        },
        t.valueOf()
      );
    }
    return getPlusQuanpin(item);
  },
  logout,
  getRedirectedUrl
};

// @ts-ignore
window.taobao = taobao;

taobao.checkStatus("taobao");
if (config.is_main) {
  taobao.checkStatus("jingdong");
}

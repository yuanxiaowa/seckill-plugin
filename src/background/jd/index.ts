import { handlers } from "./coupon";
import { resolveUrl } from "./tools";
import { buyDirect, cartBuy, coudan } from "./order";
import { getGoodsList } from "./goods";
import { getCartList, addCart } from "./cart";
import { checkStatus, getMyCoupons, deleteCoupon } from "./member";
import { getBillion, getBillionList } from "./billion";
import { getPlusQuanpin, getPlusQuanpinList } from "./plus";
import { getSysTime } from "../common/time";

export default {
  resolveUrl: resolveUrl,
  getCommentList() {},
  couponHandlers: handlers,
  buyDirect: buyDirect,
  comment() {},
  getGoodsList: getGoodsList,
  getGoodsSkus() {},
  cartBuy: cartBuy,
  coudan: coudan,
  getCartList: getCartList,
  addCart: addCart,
  cartToggle() {},
  cartDel(args) {},
  cartUpdateQuantity(args) {},
  getUserName() {},
  getGoodsDetail() {},
  checkStatus: checkStatus,
  getAddresses() {},
  getMyCoupons: getMyCoupons,
  deleteCoupon: deleteCoupon,
  logout() {},
  getBillionList: getBillionList,
  getBillion: getBillion,
  getPlusQuanpin: getPlusQuanpin,
  getPlusQuanpinList: getPlusQuanpinList,
  sysTime: getSysTime(
    "https://a.jd.com//ajax/queryServerData.html",
    ({ serverTime }) => serverTime
  ),
};

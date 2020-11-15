import { handlers } from "./coupon";
import { resolveUrl } from "./tools";
import { buyDirect, cartBuy, coudan } from "./order";
import { getGoodsList } from "./goods";
import {
  getCartList,
  addCart,
  updateCartQuantity,
  delCart,
  toggleCartChecked,
} from "./cart";
import { checkStatus, getMyCoupons, deleteCoupon } from "./member";
import { getBillion, getBillionList } from "./billion";
import { getPlusQuanpin, getPlusQuanpinList } from "./plus";
import { getSysTime } from "../common/time";

export default {
  resolveUrl,
  getCommentList() {},
  couponHandlers: handlers,
  buyDirect,
  comment() {},
  getGoodsList,
  getGoodsSkus() {},
  cartBuy,
  coudan,
  getCartList,
  addCart: addCart,
  cartToggle: toggleCartChecked,
  cartDel: delCart,
  cartUpdateQuantity: updateCartQuantity,
  getUserName() {},
  getGoodsInfo() {},
  checkStatus,
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

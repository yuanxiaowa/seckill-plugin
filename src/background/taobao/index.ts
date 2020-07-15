import { getCommentList, comment } from "./comment";
import { resolveUrl, getUserName } from "./tools";
import { handlers } from "./coupon";
import { buyDirect, cartBuy, coudan } from "./order";
import { getGoodsSkus, getGoodsDetail } from "./goods";
import { getCartList, addCart, updateCart } from "./cart";
import {
  deleteCoupon,
  getMyCoupons,
  getAddresses,
  checkStatus,
  logout,
} from "./member";
import { getGoodsList } from "./search";
import { seckillList } from "./seckill";
import { getSysTime } from "../common/time";

export default {
  resolveUrl,
  getCommentList,
  couponHandlers: handlers,
  buyDirect,
  comment,
  getGoodsList,
  getGoodsSkus,
  cartBuy,
  coudan,
  getCartList,
  addCart,
  cartToggle() {},
  cartDel(args) {
    updateCart(args, "deleteSome");
  },
  cartUpdateQuantity(args) {
    updateCart(args, "update");
  },
  getUserName,
  getGoodsDetail,
  checkStatus,
  getAddresses,
  getMyCoupons,
  deleteCoupon,
  logout,
  seckillList({ url }) {
    return seckillList(url);
  },
  sysTime: getSysTime(
    "https://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp",
    ({ data: { t } }) => t
  ),
};

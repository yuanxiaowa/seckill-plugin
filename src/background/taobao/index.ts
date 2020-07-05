import { getCommentList, comment } from "./comment";
import { resolveUrl } from "./tools";
import { handlers } from "./coupon";
import { buyDirect } from "./order";
import { getGoodsSkus } from "./goods";

export default {
  resolveUrl,
  getCommentList,
  couponHandlers: handlers,
  buyDirect,
  comment,
  getGoodsSkus,
};

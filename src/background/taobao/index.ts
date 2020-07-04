import { getCommentList, comment } from "./comment";
import { resolveUrl } from "./tools";
import { handlers } from "./coupon";
import { buyDirect } from "./order";

export default {
  resolveUrl,
  getCommentList,
  couponHandlers: handlers,
  buyDirect,
  comment,
};

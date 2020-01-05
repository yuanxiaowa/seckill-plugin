import { request } from "../common/request";
import { getCookie } from "./tools";

const referer = "https://plus.m.jd.com/coupon/index";
/**
 * 获取plus全品券
 */
export async function getPlusQuanpinList(): Promise<
  {
    batchId: string;
    couponKey: string;
    discount: number;
  }[]
> {
  var {
    rs: { wholeCategoryCoupon }
  } = await request.get(
    "https://rsp.jd.com/coupon/dayCouponList/v1/?lt=m&an=plus.mobile&couponType=0_1&_=1578211295651",
    {
      referer
    }
  );
  return wholeCategoryCoupon;
}

/**
 * 领取plus全品
 * @param item
 */
export async function getPlusQuanpin(item: any) {
  return request.get("https://rsp.jd.com/coupon/receiveDayCoupon/v1", {
    qs: {
      lt: "m",
      an: "plus.mobile",
      getType: item.couponType,
      couponKey: "",
      discount: item.discount,
      platform: 3,
      eventId: "MPlusCoupon_Get",
      locationCode: 10002,
      eid: await getCookie("3AB9D23F7A4B3C9B"),
      fp: "d9db7529aa9e406e277ced0539b2d89f",
      activityId: item.activtyId,
      _: Date.now()
    },
    referer
  });
}

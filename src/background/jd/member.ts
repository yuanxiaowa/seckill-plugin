import { request } from "../common/request";

export async function getMyCoupons() {
  var text = await request.get(
    "https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=3&wxadd=1&_=1566400385806&sceneval=2&g_login_type=1&callback=queryjdcouponcb3&g_ty=ls",
    {
      referer:
        "https://wqs.jd.com/my/coupon/index.shtml?ptag=7155.1.18&sceneval=2"
    }
  );
  var text2 = /\(([\s\S]*)\);/.exec(text)![1];
  var {
    coupon: { useable }
  } = JSON.parse(text2);
  return useable.map(item =>
    Object.assign(
      {
        title: item.couponTitle,
        params: {
          couponbatch: item.batchid,
          ptag: "37070.3.11",
          coupon_shopid: item.shopId
        }
      },
      item
    )
  );
}

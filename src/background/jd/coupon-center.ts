import { request } from "../common/request";
import { flatten } from "ramda";
import { taskManager } from "../common/task-manager";
import moment from "moment";

const coupon_center_url =
  "https://coupon.m.jd.com/center/getCouponCenter.action?ad_od=0";

export async function getCouponCenterItems() {
  var html = await request.get(coupon_center_url);
  var text = /var _roundCoupon = (.*\})/.exec(html)![1];
  var {
    result: { groupActInfo }
  } = JSON.parse(text);
  var now = Date.now();
  return flatten(
    groupActInfo
      // .filter(item => item.roundTimeSeconds >= now)
      .map(({ roundActs, roundTimeSeconds, roundTime }) => {
        var t = roundTimeSeconds * 1000;
        return roundActs
          .filter(item => item.couponStatus === 0)
          .map(item => {
            let arr = /([\d.]+)/.exec(item.quotaString);
            let quota = 0;
            if (arr) {
              quota = Number(arr[1]);
            }
            return Object.assign(item, {
              title: item.limitStr,
              quota,
              discount: Number(item.denoString),
              t,
              tStr: moment(t).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)
            });
          });
      })
  );
}

export async function getCouponCenterCoupon(item) {
  await taskManager.registerTask(
    {
      name: "抢券",
      platform: "jingdong",
      time: item.t,
      comment: "领券中心抢券"
    },
    item.t
  );
  var ret = await request.get(
    "https://s.m.jd.com/activemcenter/mcouponcenter/receivecoupon",
    {
      qs: {
        coupon: `${item.ckeyActId},${item.ckey}`,
        batchid: item.batchId,
        _: Date.now(),
        sceneval: 2,
        g_login_type: 1,
        callback: "jsonpCBKD",
        g_ty: "ls"
      },
      referer: coupon_center_url
    }
  );
  console.log(ret);
}

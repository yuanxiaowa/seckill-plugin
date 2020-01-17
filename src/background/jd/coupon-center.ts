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
  var items = flatten(
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
  var t = 0;
  for (let i of [10, 14, 18, 22]) {
    let d = moment(i, "HH").valueOf();
    if (d > Date.now()) {
      t = d;
      break;
    }
  }
  if (t === 0) {
    t = moment(0, "HH").valueOf();
  }
  items.unshift({
    title: "全品类券",
    quota: 100,
    discount: 30,
    t,
    tStr: moment(t).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS)
  });
  return items;
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
  var ret;
  if (item.title === "全品类券") {
    ret = await request.form(
      "https://api.m.jd.com/client.action?functionId=newReceiveRvcCoupon&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=ea8683e82e32666b8ecd789b2fc7933f&st=1579068001125&sign=bf7dacc553fc78c1bf3e9ddcae1da522&sv=101",
      {
        body: JSON.stringify({
          childActivityUrl:
            'openapp.jdmobile://virtual?params={"category":"jump","des":"couponCenter"}',
          eid:
            "I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ",
          extend:
            "0271DFD6890D3B60ACB8BA8A9E49BEB17FE8E6323A36834B63FE69E95D38088E5E6BC390040B149A36073440BB0F65357F8CA0711A5D39BEF962DED99FF4BF2F7930479CE07BD526F1F06368513674DAFE62BCCADA468D6308DEE97A46911D09",
          pageClickKey: "Coupons_GetCenter",
          rcType: "1",
          shshshfpb:
            "vxtFkPoM2PysJxl34LQJfsF1r5oMV18Ez3nEOa9KBKp4XdOQNg4GGFUa3Cm9+eFKtLhbvmfuBNgmi7b7KDf5U1Q==",
          source: "couponCenter_app"
        })
      }
    );
  } else {
    ret = await request.get(
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
  }
  console.log(ret);
}

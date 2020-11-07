import { delay } from "../common/tool";
import { request } from "../common/request";
import { createScheduler } from "../common/scheduler";
import { requestData, getBaseData, getCookie } from "./tools";
import { getGoodsUrl, getGoodsInfo } from "./goods";
import moment from "moment";
import { flatten } from "ramda";
import { DT } from "../common/setting";
import { taskManager } from "../common/task-manager";

const executer = createScheduler(3000);

export function goGetCookie(url: string) {
  return request.get("https://wq.jd.com/mlogin/mpage/Login", {
    qs: {
      rurl: url,
    },
  });
}

/**
 * 查询楼层优惠券
 * @param url
 * @example https://wqs.jd.com/event/promote/game11/index.shtml?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=3f8d9f58aed14a30a581d169f573ced2
 * @example https://wqs.jd.com/event/promote/zdm18/index.shtml?cu=true&sid=b3234f60d61e8b4e3b5a8e703c321b0w&un_area=19_1601_50258_50374&_ts=1557200825024&ad_od=share&scpos=#st=6455&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=c842a3cb81d948899b818c0602bd9b8d
 * @example https://wq.jd.com/webportal/event/25842?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1001480949_&utm_term=fd39ee31c9ee43e1b1b9a8d446c74bf3&scpos=#st=0
 */
export async function queryFloorCoupons(url: string) {
  let html: string = await request.get(url);
  let text = /window\._componentConfig=(.*);/.exec(html)![1];
  let items: {
    name: string;
    data: {
      list: {
        key: string;
        gate: string;
        price: string;
        // 1
        type: number;
        level: string;
        name: string;
        // 0:可领 1:已领 2:已领光
        status: string | number;
        begin: string;
        end: string;
      }[];
      extend: {
        active: {
          key: string;
          level: string;
        }[];
      };
    };
  }[] = JSON.parse(text);
  let coupon_items = items.filter(
    ({ name }) => name === "coupon" || name === "userbenefit"
  );
  // 校验状态，暂时不需要
  // https://wq.jd.com/active/querybingo?callback=cb_quan_daogou06A&active=daogou06&g_tk=1461522350&g_ty=ls
  // Referer: https://wqs.jd.com/event/promote/game11/index.shtml
  let now = Date.now();
  return coupon_items
    .map(({ data, name }) => {
      if (name === "coupon") {
        return data.list.filter(
          ({ begin, end, status }) =>
            now >= new Date(begin).getTime() &&
            now < new Date(end).getTime() &&
            (typeof status === "undefined" || status === 0)
        );
      }
      return data.extend.active;
    })
    .filter((items) => items.length > 0);
}

export async function obtainFloorCoupon(data: { key: string; level: string }) {
  /* let g_pt_tk: any = getCookie("pt_key") || undefined;
  if (g_pt_tk) {
    g_pt_tk = time33(g_pt_tk);
  } */
  var result = await request.get("https://wq.jd.com/active/active_draw", {
    qs: {
      active: data.key,
      level: data.level,
      _: Date.now(),
      g_login_type: "0",
      callback: "jsonpCBKE",
      // g_tk: time33(getCookie("wq_skey")),
      // g_pt_tk,
      g_ty: "ls",
    },
    referer: "https://wqs.jd.com/event/promote/mobile8/index.shtml",
    type: "jsonp",
  });
  /* try{ jsonpCBKA(
{
   "active" : "daogou06",
   "award" : {
      "awardcode" : "",
      "awardmsg" : "",
      "awardret" : 2
   },
   "bingo" : {
      "bingolevel" : 0,
      "bingomsg" : "",
      "bingoret" : 2
   },
   "ret" : 2,
   "retmsg" : "未登录"
}
);}catch(e){} */
  // "retmsg" : "您参与得太频繁了，请稍后再试"
  if (result.ret === 145) {
    await delay(1000);
    return obtainFloorCoupon(data);
  }
  return result;
}

export async function getFloorCoupons(url: string) {
  await goGetCookie(url);
  var items = await queryFloorCoupons(url);
  return {
    success: true,
    res: Promise.all(
      items.map((_items) =>
        Promise.all(
          _items.map((item) =>
            executer(() =>
              obtainFloorCoupon({
                key: item.key,
                level: item.level,
              })
            )
          )
        )
      )
    ),
  };
}
/**
 * 领取内部优惠券
 * @param url
 * @example https://jingfen.jd.com/item.html?sku=46004095519&q=FXYTFBFuGHUWFRxfEHYQFRVsQCNGExRpFXQVFhxoE3cTFkZtESEUQBY/FiUiFhRrEHkaExFfVyVNQEAsfgZzBxI8GXAWE0M8FXQbExE/QyEbFR1pESUSRxE/EHIaFRJtIHERFxVvFnUQEQ==&d=9GSoGc&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1001480949_&utm_term=ba3d0b36811c4075bece3cc17c6a3e56
 */
export async function getJingfen(url: string) {
  var { searchParams } = new URL(url);
  var sku = searchParams.get("sku")!;
  var q = searchParams.get("q");
  /* var { status }:{
    // 0:可领取 1:领取限制
    status: number
    // 1:优惠券
    couponType: number
  } = await requestData(
    {
      sku,
      q,
      eid: "-1",
      fp: "-1",
      shshshfp: "-1",
      shshshfpa: "-1",
      shshshfpb: "-1",
      referUrl: url,
      childActivityUrl: url,
      pageClickKey: "MJDAlliance_CheckDetail"
    },
    {
      functionId: "skuWithCoupon"
    }
  );
  var success = status === 0 */
  var success = true;
  var msg = "";
  try {
    await requestData(
      {
        sku,
        q,
        wxtoken: "",
        shshshfp: getCookie("shshshfp"),
        shshshfpa: getCookie("shshshfpa"),
        shshshfpb: getCookie("shshshfpb"),
        referUrl: url,
        childActivityUrl: url,
        pageClickKey: "MJDAlliance_CheckDetail",
        ...getBaseData(),
      },
      {
        functionId: "jingfenCoupon",
      }
    );
  } catch (e) {
    msg = e.message;
    success = msg === "您今天已经参加过此活动，别太贪心哟，明天再来~";
  }
  return {
    success,
    url: getGoodsUrl(sku),
    msg,
  };
}

export async function queryGoodsCoupon(data: {
  skuId: string;
  vid: number;
  cid: string;
}) {
  var { coupons, use_coupons } = await request.post<{
    coupons: T[];
    use_coupons: {
      id: number;
      type: number;
      quota: string;
      parValue: string;
      // 0：不展示 1：展示
      couponKind: number;
      name: string;
    }[];
  }>(`https://wq.jd.com/mjgj/fans/queryusegetcoupon`, undefined, {
    qs: {
      callback: "getCouponListCBA",
      platform: 3,
      cid: data.cid,
      sku: data.skuId,
      popId: data.vid,
      t: Math.random(),
      // g_tk: time33(getCookie("wq_skey")),
      g_ty: "ls",
    },
    type: "jsonp",
  });
  interface T {
    key: string;
    roleId: number;
    owned?: boolean;
    name: string;
    // 0:满减 1:打折
    couponType: number;
    discount: number;
    quota: number;
    discountdesc: {
      // 最高减多少
      high: string;
      info: {
        // 满多少减
        quota: string;
        // 多少折
        discount: string;
      }[];
    };
  }
  return <T[]>[
    ...coupons,
    ...use_coupons
      .filter((item) => item.type === 1)
      .map((item) => ({
        owned: true,
        name: item.name,
        id: item.id,
        quota: +item.quota,
        discount: +item.parValue,
        couponType: item.type,
      })),
  ];
}

export async function obtainGoodsCoupon(data: { roleId: number; key: string }) {
  var res = await request.get<{
    batchid: string;
    code: number;
    couponid: string;
    message: string;
  }>(`https://wq.jd.com/activeapi/obtainjdshopfreecouponv2`, {
    qs: {
      sceneval: "2",
      callback: "ObtainJdShopFreeCouponCallBackA",
      scene: "2",
      key: data.key,
      roleid: data.roleId,
      t: Math.random(),
      // g_tk: time33(getCookie("wq_skey")),
      g_ty: "ls",
    },
    referer: "https://item.m.jd.com/product/36850022644.html",
  });
  return res;
}

export async function getGoodsCoupons(skuId: string) {
  var { item } = await getGoodsInfo(skuId);
  var coupons = await queryGoodsCoupon({
    skuId,
    vid: item.venderID,
    cid: item.category[item.category.length - 1],
  });
  var data = await Promise.all(
    coupons
      .filter((item) => !item.owned)
      .map((item) =>
        executer(() =>
          obtainGoodsCoupon({
            roleId: item.roleId!,
            key: item.key,
          })
        )
      )
  );
  return {
    success: true,
    res: data,
    url: `https://item.jd.com/${skuId}.html`,
  };
}
/**
 * 领取全品券
 * @param url
 * @param phone
 * @example https://h5.m.jd.com/dev/2tvoNZVsTZ9R1aF1T4fDthhd6bm1/index.html?type=out_station&id=f128d673441d4afa9fa52b2f61818591&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=d88e8a25670040f38f3d0dfc8f9542b9
 */
export async function getQuanpinCoupon(url: string, phone = "18605126843") {
  var { searchParams } = new URL(url);
  var data = await requestData(
    {
      actId: searchParams.get("id"),
      phone,
      code: "",
      country: "cn",
      platform: "3",
      pageClickKey: "-1",
      userArea: "",
      ...getBaseData(),
    },
    {
      functionId: "activityLongPage",
      api: "",
    }
  );
  let {
    returnStatus,
    status: { minorTitle, activityUrl },
  }: {
    // 1:已抢光 3:没领到
    returnStatus: number;
    status: {
      minorTitle: string;
      activityUrl: string;
    };
  } = data;
  // logFile(data, "手机号领取全品券");
  return {
    success: returnStatus !== 1 && returnStatus !== 3,
    url: activityUrl,
    msg: minorTitle,
  };
}

/**
 *
 * @param url
 * @example https://h5.m.jd.com/babelDiy/Zeus/qYwUMpSiiovLbsS5Lw4XNf8u58r/index.html?lng=104.758990&cu=true&un_area=12_911_914_51563&sid=e14edc99d2ab2581774bbbd84f47296w&_ts=1564765855849&utm_user=plusmember&ad_od=share&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=f693db4b94cd4620afcb394dcff92bdf
 */
export async function getCouponZeus(url: string) {
  // var { searchParams } = new URL(url);
  var { bankCoupons, normalCoupons } = await requestData(
    {
      activityId: "00461561",
      pageId: "1044474",
      qryParam: JSON.stringify([
        {
          type: "advertGroup",
          id: "03590654",
          mapTo: "normalCoupons",
          next: [
            {
              type: "plusCoupon",
              subType: "material",
              mapKey: "comment[0]",
              mapTo: "cate",
            },
          ],
        },
        {
          type: "advertGroup",
          id: "03592688",
          mapTo: "bankCoupons",
          next: [{ type: "jrCoupon", mapKey: "extension.key", mapTo: "cate" }],
        },
        {
          type: "productGroup",
          id: "09963245",
          mapTo: "giftskus",
          diversityFilter: "1,5,9,13,17",
          dupliRemovalFlag: 1,
        },
        { type: "advertGroup", id: "03602534", mapTo: "loveListDataGirl" },
        { type: "advertGroup", id: "03602977", mapTo: "loveListDataBoy" },
        { type: "advertGroup", id: "03607171", mapTo: "loveListDataSingle" },
        { type: "advertGroup", id: "03603919", mapTo: "rankTab" },
        {
          type: "productGroup",
          id: "09965963",
          mapTo: "more",
          diversityFilter: "1,5,9,13,17",
        },
      ]),
    },
    {
      functionId: "qryCompositeMaterials",
      api: "client.action",
    }
  );
  return Promise.all(
    bankCoupons.list.concat(normalCoupons.list).map((item) =>
      executer(() =>
        requestData(
          {
            scene: 3,
            actKey: item.link,
            activityId: /Zeus\/(\w+)/.exec(url)![1],
          },
          {
            functionId: "newBabelAwardCollection",
            api: "client.action",
          }
        )
      )
    )
  );
}

export async function getShopCoupons(url: string) {
  var html: string = await request.get(url);
  var text = /window.SHOP_COUPONS\s*=\s*(\[[\s\S]*?\])\s*;/.exec(html)![1];
  var now = Date.now();
  var coupons: any[] = JSON.parse(text).filter(
    (item) =>
      moment(item.beginTime, "yyyy.MM.DD").valueOf() <= now &&
      now < moment(item.endTime, "yyyy.MM.DD").valueOf()
  );
  var urls: string[] =
    html.match(
      /https?:\/\/coupon\.m\.jd\.com\/coupons\/show\.action\?[^"']+/g
    ) || [];
  return { urls, coupons };
}
/**
 * 领取单张优惠券
 * @param url
 * @example https://coupon.m.jd.com/coupons/show.action?key=95f6d76c6af84f61b6431c128938a9a6&roleId=20962745&to=https://pro.m.jd.com/mall/active/VfaRyNj2vtwfoWgUEFoqGzF4B1Z/index.html&sceneval=2&time=1563640816871
 */
export async function getCouponSingle(url: string, other?: any) {
  var { searchParams } = new URL(url);
  var { ret, errmsg, rvc } = await request.get(
    "https://s.m.jd.com/activemcenter/mfreecoupon/getcoupon",
    {
      qs: Object.assign(
        {
          key: searchParams.get("key"),
          roleId: searchParams.get("roleId"),
          to: searchParams.get("to"),
          verifycode: "",
          verifysession: "",
          _: Date.now(),
          sceneval: searchParams.get("sceneval"),
          g_login_type: "1",
          callback: "jsonpCBKA",
          g_ty: "ls",
        },
        other
      ),
      referer: url,
      type: "jsonp",
    }
  );
  var success = ret === 0 || ret === 999;
  if (rvc) {
    let { rvc_content, rvc_uuid } = rvc;
    let img_url = "https:" + rvc_content;
    return getCouponSingle(url, {
      verifycode: "",
      verifysession: rvc_uuid,
    });
  }
  // 145:提交频繁 16:已抢完
  return {
    success,
    msg: errmsg,
  };
}

/**
 * 查询活动主题优惠券
 * @param url
 * @example https://pro.m.jd.com/mall/active/4FziapEprFVTPwjVx19WRDMTbbbF/index.html?utm_source=pdappwakeupup_20170001&utm_user=plusmember&ad_od=share&utm_source=androidapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=CopyURL
 * @example https://pro.m.jd.com/mall/active/4BgbZ97pC8BvPgCDDTvPaSTYWaME/index.html?cu=true&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1001480949_&utm_term=db75fe82545e4f18aaee199a2831c0fa
 * @example https://pro.m.jd.com/mall/active/4M3v49dheo7VXKXnQ8Y7yT99QGmo/index.html?cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=caf8ffe18b8a416e9d9a3c22e01c83f1
 */
export async function queryActivityCoupons(url: string) {
  let html: string = await request.get(url);
  let arr = /window.(dataHub\d+|__react_data__)\s*=(.*)/.exec(html)!;
  let key = arr[1];
  arr[2] = arr[2].trim();
  if (arr[2].endsWith(";")) {
    arr[2] = arr[2].substring(0, arr[2].length - 1);
  }
  let data = JSON.parse(arr[2]);
  if (key === "__react_data__") {
    let _data = data.activityData.floorList;
    if (!_data) {
      data = data.pageData.floorList;
    } else {
      data = _data;
    }
  }
  let activityId = /active\/(\w+)/.exec(url)![1];
  let directCoupons = arr[2].match(/\/\/(jrmkt|btmkt)\.jd\.com\/[^"]+/g) || [];
  directCoupons = directCoupons.map((url) => `https:${url}`);

  let simpleCoupons =
    html.match(/\/\/coupon\.m\.jd\.com\/coupons\/show\.action\?[^"']+/g) || [];
  simpleCoupons = simpleCoupons.map((item) => `https:` + item);
  let items: {
    cpId: string;
    args: string;
    srv: string;
    jsonSrv: string;
    // 0:满减 2:白条
    // 0:可领 1:已领取 3:今日已领取 4:今日已抢完 8:下一场
    status: string;
    // 1
    scene: string;
    beginPeriod?: string;
    endPeriod?: string;
    scope: string;
    limit: string;
    discount: string;
    skuName: string;
  }[] = flatten<any>(
    Object.keys(data)
      .filter((key) => data[key].couponList)
      .map((key) =>
        data[key].couponList
          .filter(
            ({ status }) =>
              typeof status === "undefined" ||
              status === "0" ||
              status === "5" ||
              status === "8"
          )
          .map((item) => {
            var dp = Number(item.discount);
            var limit;
            var discount;
            if (item.limit) {
              limit = Number(/\d+/.exec(item.limit)![0]);
              discount = Number(item.discount);
              dp = limit - discount;
              if (limit > 0 && discount > 0) {
                if (limit / discount < 0.1) {
                  return;
                }
              }
            }
            var data = Object.assign(item, {
              activityId,
              actKey: item.cpId,
              dp,
            });
            return data;
          })
          .filter(Boolean)
      )
  ).sort((keyA, keyB) => {
    return keyA.dp - keyB.dp;
  });
  return {
    items,
    directCoupons,
    simpleCoupons,
  };
}

export async function obtainActivityCoupon(data: {
  activityId: string;
  args: string;
  scene: string;
  childActivityUrl: string;
  actKey: string;
  discount: string;
  limit: string;
  skuName: string;
}) {
  var ret: string = await request.post(
    `https://api.m.jd.com/client.action?functionId=newBabelAwardCollection`,
    {
      body: JSON.stringify({
        actKey: data.actKey,
        activityId: data.activityId,
        from: "H5node",
        scene: data.scene,
        args: data.args,
        platform: "3",
        orgType: "2",
        openId: "-1",
        pageClickKey: "Babel_Coupon",
        shshshfp: getCookie("shshshfp"),
        shshshfpa: getCookie("shshshfpa"),
        shshshfpb: getCookie("shshshfpb"),
        childActivityUrl: data.childActivityUrl,
        mitemAddrId: "",
        geo: { lng: "", lat: "" },
        addressId: "",
        posLng: "",
        posLat: "",
        focus: "",
        innerAnchor: "",
        ...getBaseData(),
      }),
      client: "wh5",
      clientVersion: "1.0.0",
      sid: "",
      uuid: "15617018266251592388825",
      area: "",
    },
    {
      dataType: "form",
    }
  );
  var resData = JSON.parse(ret);
  // A7:您来早了，活动还没开始哟，请稍后再来~
  // D2:本时段优惠券已抢完，请10:00再来吧！
  // A1:领取成功！感谢您的参与，祝您购物愉快~
  // A15:此券已经被抢完了，下次记得早点来哟~
  // A39:很抱歉，只有专属用户可以领取哦，看看其他活动吧！
  // A12:您已经参加过此活动，别太贪心哟，下次再来~
  // A14:此券今日已经被抢完，请您明日再来~
  // 活动太火爆，休息一会再来哟~~ A25
  // 此券已经被抢完了，下次记得早点来哟~~ A25
  // 您今天已经参加过此活动，别太贪心哟，明天再来~ A13
  // 您来早了，活动还没开始哟，请稍后再来~ 20016
  // 您来早了，下一场活动开始时间为 14:00，稍后再来吧！ A8
  console.log(
    new Date().toLocaleTimeString(),
    data.discount + "," + data.limit
  );
  if (
    resData.subCode === "A7" ||
    resData.subCode === "20016" ||
    resData.subCode === "A28" ||
    resData.subCode === "A15"
  ) {
    console.log(resData.subCodeMsg);
    (() => {
      let hours = ["08", "10", "12", "14", "16", "18", "20"];
      let now = moment();
      let h = "00";
      for (let _h of hours) {
        if (now.get("h") < Number(_h)) {
          h = _h;
          break;
        }
      }
      let to_date = moment(h, "HH");
      if (h === "00") {
        to_date.add("d", 1);
      }
      console.log(to_date.format(), "开始抢券");

      const time = to_date.valueOf();
      taskManager
        .registerTask(
          {
            name: data.skuName,
            platform: "jingdong",
            comment: "抢券",
            time,
          },
          time
        )
        .then(() => obtainActivityCoupon(data));
    })();
  } else if (resData.subCode === "A14") {
    const time = moment("00", "HH")
      .add("d", 1)
      .valueOf();
    taskManager
      .registerTask(
        {
          name: data.skuName,
          platform: "jingdong",
          comment: "抢券",
          time,
        },
        time
      )
      .then(() => obtainActivityCoupon(data));
  } else if (resData.subCode === "A8" || resData.subCode === "D2") {
    console.log(resData.subCodeMsg);
    (() => {
      let to_date = moment(/\d{2}:\d{2}/.exec(resData.subCodeMsg)![0], "HH");
      const time = to_date.valueOf();
      console.log(to_date.format(), "开始抢券");

      taskManager
        .registerTask(
          {
            name: data.skuName,
            platform: "jingdong",
            comment: "抢券",
            time,
          },
          time
        )
        .then(() => obtainActivityCoupon(data));
    })();
  } else if (resData.subCode === "A25") {
    if (resData.subCodeMsg.startsWith("活动太火爆")) {
      obtainActivityCoupon(data);
    }
  } else {
    console.log(resData.subCodeMsg, resData.subCode);
  }
  return resData;
}

export async function getActivityCoupons(url: string) {
  var { items, directCoupons, simpleCoupons } = await queryActivityCoupons(url);
  var activityId = /(\w+)\/index.html/.exec(url)![1];
  directCoupons.forEach((url) => {
    request.get(url);
  });
  simpleCoupons.forEach(getCouponSingle);
  return {
    success: true,
    res: await Promise.all(
      items.map((item) =>
        executer(() =>
          obtainActivityCoupon({
            discount: item.discount,
            limit: item.limit,
            activityId,
            actKey: item.cpId,
            args: item.args,
            scene: item.scene,
            childActivityUrl: encodeURIComponent(url),
            skuName: item.skuName,
          })
        )
      )
    ),
  };
}
export async function getFanliCoupon(url: string) {
  var { searchParams } = new URL(url);
  /* 
  var text = await req.get("https://ifanli.m.jd.com/rebate/act/getCouponSkuDetail", {
    qs: {
      platform: searchParams.get("platform"),
      skuId: searchParams.get("skuId"),
      type: searchParams.get("type"),
      activityId: searchParams.get("activityId")
    }
  });
  var {content,code,msg} = JSON.parse(text)
  if (code !== 1) {
    throw new Error(msg)
  } */
  var text = await request.get(
    "https://ifanli.m.jd.com/rebate/userCenter/takeCoupon",
    {
      qs: {
        platform: null,
        skuId: searchParams.get("skuId"),
        type: searchParams.get("type"),
        activityId: searchParams.get("activityId") || "",
        pageClickKey: `coupon_icon${searchParams.get(
          "couponIndex"
        )}goods${searchParams.get("goodIndex")}get2`,
      },
      referer: url,
    }
  );
  var { content, code, msg } = JSON.parse(text);
  if (code !== 1) {
    throw new Error(msg);
  }
  return content;
}

export async function getLCoupon(url: string) {
  if (url.startsWith("https://u.jd.com/")) {
    let html = await fetch(url).then((res) => res.text());
    const url2 = /var\s+hrl\s*='(.*?)'/.exec(html)![1];
    url = await fetch(url2, {
      headers: {
        _referer: url,
      },
    }).then((res) => res.url);
  }
  const { searchParams } = new URL(url);
  await request.get("https://api.m.jd.com/api", {
    qs: {
      _t: Date.now().toString(),
      appid: "u",
      body: JSON.stringify({
        childActivityUrl: url,
        d: searchParams.get("d"),
        eid: "",
        fp: "",
        giftInfo: "",
        pageClickKey: "MJDAlliance_CheckDetail",
        platform: 3,
        q: searchParams.get("q"),
        referUrl: url.split("#")[0],
        shshshfp: "-1",
        shshshfpa: "-1",
        shshshfpb: "-1",
        sku: searchParams.get("sku"),
        wxtoken: "",
      }),
      client: "wh5",
      clientVersion: "1.0.0",
      functionId: "getUnionGiftCoupon",
      loginType: "2",
    },
  });
}
// @ts-ignore
window.getLCoupon = getLCoupon;

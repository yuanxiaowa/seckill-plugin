import { test, startsWith, includes, or, anyPass } from "ramda";
import { getGoodsUrl } from "./goods";
import { requestData } from "./tools";
import setting from "./setting";
import { resolveUrl } from "./tools";
import { CouponHandler } from "@/structs/coupon";
import { delay, formatUrl } from "../common/tool";
import { request } from "../common/request";
import { excuteRequestAction } from "../page";
import { taskManager } from "../common/task-manager";
import moment from "moment";

export const handlers: CouponHandler[] = [
  {
    test: startsWith("https://a.m.taobao.com/"),
    api: async (url) => ({
      success: true,
      url: getGoodsUrl(/(\d+)/.exec(url)![1]),
    }),
  },
  {
    test: startsWith("https://uland.taobao.com/coupon/edetail"),
    api: getCouponEdetailFromApi,
    page: getCouponEdetailFromPage,
  },
  {
    test: startsWith("https://uland.taobao.com/taolijin/edetail"),
    api: getTaolijinFromApi,
    page: getTaolijinFromPage,
  },
  {
    test: startsWith("https://uland.taobao.com/quan/detail"),
    page: getQuanDetailFromPage,
  },
  {
    test: startsWith("http://a.m.tmall.com/i"),
    async api(url) {
      var obj = new URL(url);
      obj.host = "detail.m.tmall.com";
      obj.pathname = "/item.htm";
      obj.searchParams.set("id", /\d+/.exec(url)![0]);
      return {
        success: true,
        url: obj.toString(),
      };
    },
  },
  {
    test: startsWith(
      "https://market.m.taobao.com/apps/aliyx/coupon/detail.html"
    ),
    api: getMarketCoupon,
  },
  {
    test: startsWith("https://uland.taobao.com/quan/detail"),
    api: getInnerStoreCoupon,
  },
  // mulCoupon: {
  //   test: startsWith("https://pages.tmall.com/wow/a/act/tmall"),
  //   // @ts-ignore
  //   api: getMulCoupons
  // },
  {
    test: startsWith("https://taoquan.taobao.com/coupon/unify_apply.htm"),
    api: getUnifyCoupon,
  },
  {
    test: includes("id=598424373996"),
    api: getShoudan,
  },
  {
    test: includes("618.tmall.com/union"),
    api: getHongbao,
  },
  {
    test: startsWith("https://pages.tmall.com/wow/a/act/ju/dailygroup"),
    api: getDailygroup,
  },
  {
    test: startsWith("https://1111.tmall.com/union"),
    api: get1111Hongbao,
  },
  /* invitation1: {
    test: startsWith("https://fans.m.tmall.com/"),
    api: getInvitation
  },
  invitation2: {
    test: startsWith("https://pages.tmall.com/wow/fsp/act/invitation"),
    api: getInvitation2
  } */
];

function getInputValue(name: string, text: string) {
  return new RegExp(`name="${name}" [^>]*value="([^"]*)"`).exec(text)![1];
}

// https://detail.m.tmall.com/item.htm?spm=a1z0d.6639537.1997196601.4.1cf47484dF4Tlp&id=598424373996
export async function getShoudan(url: string) {
  await excuteRequestAction(url, {
    code: 'document.querySelector(".tax-operator .c-jf").click()',
    test: includes("mtop.tmall.detail.couponpage"),
    urls: ["*://*.taobao.com/*", "*://*.tmall.com/*"],
  });
}

export async function getUnifyCoupon(url: string) {
  var data = await request.get(url);
  var _tb_token_ = getInputValue("_tb_token_", data);
  var ua = getInputValue("ua", data);
  var { data } = await request.post(
    url,
    {
      _tb_token_,
      ua,
    },
    {
      referer: url,
    }
  );
  return data;
}

/**
 * 万券齐发
 * @param url
 * @example https://pages.tmall.com/wow/a/act/tmall/tmc/23149/wupr?ut_sk=1.XHjcj6bn6PYDABRjm1VuVqKG_21380790_1564927387752.TaoPassword-QQ.2688&ali_trackid=2%3Amm_127911237_497650034_108804550008%3A1564927778_209_148695274&tkFlag=0&tdsourcetag=s_pctim_aiomsg&cpp=1&sm=e0dc72&share_crt_v=1&e=GCUi9AOIB5blXTPXQzkfM4E_09Tyz3Sm5acU9otCs85q-XojkTwRIqY52dVwxnwDP8zggt9XAKJ61Q5N5T-gmOfOhNFpYanTFqSBVzqLUMNomLjE96MgeJ5h_3IkxzXgV5ELjWu7uEocAT_VAGnapNrQvPRQrl_JdRPtJrnIoB45cI_t3MRA4hARmXVb0HgZYAtujJ0q93QGZ3PtzF1lKW8dib3c3EYWUDYWruCX3MoDRb1Etzp3Lw&tk_cps_ut=2&shareurl=true&short_name=h.eRi2IJf&tk_cps_param=127911237&ttid=201200%40taobao_iphone_8.8.0&spm=a211oj.13152405.7740155150.d00&wh_pid=marketing-165174&sourceType=other&sp_tk=77%2BlelFESllSQllUdFjvv6U%3D&type=2&suid=B447DA05-B9A4-41C9-B1B4-F4996E72AF6C&un=8b4b3af2c961913546e6040d6f65052e&app=chrome&ali_trackid=2:mm_130931909_605300319_109124700033:1564927915_267_918396271
 */
export async function getMulCoupons(url: string) {
  var {
    resultValue: { data, fri, sysInfo },
  } = await requestData(
    "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
    {
      data: {
        url,
        cookie: "sm4=320500;hng=CN|zh-CN|CNY|156",
        device: "phone",
        backupParams: "device",
      },
      version: "1.0",
    }
  );
  // 需要钱的券
  var goodsCoupons: any[] = [];
  var keys = Object.keys(data);
  keys.forEach((key) => {
    if (data[key] && data[key].coupons) {
      goodsCoupons.push(...data[key].coupons);
    }
  });
  var {
    resultValue: { data },
  } = await requestData(
    "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
    {
      data: {
        url,
        cookie: "sm4=320500;hng=CN|zh-CN|CNY|156",
        pvuuid: sysInfo.serverTime,
        fri: JSON.stringify(fri),
        sequence: 2,
        excludes: keys.join(";"),
        device: "phone",
        backupParams: "excludes,device",
      },
      version: "1.0",
    }
  );
  return Object.keys(data).map((key) => {
    if (!data[key]) {
      return;
    }
    var { items, coupons } = data[key];
    if (items) {
      // 需要分享领的券
    } else if (coupons) {
      // 店铺券
      return Promise.all(
        coupons.map((item) =>
          requestData(
            "mtop.alibaba.marketing.couponcenter.applycouponforchannel",
            {
              data: {
                activityId: /activityId=(\w+)/.exec(item.couponUrl)![1],
                sellerId: item.sellerId,
                ua: "",
                asac: "1A17718T967KGL79J6T03W",
              },
              version: "1.0",
            }
          ).catch((e) => e)
        )
      );
    }
  });
}

/**
 * 领取内部店铺券
 * @param url
 * @example https://uland.taobao.com/quan/detail?ut_sk=1.XSfi5EEpzUIDAD46j6ev8P7T_21380790_1563514793271.TaoPassword-QQ.windvane&imsi=460011598911726&__share__id__=1&share_crt_v=1&sellerId=2200827691658&xi=592229907275&sourceType=other&suid=BFEA8241-BCCD-4A63-BA5E-77CE930312AC&activityId=d48fc2fa5da44d7e9ff7d81fc0784f7d&sp_tk=77%20lTTZJbVlTUXF5dGbvv6U%3D&imei=861997040593290&un=04ec1ab5583d2c369eedd86203cf18d8&ttid=10005934%40taobao_android_8.7.0
 */
export async function getInnerStoreCoupon(url: string) {
  /*
    获取状态
    mtop.alimama.union.hsf.mama.coupon.get
    {"sellerId":"2200827691658","activityId":"d48fc2fa5da44d7e9ff7d81fc0784f7d","pid":"mm_33231688_7050284_23466709"}
    {
      "message": "",
      "result": {
        "msgInfo": "coupon status not valid",
        // 0:可领 12:失效
        "retStatus": "12",
        "shopLogo": "//img.alicdn.com/bao/uploaded//d7/2d/TB1QtptRQvoK1RjSZFNSuwxMVXa.jpg",
        "shopName": "鸿星尔克outlets店",
        "shopUrl": "https://s.click.taobao.com/t?e=m%3D2%26s%3DcDhKoND6PJFw4vFB6t2Z2jAVflQIoZeptCNrm84%2FxJjdZa3YWKemDUTN71Q0pd8s2FYyuHGhGgg%2FmLO%2F5foB9eoryUtqIh4%2B4jMnl1H7sduZ4Y8JljmSnsn1Peil2YWXl0Ey3zWanW1TqyIhDoGSFVum7ZfZdxsPxBB%2F012F9lkSPClEt413j5jZQFcAPNl6"
      },
      "success": "true"
    }
   */

  var { searchParams } = new URL(url);
  var res = await requestData("mtop.alimama.union.hsf.mama.coupon.apply", {
    data: Object.assign(
      {
        sellerId: searchParams.get("sellerId"),
        activityId: searchParams.get("activityId"),
        pid: searchParams.get("pid") || "mm_33231688_7050284_23466709",
      },
      setting.mteeInfo
    ),
    version: "1.0",
  });
  var success = res.success;
  var msg = "领取成功";
  var manual;
  if (!success) {
    msg = res.message;
  } else {
    let { retStatus, msgInfo } = res.result;
    retStatus = Number(retStatus);
    if (retStatus === 4) {
      manual = true;
    }
    success = retStatus === 0;
    msg = msgInfo;
  }
  return {
    success,
    msg,
    manual,
  };
}

/**
 * 领取店铺优惠券
 * @param url
 * @example https://market.m.taobao.com/apps/aliyx/coupon/detail.html?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1563435732217.TaoPassword-QQ.windvane&wh_weex=false&activityId=34f80bd9595147348085dc75746beef6&ttid=201200%40taobao_iphone_8.8.0&suid=63C1E7D7-3592-4A0D-9A1C-2FB51A7333D1&spm=a2141.7631565.designer_21267326940._0_0&sellerId=2139378753&disableAB=true&utparam=%7B%22ranger_buckets%22%3A%222503%22%7D&sourceType=other&un=35fb12d24e9c47d946e6040d6f65052e&share_crt_v=1&sp_tk=77+lQUlETllTNWNBMUzvv6U=&cpp=1&shareurl=true&short_name=h.eSEEEfs&sm=1b3fe8&app=macos_safari
 */
export async function getMarketCoupon(url: string) {
  var { searchParams } = new URL(url);
  var uuid = searchParams.get("activity_id") || searchParams.get("activityId");
  var sellerId = searchParams.get("seller_id") || searchParams.get("sellerId");
  /* var {} = await requestData(
    "mtop.taobao.couponMtopReadService.findShopBonusActivitys",
    {
      uuid,
      sellerId,
      queryShop: true,
      originalSellerId: "",
      marketPlace: ""
    }
  ); */
  var res: {
    error: "true" | "false";
    module: {
      couponInstance: {
        // 1: 成功
        status: string;
      };
    };
  } = await requestData(
    "mtop.taobao.buyerResourceMtopWriteService.applyCoupon",
    {
      data: {
        uuid,
        shortName: searchParams.get("short_name"),
        supplierId: sellerId,
        originalSellerId: "",
        marketPlace: "",
      },
      version: "3.0",
    }
  );
  return {
    url: `https://shop.m.taobao.com/shop/shop_index.htm?user_id=${sellerId}&spm=a212db.index.dt_5.i2`,
    store: true,
    success: res.error === "true",
  };
}

export async function getQuanDetailFromPage(url: string) {
  await excuteRequestAction(url, {
    code: 'document.querySelector("#getCouponBtn").click()',
    test: includes("mtop.alimama.union.hsf.mama.coupon.get"),
    urls: ["*://*.taobao.com/*"],
  });
}

export async function getCouponEdetailFromPage(url: string) {
  var href = await excuteRequestAction<string>(url, {
    code: function() {
      function handler() {
        const items = [
          ...document.querySelectorAll<HTMLDivElement>(
            ".btn-name,.coupon-btn-right"
          ),
        ];
        if (items.length === 0) {
          setTimeout(handler, 30);
          return;
        }
        items.forEach((ele) => ele.click());
      }
      handler();
      return document.querySelector("a")!.getAttribute("href");
    },
    test: test(/mtop\.alimama\.union\.xt\.biz\.(\w+)\.api\.entry/),
    urls: ["*://*.taobao.com/*"],
  });
  return resolveUrl(href).then((url) => ({ url, success: true }));
}

export async function getCouponEdetailFromApi(url: string) {
  let { searchParams } = new URL(url);
  let pid = searchParams.get("pid");
  let msg = "";
  let res = await requestData(
    // "mtop.alimama.union.xt.en.api.entry",
    "mtop.alimama.union.xt.biz.quan.api.entry",
    {
      data: {
        floorId: 13193,
        variableMap: JSON.stringify({
          e: searchParams.get("e"),
          activityId: searchParams.get("activityId"),
          pid,
          type: "nBuy",
        }),
      },
      version: "1.0",
    }
  );
  let [data] = res[res.meta.resultListPath];
  let { couponActivityId, itemId, couponKey, retStatus, nCouponInfoMap } = data;
  if (!itemId) {
    throw new Error("宝贝不见了");
  }
  let keys = [couponKey];
  if (nCouponInfoMap) {
    keys.push(nCouponInfoMap.couponKeys);
  }
  let recoveryId = `201_11.1.228.74_6456882_${Date.now()}`;
  for (let key of keys) {
    let res = await requestData(
      // "mtop.alimama.union.xt.en.api.entry",
      "mtop.alimama.union.xt.biz.quan.api.entry",
      {
        data: {
          variableMap: JSON.stringify(
            Object.assign(
              {
                couponKey: key,
                af: "1",
                pid,
                st: "39",
                ulandSrc: recoveryId,
                recoveryId,
                umidToken:
                  "TC50B02DBF85D8BF348A96D9D4F3BF318C8AE968567059DC7986855BAE1",
                union_lens: searchParams.get("union_lens"),
                itemId,
                mteeAsac: "1A19322J4Z3PLXO583LRB6",
                mteeType: "sdk",
                mteeUa:
                  "121#51jlkzrBlTwlVl2fxBYfllXYecEfKujV9yIhoz6uKTdJV35EEqFPll9YOc8MKujVlwuYxzB55z1RNlrJEIiIlQXYOcFNv+JbVmgY+1Y5KM9VKyrnEkDIll9YOc8fDujllwKY+zPIDM9lOQrJEmD5lCoYOcfd7QWgzKuYlBCgebCs8ySm/0rOX9L0COe2CpxSpX0lk654M3BmbgibCN+XQBIgJQdynnCSR2b0CZeZTpNN2MS0CNhFFtK0bZJinjxSpXb0C6048u/mCbiDkeHaF960C6ibnnC9pCi0C60TVurmbgi0xoAhC9pcbfE0tnqopX7dC6748u/msMtADvumt5WceyRNnIbT/q6UyzZBFHNTuLrYW6eZa4y+t9I9ETlxlG4y9TTuvGdx23zR3n7IqqHZNsyoyfA/cLpkCy5fzmvDeqGsjxMjB8btFw3ak2451aWuuqn2THrqP9Ndw5Ov9LmgooI0oIv29G9mC+K4ZjQ5in9vJBnMqv/pUOVe8kmA9kCgfdOAnOlpELK8T0mYKVdxwtTJIiTNAY6NseS5KSpvPXDW1rEHTNgrkJ0CnR0USyXKRym/ysQjSMq5ITZOW1IbJ9DJxybGjboSEaGeKk9IUgIoGc1s6rpR5fzIkSh4MWZP3rFEnM6MrFWFh/QVtC2Qw+4HUlJsiFKeKsQGBio8uoN4k69D8XqDs+5boZ4XHg9a4kiL3Bl00q90QBLHACM19O9miITzYGSfFw6ONlzurlsES+LJxHTeKb5Mn4ff6B+1oXy6lelT3i5kkAmsiSh1j8GkldG1jAnpM923YioArcm76iEMKxZRHgwvYJel8n7FT0A4VJZ0M/w7Y2h85z0UvjdR+H53ZWZxzvMTHvdS9M9arOLOcekZzox4TRLnHkxtkLsbDtuDvVDQhjk8q9zGFxv4ND4vm2/f0qO6qbJjxKbADU8YRqiB7g4M7ein2bi1+DD1Uy24U46k8O/kUcJvc9D8BAp180qL/I6tbJgy55NS0Sz1Ay0vbk7runjyS6jwlV/+FGWxuAUW1PD0DqSKlsIFQ/WW8UA9MEaQBTSJkyqR2T9zMiBTsh3HjYOiYiCY1lGrHnYNIdKgWsQPeSVGbL39whDQhgvdhdnQmLHkOq7HavRDFo7pn0glEmw2KNY9UXbXR19D7mN5y8bmHjh0JPsElhXRjKc9pOlePcvIJBYovZ9u58SjtyjtA/S1hNwHDXMm7hD9hSxjJclmZp629mecvXVOVC70DrsJOB3u54QXLeWCqaMxuXPMR5C0SFedq0xvTrzRyd2YtHLV13qmd/C7MzXKuWsSfQhZI26zemPUYr/FQ6inJBWjwRaxUw==",
              },
              setting.mteeInfo
            )
          ),
          floorId: "13352",
        },
        version: "1.0",
      }
    );
    let {
      applyCoupon,
      recommend: {
        resultList: [
          {
            coupon: {
              // 0:成功 4:抽风 1:买家领取单张券限制
              retStatus,
              msg,
            },
          },
        ],
      },
    } = res;
  }

  return {
    success: retStatus === 0 || retStatus === 1,
    url: getGoodsUrl(itemId),
    msg,
    manual: retStatus === 4,
  };
}

export function getTaolijinFromPage(url: string) {
  return async () => {
    var href = await excuteRequestAction<string>(url, {
      code:
        '[...document.querySelectorAll(".btn-text")].forEach(ele => ele.click());document.querySelector(".product-info-detail").getAttribute("href");',
      test: anyPass([
        includes("mtop.alimama.vegas.center.flb.coupon.query"),
        includes("mtop.alimama.union.xt.en.api.entry"),
      ]),
      urls: ["*://*.taobao.com/*"],
    });
    return resolveUrl(formatUrl(href)).then((url) => ({ url, success: true }));
  };
}

export async function getTaolijinFromApi(url: string) {
  let { searchParams } = new URL(url);
  let success = true;
  let msg = "";
  let eh = searchParams.get("eh");
  let resdata: {
    coupon: {
      // 0:可领取 6:已失效 9:已领过
      couponStatus: "0" | "6" | "9";
      couponKey: string;
    };
    couponItem: {
      itemId: string;
      clickUrl: string;
    };
    rightsInstance: {
      //  0:可以领 5:已领过 3:已发完
      rightsStatus: string;
      pid: string;
      // 红包金额
      rightsFace: string;
      startTime: string;
      endTime: string;
    };
  } = await requestData("mtop.alimama.vegas.center.flb.coupon.query", {
    data: {
      eh,
      activityId: searchParams.get("activityId") || undefined,
      isMobile: false,
    },
    version: "1.0",
    referer: url,
  });
  let {
    coupon: {
      // string 0:可领取 6:已失效
      couponStatus,
      couponKey,
    },
    couponItem: { itemId, clickUrl },
    rightsInstance,
  } = resdata;
  // logFile(resdata, "淘礼金");
  if (rightsInstance && rightsInstance.startTime) {
    let diff = Number(rightsInstance.startTime) - Date.now();
    if (diff > 0) {
      delay(diff).then(handler);
      return;
    }
  }
  return handler();
  async function handler() {
    let promises: Promise<any>[] = [];
    var _couponStatus = Number(couponStatus);
    if (_couponStatus === 0) {
      promises.push(
        (async () => {
          var res = await requestData(
            "mtop.alimama.union.hsf.app.coupon.apply",
            {
              data: {
                couponKey,
                asac: "1A17621S4VF9XKFZ9JX5X7",
                mteeUa:
                  "121#DZwlkkSZeHMlVlhOGBhGllXY3cY6vujVdqFgxgk5PMxhO6WJEGCIKwa0Oc8fDujlVmgY+zP5DMtlL2b0D445lwlYKarfKuj9LnN9S7LIKMLWA3rJEtj5ll9YOc8fDujllwgY+a/5KM9VOQrJEmD5lwLYAcT+DujVla+AMjlKAQ9PD0g6bqRVpSCvU8WubZ3546ocFtFbMXrDnj29p2D0C6e783aGRdwrYHHXFt4bbZi0JjdeN4jVCZe4GG/mbgiek+IaFtFbbZsbnjxSpXb0k65T8uBhbZs0CeHXF9WbCZsbnTx26MY0C5OfSm2kluVirN1mF9F7bvaFxqxSRZb0C6bDVlHzPQ8RDqiYVUc0hs7cu8ozJ/JYX3BIXj1yF2y4mm8m4CxQMuNJKHryKmWHeqxyWsycKJSY3iHQFpXcJrsJyU6pigImFS82F9pMxxhfJhFetGT2W3XcKHGeDnIFrKtQnUIobnu4BRfvwHKSiyN70hDtznQkmTKPATNtVmz6mFazXr2UboSL1cGNPMPjLHQGUNpNBfIQynYpAdyvmiokWe6ddKtDk9EJftMTiSYhAxlxMmN0WgnqppOvjbGZeeVcyiANW3mYfOx2v+o41jK7/3j2FjMkk0JYqSjv6Y3K2lTHVIxQ1FimWKRULXvhHqCTm0ZTlHzM1T8CTSAJ0ndCXn4sBuZg/+o0q8SKfcOLQiOrdDf9uDtOp8bBy0dWw61YGaELFJF0x/qC8gxgfjh61yY2k3HRjpAYNEa7gn7O9TscURpvys6yWUo7WmUhLH22jaH/N2JSvgKjIFmHF0lduZyYZ5h/MOkmqWnvcHOl+ztSPJZX2dl9YLWCjkQSwBZl/9/4W9H5Wt3kY3IIUJ6BTeNPojs9YqKMvmBVVSEtuxNxbwLwsW0T+6/G31k5/j9AHrTFXSH6tHH5wWOdP+97szBsLoE7xy4PnC3dK9cwoFkEO5fFe8xaOF0VwsRoxsFMyBoKd6tbCwr3G9INHKU3rucbI7gCFj6F3yfrKabHx0GPZZtdSiuaBRGg+9go32kq3wOzrF5G7AZC6LBpOPA9N2Yw/C8EqpBFIe7JYUkl40lL3sSIrijuaBMKI6dfLuv8BmAhlrGPSeg3WsOeabe/OI+uez+WO8TKntY2S1/Ilsh5b9Waql/gCcXUANneKU3tuQwg1DPhhiu8qZOf",
                umidToken:
                  "TE57CFF6813C4BBE049101EFE049454632A8DA785372116D901100B250B",
              },
              version: "1.0",
              referer: url,
            }
          );
          var coupon: {
            code: string;
            // 0:成功 1:买家领取单张券的限制:APPLY_SINGLE_COUPON_COUNT_EXCEED_LIMIT 5:优惠券失效或过期:COUPON_NOT_EXISTS
            retStatus: string;
            msg: string;
          } = res.result.coupon;
          msg += "," + coupon.msg;
          let retStatus = Number(coupon.retStatus);
          if (retStatus !== 0) {
            if (retStatus !== 1) {
              success = false;
            }
          }
        })()
      );
    } else {
      success = _couponStatus === 9;
    }
    var _rightsStatus = Number(rightsInstance.rightsStatus);
    if (_rightsStatus === 0) {
      promises.push(
        (async () => {
          var res: {
            // 6:你已领过该奖励
            drawRetCode: string;
            drawRetDesc: string;
            drawRetSubCode: "19";
          } = await requestData("mtop.alimama.vegas.draw", {
            data: {
              asac: "1A18912HD87JTTJQQI1QKJ",
              eh,
              extend: JSON.stringify({
                e: encodeURIComponent(new URL(clickUrl).searchParams.get("e")!),
                itemId,
                rightsFace: rightsInstance.rightsFace,
                scence: "wap",
                unid: searchParams.get("activityId"),
                relationId: searchParams.get("activityId"),
                activityId: searchParams.get("activityId"),
                from: searchParams.get("activityId"),
              }),
              mteeUa:
                "121#K1MlkkarjVwlVlh3GBhGllXY3cY6vujVdqFgxgk5PMxhO6WJEGCIKwa0Oc8fDujlVmgY+zP5DMtlL2b0D445lwlYKarfKuj9LnN9S7LIKMLWA3rJEtj5ll9YOc8fDujllwgY+a/5KM9VOQrJEmD5lwLYAcT+DujVla+AMjlKAQ9PD0g6bqRVpSCvU8WubZ3546ocFtFbMXrDnj29p2D0C6e783aGRdwrYHHXFt4bbZi0JjdeN4jVCZe4GG/mbgiek+IaFtFbbZsbnjxSpXb0k65T8uBhbZs0CeHXF9WbCZsbnTx26MY0C5OfSm2kluVirN1mF9F7bvaFxqxSRZb0C60SVw13+Q8RD++pi11OHiv++BjgnvxwPDUS9+b/Ti8Hu/w7d32M0kAevwJMYZjVwkMS/BNs/yJ1smgEKNSJsQ+JJaxAltaIUMaZ8U8JxQbVJz6R4ZvZvzUdSn0APaVEVa+84EZstJRb3K3/aNYc6a0jd35pPZ96dnOBL9EUhFAxYJq/n9p/0DCaCrP1tIDifgB7d/2qv7CwC/KxWE0SJ9QtOMokkNOqoQBj5EEhzMX9H0kh3mFdhhUCSrHVseTG7+J94hkE6tCi9PcUXNTVmFUIJLoIRkIywDsM8DNLxGG2GLxgucMnoNMPb52pmQRnc+2v2r37AFw9yV2ildfvUb7ypqzkRQD7YDgIsXLiJqrzcqcc3UJ8pAeyA2gVIoy2XafLZsssHA0JOZxYSAl/kg2EteWLWgnCyr+8/kQkw/EuWVILbRv0eTkJn5qVISTCXDkL2BNkPZ51PR8oAjQvdxGSUp5NSV2OTdPf/NLANdik2PdezhQ+fpb98ajVk/uQMjOQxVKqBhWZdggSqjihA5tFaIl9RGbjT3Bb2JVTKtwqlwiXpN6AYW+B7BopJJgpKxOkWuK8gnH1fn7NecWAY794Og5o+BwF3JlmSb7uQdFhuCvCvzP67PHDlHbnDWh707QIgMpItSCn+gW1QYMmB+yVB8HYEiBu4lf7pBV5PqBipWkIAPi9GfA/xFT6+M+6RLNWQah0adZtiazI1Bsko5Ak6rfSzL3UOLf7AJ7ARzJVRJoihsuT+RaiWIG9ZAsdhFWxU3kZoMQXdGonUPBJ/o7WoLqxeH1WTPHrbsbUvpKj2M1jDVQnVuWPr2uqeFoL1McMz5FBYphh3lx54jlsTTvbfT6a3TXBoQ==",
              pid: rightsInstance.pid || "",
              umidToken:
                "TE57CFF6813C4BBE049101EFE049454632A8DA785372116D901100B250B",
            },
            version: "1.0",
            referer: url,
          });
          // logFile(res, "淘礼金-领礼金");
          msg += "," + res.drawRetDesc;
          if (res.drawRetCode !== "0") {
            success = false;
          }
        })()
      );
    } else if (_rightsStatus !== 5) {
      success = false;
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    return {
      success,
      url: getGoodsUrl(itemId),
      msg,
    };
  }
}

/**
 * 618红包
 * @param url
 * @example https://618.tmall.com/union?disableNav=YES&wh_alimama=true&ali_trackid=2:mm_124416268_30902206_113114651:1592576760_140_1077142655&spm=a2159r.13376465.0.0&scm=20140618.1.01010001.s101c6&ut_sk=1.utdid_null_1592566640051.TaoPassword-Outside.lianmeng-app
 */
export async function getHongbao(url: string) {
  // #J_MM_RED_COVER_1_0,#J_MM_RED_RESULT_1_0
  // var data = {
  //   "https://618.tmall.com/union?disableNav": "YES",
  //   wh_alimama: "true",
  //   ali_trackid: "2:mm_124416268_30902206_113114651:1592576760_140_1077142655",
  //   spm: "a2159r.13376465.0.0",
  //   scm: "20140618.1.01010001.s101c6",
  //   ut_sk: "1.utdid_null_1592566640051.TaoPassword-Outside.lianmeng-app",
  // };
  url =
    "https://618.tmall.com/union?disableNav=YES&wh_alimama=true&ali_trackid=2:mm_124416268_30902206_113114651:1592578854_194_302382944&tbkShareUId=842437230&from=tbk1111fenxiangyoushang&fromScene=289&tbkShareId=789292564";
  const urlObj = new URL(url);
  const ali_trackid = urlObj.searchParams.get("ali_trackid")!;
  const ali_trackid_arr = ali_trackid.split(":")!;
  // {"api":"mtop.alimama.vegas.draw","data":{"awards":[{"couponId":"1913491764753","extend":{"awardTips":"手机淘宝-红包卡券查看和使用","awardImg":"https://img.alicdn.com/tfs/TB1hkiwHYj1gK0jSZFuXXcrHpXa-213-192.png","effectiveTimeType":"ABSOLUTE","biggerAwardImg":"https://img.alicdn.com/tfs/TB1hkiwHYj1gK0jSZFuXXcrHpXa-213-192.png","awardUnit":"元","awardName":"天猫魔盒优惠券"},"id":"7989002342","rightsFace":"20","rightsSubType":"3","rightsType":"2","useEndDate":"2020-06-20 23:59:59","useStartDate":"2020-06-16 00:00:00"}],"chance":{"chanceLeft":"1","totalChance":"3"},"drawRetCode":"0","drawRetDesc":"中奖了","extra":{"traceId":"0b51191915925773552112670e91fa","totalValueAmount":"20"}},"ret":["SUCCESS::接口调用成功"],"v":"1.0"}
  // {"api":"mtop.alimama.vegas.draw","data":{"chance":{"chanceLeft":"0","totalChance":"3"},"drawRetCode":"1","drawRetDesc":"未中奖","drawRetSubCode":"30","extra":{"traceId":"0b51070315925779235271320e5a56"}},"ret":["SUCCESS::接口调用成功"],"v":"1.0"}
  // {"api":"mtop.alimama.vegas.draw","data":{"chance":{"chanceLeft":"0","totalChance":"3"},"drawRetCode":"5","drawRetDesc":"你的抽奖机会已用完，请明天再来","drawRetSubCode":"20","extra":{"traceId":"0b51070315925779265711596e5a56"}},"ret":["SUCCESS::接口调用成功"],"v":"1.0"}
  var data: {
    chance: {
      chanceLeft: string;
      totalChance: string;
    };
    drawRetCode: string;
    drawRetDesc: string;
  } = await requestData("mtop.alimama.vegas.draw", {
    data: {
      eh: "dnaDiFU8YyV1Z2W8b6J6wQ9kR/tTPZ/fME4BxDdS+QWVFbJpqFlsww==",
      extend: JSON.stringify({
        union_lens:
          "recoveryid:a211oj.14653409_1592576969344_8932235560140236_PaTqF;pvid:a211oj.14653409_1592576969344_8932235560140236_PaTqF",
        scence: "wap",
        spm: "a211oj.14653409",
        clickId: ali_trackid_arr[2],
        mode: "CLICK_DRAW",
        pvid:
          "a211oj.14653409_1592576969345_7289289145575855_PaTqFqUX0zQCAbR1oOIiqm3Y",
        preSend: false,
      }),
      mode: "CLICK_DRAW",
      pid: ali_trackid_arr[1],
      ua:
        "124#qV86LJEKxG0xA7CijkMLmeKVVpRFx4SskGpMs89hk2En5mh68+kaU28FDX1fM4AfOFfHtEpm+X4WmszJuy6HwVSIuf01H6OxzND3ywsIyRmC3WkXumTzdjBUQRFHiDgVPSUjimISDn2xIoLXnB2t0HkVsjuCBEsJtiSo2lr/eH2Q3kIeIqXtg5Go1ZIZlMLIgKvtIZ/LbwiJm4WA/C9dXbpo1Z/flMX2gKPXInYLlwYnmfWeIqXLg5S41ZIZlUX2g7vtIZ/plwY2m4+ZI8LLgTSa1nIxbquhdLCtIqbLlw/ng1iHSNJgWQ8d1Z2eb0jExedSvwi5uEq9HyPVLzyfQhMJSGEBYzDeLD2fk6tazY7vmUyfDbmDMUKoL3c/wM3qvU8sQPlBoQZnKAMyuv5u7qucboWaCYtrqxpE6Zj9jDxRIMoicwaajRX7fgn7bVlFu3nwVYVunm0JdDyYO1vgbkOafZRvLfNjNGkfLmoE+R10vTwhRC/NboA8N5rkXsK4UIpyX+THfG1HcQ0lS5+WK7WSt8uDrK0J7FLx+WNDfgANMsuFMN638XOASiXR/NyKD1zHiu5wnHGT6FVktTe+5UZs6YVJmCoC4jW5DE3IOONSWhVzd+YTq4o/alKTHXnDOPhZPOGS9qqmUNDLStBkkbi13mK3D4toWprDkYpkIHmwg65GgTc9q9mqHtkSwHzSUUGT7JmjJiRYPL/YknQcKATDp1wIPDzI8vyUb1rW6ZqzE9X5PU2jA3/Qf5hJApGhaR8f55K48RwvW8LLNcc1yke1TYhR9/uTHACI2Zwf6NTL9ZXflrA63Vk10FlgAKqLSI5UEGNvwElO7BXioDVV6kcP0+5PXmnL+w58g/lovAhdtYfRxqsxy2AQa47PmnIoyHaNBAuDM6ypQk==",
      umidToken: "T13D5130D4E8782F1B228536D59D77846CDB924DD8CB3A64E17A6E3F506",
    },
    version: "1.0",
    referer: url,
  });
  console.log(data);
  if (+data.chance.chanceLeft > 0) {
    return getHongbao(url);
  }
  console.log(data.drawRetDesc);
}

async function get1111Hongbao(url: string) {
  // wh_alimama: true
  // disableNav: YES
  // es: 5b+DG6gSXvsN+oQUE6FNzAioWZP3qDgNnYSgewQnie0YHpdVRmafwmyeJvHyxPy3
  // ali_trackid: 2:mm_130931909_977950399_109602500307:1603202832_186_1127165491
  // union_lens: lensId:APP@1603191126@0be55312_0f7a_17545a33890_1e44@025H2q488DN9Z4c2CFio5Ivt;recoveryid:1603202832_186_1127165491
  // spm: a2e0r.13514612.32387955-MCRmhcAuto.dslot_1_share_20150318020001156
  // un: d3c21efbc631c34d384c4a342af87869
  // scm: 20140618.1.01010001.s101c6
  // ut_sk: 1.utdid_null_1603191126174.TaoPassword-Outside.lianmeng-app
  // bxsign: tbk08NPU2UJhHuWVWjp3w12ky5pTEWrLEbdDls1IEHyATkwA0Gn/yC0uL/CwNUDbZq70V4rAah 2uIe8c7z60NL5U/q0LIxVkRzvp6plwpMfOI=
  try {
    var data: {
      chance: {
        chanceLeft: string;
        totalChance: string;
      };
      drawRetCode: string | number;
      drawRetDesc: string;
    } = await requestData("mtop.alimama.vegas.draw", {
      data: {
        extend: JSON.stringify({
          union_lens:
            "lensId:APP@1603191126@0be55312_0f7a_17545a33890_1e44@025H2q488DN9Z4c2CFio5Ivt;recoveryid:1603202832_186_1127165491;pvid:a211oj.20488333_1603209619989_08945933037496046_aY8wF2EpCT",
          scence: "pc",
          spm: "a211oj.20488333",
          clickId: "1603202832_186_1127165491",
        }),
        es: "5b+DG6gSXvsN+oQUE6FNzAioWZP3qDgNnYSgewQnie0YHpdVRmafwmyeJvHyxPy3",
        pid: "mm_130931909_977950399_109602500307",
        eh: "oVCEq1EQc2B1Z2W8b6J6wZ9vh7xKjJWZME4BxDdS%2BQURyLQD8UMs1Q%3D%3D",
        ua:
          "137#cB99hE9oUJFH87UKABOpWHAGIn1B4eg99GZoSaw+OH1dIBWTzju75zIPZ/QPiTTe0dgdOyiUdOWrNswUpv/SDq79s03NMUozNCANNoycVGBlRzMGylfdxYEHyyV+jR1CrdSdieWv8O+6AN2CTIa81Kdjwnbh6n32tjUYSrfLuSusPZQWKNmIRt1ntKQlJtg3Wv7bi4+9cdpEFVPw3OO3WqIEIHcBs5pDB5s+HCcONg/g6Nf89vH4xHwPuvmgHKTt+VHvmcbNZF5Tze6+IVGFotG/RWg+kHh75ZS5ej7pJOzcAtQeAQA0boLX48euloeEoniF7oagXaTiWDgVu98eR7WGHw4vLHs2d6VZXAE45FvkNDrjQQ/IFxOiPMrwRHj4OhvvRF8r9A+AM0e70T0XpfNs/0ikuPgOazYgyJ9o9h1bR807kTQRS0Jc1Iei+pppY2US1lQypppcQonJ+ZDVpRmc1AlUit7O7yUxlqgipXicQofJ+WQesRnc1soBCEZxbwU94GQRl+7c7ID1XFGVpkUm1Igi+ppVYTUxuqgipB6mQofJ+GXppRJc1ITGU2ac7199iISe682XflbmXWjhGSXLbbBnoB8MYykCS+dAslqP7yRsVWnDED8kvIdbGHKWKBnJJXhMlvzo1E08pGGYrseNWTTe9p1n1IZ29pecoKDCUiEGurpk1vl0vp5CKbmpXaYLGGF1ILiJWHkETLVZn04IuNDUKp+fi4gCw43XDPn90DhTHggMOLnJcERvWRFFi0qblkFu5jRECFdx8l+TFSQHgSw+VvYgk90aLg3OrlkJpRPfbcVKtipmzcngD6YX1QQLhwFB+pHHX+PxvRax3G63yLf9pd/KphhCg9ErYB5t4JjhxdsT2/P+2RkQo78s5ZW3Fsw9tPs03x7WZ3yv0LDtlenwQpgP/ieWe8iUsPDkAEh2T661DVS5DhBykhl/ZfFyqRCq1v0/oTKaldK+qmdNe0OnrF97IYq4+AepgxxvikQuLHqJ90jgAoeVd4hqFrYrEDC1ctlMMZRCJRVtfPi4BvHR204fpuU9tHiZe+dEurjzT0YlbDCCwzCFAvaEKxCkNMkT8Nf4lKesqti18QcWTe1PUf1A8unKjbOrHPucsp58E2DrnZ51DBDFRXJ6JBVOivZA29kj9m91ub7aDn5E0Dir5ymrtZpjhmYeog/yFDiy0wcL2/XBc+8oJ58P06l1SQ5is40wSULfGKlrnDV4po7coGJtoMOxhcMUiL0yafbURwOxc8jZPVJHFxSt2oAWNH7GT2xcldKWszP7h7u2gQRKhseTxZ4UGUqJQess74HXFaFCrqK1S6eXkUrxljYprTq/RIF5mDfE6GqF6dpMOCbsCF7sg0ClmHIeesplKuqEGNq90BTN591XDWTsMl1XSWJBK6XEepLevMkm/qp9x/HNVIU4KuSS8FHUXRJrvTD2OAWdnh5wJnnX5KJJzf27tJ289oDSK84+VoAUOqv=",
        umidToken:
          "T2gAEyg1X-OCYwjp9DZ6uAitKoiVjihxv03gFWzVZr5xCEmA1RQXfy36IsRyNPBu_gcQenFvLwDcwqzZQj_BIKws",
      },
      version: "1.0",
      referer: url,
    });
    console.log(data);
    if (data.drawRetCode === 4 || +data.chance.chanceLeft > 0) {
      return get1111Hongbao(url);
    }
    console.log(data.drawRetDesc);
    var t = getNextTime();
    await taskManager.registerTask(
      {
        name: "抢双十一红包",
        time: t,
        platform: "taobao",
        comment: "",
      },
      t
    );
    get1111Hongbao(url);
  } catch (e) {
    if (e.message === "流量限制") {
      get1111Hongbao(url);
    }
  }
}

function getNextTime() {
  const now = moment();
  const nextHour = [20, 21].find((i) => now.get("hour") < i);
  const nextDate = nextHour
    ? moment(nextHour, "hh")
    : moment("00", "hh").add("day", 1);
  return nextDate.valueOf();
}

// get1111Hongbao(
//   "https://1111.tmall.com/union?wh_alimama=true&disableNav=YES&from=surprise&es=0LUR%2BwQVLyUN%2BoQUE6FNzFGgGZWVVPe%2BofCQzO81Q2nsgGe4cdBKzVEbQTfm%2FfAA&ali_trackid=2:mm_124416268_30902206_113114651:1604925253_151_609890377&union_lens=lensId:APP@1604924796@0b0ae80f_1047_175acf8ee45_a0ac@025EJp4GMEQZXvL9LTArAHQV;recoveryid:1604925253_151_609890377&spm=a2e0r.13514612.32387953-MCRmhc20201111.dslot_4_share_20150318020001364&un=a877e42aa376ee838011994573a7abfb&scm=20140618.1.01010001.s101c6&ut_sk=1.utdid_null_1604924796498.TaoPassword-Outside.lianmeng-app&bxsign=tbkaB2CK0mBr7xo9FdZWwrjv0X41Anu8oYxEy/Ynkqfo/bmw2VoozD+qmOvYQkHCzQHgxD4LGs7q78jVijxiqoU1qTYTXDwIDCBJrtpby3yG28="
// );

/**
 *
 * @param url
 * @example https://pages.tmall.com/wow/a/act/ju/dailygroup/1092/wupr?__share__id__=1&spm=a2159r.13376465.0.0&share_crt_v=1&wh_pid=daily-202332&clickid=I220_238159034415923266013162775&ali_trackid=2%3Amm_97642752_435350426_108464350060%3A1592326583_100_881165657&from=qianx&sp_tk=77%2BlWkdsMTFGYlFTY2zvv6U%3D&sourceType=other&suid=0A433C2C-65CF-4BCA-9A08-517F91388AA5&un=c0aeec34afc20560e13bd8fde7d968fb&eRedirect=1&ttid=201200%40taobao_iphone_9.8.0&sourceType=other&suid=b77f02de-b3cf-4faa-bbaa-106c7b98f8f8&ut_sk=1.XlihFhWfs%2BsDAHIO7mTHGFB7_21646297_1592572696187.TaoPassword-QQ.2688
 * @example https://pages.tmall.com/wow/a/act/ju/dailygroup/1112/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1610246987810.TaoPassword-QQ.2688&spm=a2141.7631557.0.0&wh_pid=daily-226390&sourceType=other&ttid=201200%40taobao_iphone_9.17.0&suid=82590F0D-3DA8-44F5-8306-00C56277D90B&utparam=%7B%22s_utmap%22%3A%7B%22s_isEl%22%3A%221%22%2C%22s_isTj%22%3A%221%22%2C%22x_object_type_search%22%3A%22giraffe.huijuguangxi-33%22%2C%22list_param%22%3A%22%E6%B1%87%E8%81%9A%E5%B9%BF%E8%A5%BF_19_d49aa0d837ecd3395e117297318a8d09%22%2C%22x_object_id%22%3A%221607675159555%22%2C%22tItemType%22%3A%22wx_tbsearch-segments_cjl_staticpic_card%400.0.4%22%2C%22x_object_type%22%3A%22giraffe.static%22%7D%7D&un=35fb12d24e9c47d946e6040d6f65052e&share_crt_v=1&sp_tk=eHhESGNIQW9tNmE=&cpp=1&shareurl=true&short_name=h.4SX33Ii&bxsign=scdR9W24h9OuuzK2cyihxosyReeiqCZJNKxZK5QJvxQHCaHFo52CsfGoHkao1WpypQyqwK-iASc9QSu3b4mJyMyOhcVdhf7dzX1HcqQ-NN6mUI
 */
export async function getDailygroup(url: string) {
  const {
    resultValue: { data },
  }: {
    resultValue: {
      data: Record<
        string,
        {
          lafiteConfig?: {
            benefits?: BenefitItem[];
          };
        }
      >;
    };
  } = await requestData(
    "mtop.tmall.kangaroo.core.service.route.pagerecommendservice",
    {
      data: {
        url,
        cookie: "sm4=320583;hng=CN|zh-CN|CNY|156",
        device: "phone",
        backupParams: "device",
      },
      version: "1.0",
    }
  );
  const tmps1 = Object.values(data)
    .filter(Boolean)
    .map(({ lafiteConfig }) => lafiteConfig && lafiteConfig.benefits)
    .filter(Boolean)
    .flat() as BenefitItem[];
  tmps1.forEach(getDailygroupCoupon);
}

interface BenefitItem {
  asac: string;
  strategyCode: string;
  channel: string;
  channelName: string;
}

const cacheHandler = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  let p: Promise<any> | null = null;
  // @ts-ignore
  return async (...args: Parameters<T>): ReturnType<T> => {
    if (p) {
      return p;
    }
    p = fn(...args);
    p.finally(() => {
      p = null;
    });
    return p;
  };
};

async function getDailygroupCoupon({
  strategyCode,
  channel,
  channelName,
}: BenefitItem) {
  // {"api":"mtop.latour2.strategy.show","data":{"attributes":{"serverTimeMs":1592582834156},"data":{"currentPage":1,"hasNextPage":false,"showBenefits":[{"amount":1000,"amountUnit":"分","asac":"2A20612ABVW2I686NUDVSP","benefitPoolId":181368107,"canWin":false,"code":"976e7d51edb2444290ab074699ba3e80","displayAmount":"10","displayAmountUnit":"元","displayStartFee":"11","effectiveEnd":"2020-06-20 23:59:59","effectiveStart":"2020-06-16 00:00:00","effectiveTimeMode":"ABSOLUTE","endDate":"2020-06-20 23:59:59","feature":{"campaignId":"86437","demeterId":"88651","description":"限活动商品专用","templateCode":"4178376962","source":"tmallIndustry","title":"湖州商品","uuid":"27bb7e22af4f47f388bccec3d3ff2d9e","industryId":"999999999","sellerId":"2204100802286","couponTag":"458660004","fundingType":"1","campaignName":"湖州商品","channelId":"41834001","useDesc":"限活动商品专用"},"hadWin":false,"hasInventory":false,"increments":[{"effectiveTime":"2020-06-20 10:00:00"}],"items":[{"auctionTag":"130 203 331 385 907 1163 1478 1483 2049 2059 3079 3394 3466 3911 3974 3979 4166 4491 4939 5895 6603 6849 7494 7883 8258 8326 8578 8583 10439 11083 11339 14210 16779 18379 18763 21442 21762 21826 22155 23105 23746 25282 28353 29122 30337 30977 31489 33217 33346 34369 35713 36161 37122 37569 39233 40897 44609 46914 49218 49282 53121 65281 70465 82306 84801 87425 101762 107522 107842 112001 112386 115329 116546 118338 119234 119298 120577 120962 123521 123649 123905 131713 137281 143746 150146 150465 161793 161921 166402 175490 180161 188609 188673 200002 200321 201409 202050 202434 203521 212546 225410 243906 249090 249858 249922 253570 268418 277250 281666 282498 282562 282754 282818 282882 284802 288386 288962 292674 299394 299458 350466 351362 364482 366402 368386 369154 371074 386242 388354 398594 404546 427458 455554 481986 491074 496770 508418 508674 519106 520130 766146 766274 766722 766786 766978 767042 767106 768066 768258 775554 776578 1235074 1286402 1294146 1301314 1326786 1327042 1349442 1435778 1436034 1437442 1443906 1473090 1478146 1508354 1508482 1513730 1517698 1518018 1518082 1553410 1581442 1590082 1608450 1618306 100027125","discountPrice":"99.90","failover":false,"huaxianPrice":"360.00","inventory":1619,"itemId":15032271059,"mainPic":"//img.alicdn.com/i3/711841968/O1CN01qPCZ1I1QPO3xVO9kR_!!0-item_pic.jpg","reservePrice":"360.00","sellerId":711841968,"tagPrice":"0.00","title":"欧诗漫面膜补水保湿玻尿酸女收缩毛孔免洗非蚕丝旗舰店官方正品","whiteImgUrl":"//img.alicdn.com/bao/upload/TB1RTVbiK3tHKVjSZSgXXX4QFXa.png"}],"material":{},"outerTemplateId":"4178376962","owner":{"userId":"offical","userType":"xiaoer"},"sendLifeCycleState":"running","showRules":[{"passed":true,"type":"WIN_LIMIT"}],"source":"lafite2","startDate":"2020-06-15 22:48:00","startFee":1100,"test":false,"title":"湖州商品10元购物券","type":"plCoupon","typeDesc":"品类券"},{"amount":2000,"amountUnit":"分","asac":"2A20612ABVW2I686NUDVSP","benefitPoolId":181368107,"canWin":false,"code":"5d620a41c65e4b0bb9f6ad7ff32e29eb","displayAmount":"20","displayAmountUnit":"元","displayStartFee":"50","effectiveEnd":"2020-06-20 23:59:59","effectiveStart":"2020-06-16 00:00:00","effectiveTimeMode":"ABSOLUTE","endDate":"2020-06-20 23:59:59","feature":{"campaignId":"86437","demeterId":"88652","description":"限活动商品专用","templateCode":"4177272961","source":"tmallIndustry","title":"湖州商品","uuid":"f727238cd78c4941bf3325effbacc948","industryId":"999999999","sellerId":"2204100802286","couponTag":"458660004","fundingType":"1","campaignName":"湖州商品","channelId":"41834001","useDesc":"限活动商品专用"},"hadWin":false,"hasInventory":false,"increments":[{"effectiveTime":"2020-06-20 10:00:00"}],"items":[{"auctionTag":"203 331 385 907 1163 1478 1483 2049 2059 3015 3079 3394 3466 3911 3974 3979 4166 4422 4491 4939 5895 6603 6849 7298 7494 7883 8326 8578 10439 11083 11339 14210 16779 18379 18763 21442 21762 21826 22155 25282 26626 28353 29122 30337 30401 30593 30849 30977 31489 33217 33346 34369 35713 36033 36097 36161 37569 39233 40897 46914 49218 49282 65281 67521 70465 79489 82306 84801 87425 87490 90369 100609 101762 107842 112001 112386 115329 116546 118338 119234 119298 120577 120962 123521 123649 123905 131713 137281 143746 145857 150146 166402 175490 180161 188162 188609 188801 200002 200321 202050 203521 212546 241218 243906 246978 249090 249858 250178 253570 257922 268418 277250 281666 282498 284802 285186 288386 288962 299394 299458 317634 331650 348546 349442 350466 363650 364482 364610 366402 368450 369154 371074 386242 388354 398594 427458 459586 491074 508674 519106 520130 766146 766274 766722 766786 766978 767042 767106 768066 768258 1286274 1286466 1326786 1327042 1345922 1367938 1435778 1436034 1443906 1473090 1478146 1508354 1512962 1513730 1550466 1590082 1618306 100027125","discountPrice":"99.90","failover":false,"huaxianPrice":"480.00","inventory":2464,"itemId":17523468725,"mainPic":"//img.alicdn.com/i2/759213442/O1CN01PvnkJe1bITqyeV1ET_!!0-item_pic.jpg","reservePrice":"480.00","sellerId":759213442,"tagPrice":"0.00","title":"欧诗漫补水保湿玻尿酸面膜女收缩毛孔紧致祛痘淡化痘印旗舰店官网","whiteImgUrl":"//img.alicdn.com/bao/upload/TB1Wge7XQWE3KVjSZSyXXXocXXa.png"}],"material":{},"outerTemplateId":"4177272961","owner":{"userId":"offical","userType":"xiaoer"},"sendLifeCycleState":"running","showRules":[{"passed":true,"type":"WIN_LIMIT"}],"source":"lafite2","startDate":"2020-06-15 22:48:00","startFee":5000,"test":false,"title":"湖州商品20元购物券","type":"plCoupon","typeDesc":"品类券"},{"amount":5000,"amountUnit":"分","asac":"2A20612ABVW2I686NUDVSP","benefitPoolId":181368107,"canWin":false,"code":"04a6517630664c7a92c82a635275f29e","displayAmount":"50","displayAmountUnit":"元","displayStartFee":"100","effectiveEnd":"2020-06-20 23:59:59","effectiveStart":"2020-06-16 00:00:00","effectiveTimeMode":"ABSOLUTE","endDate":"2020-06-20 23:59:59","feature":{"campaignId":"86437","demeterId":"88653","description":"限活动商品专用","templateCode":"4175848995","source":"tmallIndustry","title":"湖州商品","uuid":"cbb6b0728951498db357c9ef10483dc9","industryId":"999999999","sellerId":"2204100802286","couponTag":"458660004","fundingType":"1","campaignName":"湖州商品","channelId":"41834001","useDesc":"限活动商品专用"},"hadWin":false,"hasInventory":false,"increments":[{"effectiveTime":"2020-06-20 10:00:00"}],"items":[{"auctionTag":"130 203 331 385 907 1163 1478 1483 2049 2059 3015 3394 3466 3911 3974 3979 4166 4491 4939 5895 6603 6849 7494 7495 7879 7883 8326 11079 11083 11339 16321 16779 18379 18763 20545 21442 21762 21826 22155 22337 25282 26689 28353 28802 29890 30337 30593 30849 30977 31489 33217 34369 35713 36161 37569 37633 39233 40897 46914 67521 68673 70465 73089 84801 90369 91457 91841 101761 101762 107585 112001 115329 118338 123905 131713 143746 144385 161729 161793 175746 177857 179969 188609 188865 189121 194306 199553 200002 200321 202050 205890 212546 225858 249858 249986 257986 268418 273282 277250 281602 284802 288386 288962 294338 299394 346114 348546 363970 364482 364610 366402 388354 422402 422530 427458 432834 459586 498626 519106 520130 521602 1282050 1322626 1443906 1473026 1478274 1499202 1513602 1513730 1549186 1549570 1550466 1553154 1553794 1590082 1618306 100027125","discountPrice":"119.00","failover":false,"huaxianPrice":"150.00","inventory":1814,"itemId":617442203915,"mainPic":"//img.alicdn.com/i1/441622457/O1CN01mc51Dt1U1LjpsJvXs_!!441622457-0-lubanu-s.jpg","reservePrice":"150.00","sellerId":441622457,"tagPrice":"0.00","title":"欧诗漫女王面膜玻尿酸补水保湿修护焕白提亮熬夜去暗","whiteImgUrl":"//img.alicdn.com/bao/upload/TB1A68CKkL0gK0jSZFAXXcA9pXa.png"}],"material":{},"outerTemplateId":"4175848995","owner":{"userId":"offical","userType":"xiaoer"},"sendLifeCycleState":"running","showRules":[{"passed":true,"type":"WIN_LIMIT"}],"source":"lafite2","startDate":"2020-06-15 22:48:00","startFee":10000,"test":false,"title":" 湖州商品50元购物券","type":"plCoupon","typeDesc":"品类券"}],"showStrategy":{"algorithmFailover":false,"allRulePassed":true,"asac":"2A20612ABVW2I686NUDVSP","code":"89b5b5abab53476283b813175cde66a9","issueScheduleTimes":[{"endTime":1592668799000,"startTime":1592229720000}],"material":{},"mode":"DRAW"},"trackingData":{"traceId":"0b14282d15925828340524178eb295"}},"success":true},"ret":["SUCCESS::调用成功"],"v":"1.0"}
  const getMeta = cacheHandler(function getMeta(): Promise<{
    data: {
      currentPage: string;
      hasNextPage: string;
      showBenefits: {
        title: string;
        asac: string;
        code: string;
        displayAmount: string;
        displayStartFee: string;
        increments?: { effectiveTime: string }[];
        hasInventory: "true" | "false" | true | false;
        canWin: "true" | "false" | true | false;
        hadWin: "true" | "false" | true | false;
      }[];
    };
  }> {
    return requestData("mtop.latour2.strategy.show", {
      data: {
        filterCrowd: "true",
        currentPage: 1,
        pageSize: 20,
        strategyCode,
        channel,
        withItem: "true",
        filterEmptyInventory: "false",
        withIncrement: "true",
        failoverAlgorithmResult: true,
      },
      version: "1.0",
    });
  });
  const hasInventory = async (i: number) => {
    while (true) {
      try {
        var {
          data: { showBenefits },
        } = await getMeta();
        break;
      } catch (e) {}
    }
    const item = showBenefits[i];
    const b = item.canWin === true || item.canWin === "true";
    if (!b && (item.hadWin === true || item.hadWin === "true")) {
      throw new Error("抢过了");
    }
    return b;
  };
  var {
    data: { showBenefits },
  } = await getMeta();
  // {"api":"mtop.latour2.strategy.issue","data":{"attributes":{"serverTimeMs":1592579811467,"trackingData":{"traceId":"0b51061d15925798114416218ee9a2","sampleType":"1"}},"code":"LATOUR2-INVENTORY-06","msg":"库存不足|所有分桶库存均已不足！","success":false},"ret":["SUCCESS::调用成功"],"v":"1.0"}
  showBenefits.forEach(async (item, i) => {
    if (item.increments && item.increments.length > 0) {
      const t = moment(item.increments[0].effectiveTime).valueOf();
      taskManager
        .registerTask(
          {
            name: channelName,
            time: t,
            platform: "taobao",
            comment: item.title,
          },
          t
        )
        .then(() => qiangquanToTime(i, t + 1000 * 60 * 3));
    }
    async function qiangquanToTime(i: number, t: number) {
      const res = await qiangquan().catch(() => ({ success: false }));
      const { success } = res;
      if (!success && Date.now() < t) {
        while (!(await hasInventory(i)) && Date.now() < t) {}
        return qiangquanToTime(i, t);
      }
    }
    function qiangquan(): Promise<{
      success: boolean;
      msg: string;
      code: string;
    }> {
      return requestData("mtop.latour2.strategy.issue", {
        data: {
          strategyCode,
          selectedBenefitCode: item.code,
          channel,
          asac: item.asac,
          ua:
            "124#oUWIy07WxG0xA9Fj1xyCteKVVpRFx4SskGpMsoiJW3tTEF49ilorncB9UvaXGzc2V5PHmNQ5EwtGdYg3ylcT5OLlDnUvzQgEtZvJMC0xzND3ywsIyRmC3WkXuHQRR9iuETvelSGUPiFsaFtMslC5RBKfmyhwB9UOYa/kJNTkDfSX/gl/30toWEjO5vctWQmgOxH9InYLlTYIm4WZIqXp6Tz46WEotFY2g7OHJnYplmi19jrUJ8Lpg91d1ZIZbUang7OBInYLlwYnmfWeIqsXgTzo1nIelUX2g7vtIn/plw/nm4+ZIDLbgTGc7ZW9yq/2DbOBIZzjxqjlN3CzIqXLg5/XAzSD3jeN6PdPrQ8yS5Nof45xQfaBn/g+9XJTSQqpN5rEp5a/gSvLo5220BDIbe4wnIjSnw60NGF8AUL7WiZb7IP1edTsROXHbaTY9PTBiQWhIizSJJ7fefg7f4OO9Ck9flfSY81o1GdeAiPnXbVb3zm7MVEcpAIROJR2PzBm+MC+vELX1PKbdckeBHWHjl3E4okFbOYRf0ftUE22RMVAyQWF7WfMqizIwN/ozt76u1RceDzkReFEjMbB5k0TZkH6CCzOp29at9Qp/2VWfCVpLJQKNhMV5kKWZJuKewgHAlleBIg1rg5neR20ew+c3hZoi1EAkqovlRCTlm4ymCiZ4EUetBQJsGniI8WPGgbCAC4hLobTHLmtdrpqOdexnOBYj+Fa2/jfaNrz5PZsbk+nF/KSqmqAcI6JXd4QjfdRV+nNDhnbvNrrXNcmouA9757bOoyLplblNBhexoBKisWHUx7zvdjRakq8Ibo2PVD2BM/6yEzgYGfiBg5QBPdGaCHC8qcilb2q71GLW+PvlwbbddRrTjyIqdphaXGHEGScqoXwMN9HokxSmwsh5+vN5PJZXYze7kdTTseToyDukc/0QqCxBPUCEC+df3K1vtnfnAQQ/rr6VjsNhUewMD/Ptt1Xch/tLGH4WH5j034c6pq+aU50CXum6X4iz7FaTS1iuEm7DfgF/pNg8igCQI7uHVImQb7NVzzZFvoX+mFwUdy4BU3JpeKKDQlzq+5Fzd0E8Az0bRYrB+ZaPZ1fXUEqGN4ZYhVkFPMt4TSxeDFSirrd2CLHkr2eHZNFqI0+m2AD0D6y/0mS4fF76N6/G5d/Ic91YjpcXonPAUiYjwwOKhPwjO3ZbK+v643fvFXiLR8XPCLQFiyOU1l6sqUP4gA3lX/CsHiDPUZXLr8popa/4X3j+AnFTyukZSdVx2YZ",
        },
        version: "1.0",
      });
    }
    return qiangquan();
  });
}

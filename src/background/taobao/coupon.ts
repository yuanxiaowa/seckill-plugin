import { test, startsWith, includes } from "ramda";
import { getGoodsUrl } from "./goods";
import { requestData } from "./tools";
import setting from "./setting";
import { resolveUrl } from "./tools";
import { CouponHandler } from "@/structs/coupon";
import { delay } from "../common/tool";
import { request } from "../common/request";
import { excuteRequestAction } from "../page";

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
    code:
      '[...document.querySelectorAll(".btn-name")].forEach(ele => ele.click());console.log(document.querySelector("a"));document.querySelector("a").getAttribute("href");',
    test: includes("mtop.alimama.union.xt.biz.quan.api.entry"),
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

export async function getTaolijinFromPage(url: string) {
  var href = await excuteRequestAction<string>(url, {
    code:
      '[...document.querySelectorAll(".btn-text")].forEach(ele => ele.click());document.querySelector(".product-info-detail").getAttribute("href");',
    test: includes("mtop.alimama.vegas.center.flb.coupon.query"),
    urls: ["*://*.taobao.com/*"],
  });
  return resolveUrl(href).then((url) => ({ url, success: true }));
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

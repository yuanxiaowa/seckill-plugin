import qs_lib from "qs";
import * as R from "ramda";
import { request } from "../common/request";
import { ArgSearch } from "../taobao/structs";
import { queryGoodsCoupon } from "./coupon-handlers";

export function getGoodsUrl(skuId: string) {
  return `https://item.m.jd.com/product/${skuId}.html`;
}
export function getSkuId(url: string) {
  if (/wareId=(\d+)/.test(url)) {
    return RegExp.$1;
  }
  return /(\d+)\.html/.exec(url)![1];
}

export async function getGoodsInfo(skuId: string) {
  var ret: string = await request.get(
    `https://item.m.jd.com/product/${skuId}.html`
  );
  var res = <
    {
      item: {
        skuId: string;
        skuName: string;
        venderID: number;
        category: string[];
        newColorSize: {
          [key: number]: string;
          skuId: number;
          SpecName: string;
        }[];
        saleProp: Record<number, string>;
        salePropSeq: Record<number, string[]>;
      };
      price: {
        p: number;
        op: number;
        tpp?: number;
      };
      miao?: any;
      stock: {
        // 0：京东
        isJDexpress: string;
        v: number;
        // 34:无货 36:预定 33,39,40:现货
        StockState: number;
        rn: number;
      };
      promov2: {
        pis: {
          pid: string;
          subextinfo: string;
        }[];
      }[];
      pingou: "" | "1";
      pingouItem?: {
        m_bp: string;
      };
      sence: string;
      avlCoupon: {
        coupons: any[];
      };
    }
  >eval(`(${/window\._itemInfo\s*=\s*\(([\s\S]*?})\)\s*;\s*<\/script>/.exec(ret)![1]})`);
  if (!res.item) {
    res.item = JSON.parse(
      /window\._itemOnly\s*=\s*\(([\s\S]*?})\);/.exec(ret)![1]
    ).item;
  }
  return { ...res, coupons: res.avlCoupon.coupons };
}

export async function getGoodsList(args: ArgSearch): Promise<any> {
  var _qs = {
    couponbatch: args.couponbatch,
    coupon_shopid: args.coupon_shopid,
    coupon_kind: args.couponKind || "3",
    key: args.keyword,
    page: args.page,
    sort_type: "sort_dredisprice_asc",
    filt_type: [
      [
        `dredisprice`,
        `L${args.end_price || 100000000}M${args.start_price || 0}`,
      ].join(","),
      ["redisstore", 1].join(","),
    ].join(";"),
    coupon_aggregation: "yes",
    neverpop: "yes",
    datatype: 1,
    callback: "jdSearchResultBkCbA",
    pagesize: 50,
    ext_attr: "no",
    brand_col: "no",
    price_col: "no",
    color_col: "no",
    size_col: "no",
    ext_attr_sort: "no",
    multi_suppliers: "yes",
    rtapi: "no",
    area_ids: "12,988,47821",
  };
  var { data } = await request.jsonp(
    "https://so.m.jd.com/list/couponSearch._m2wq_list",
    {
      qs: _qs,
    }
  );
  var items = data.searchm.Paragraph.map((item) => {
    return Object.assign(
      {
        id: item.wareid,
        url: `https://item.m.jd.com/product/${item.wareid}.html`,
        title: item.Content.warename,
        price: item.dredisprice,
        img:
          "https://img12.360buyimg.com/mobilecms/s455x455_" +
          item.Content.imageurl,
      },
      item
    );
  });
  var { stockstate } = await request.jsonp(
    "https://wq.jd.com/commodity/skudescribe/get",
    {
      qs: {
        callback: "reaStockAnPriceCbA",
        command: "3",
        source: "wqm_cpsearch",
        priceinfo: "1",
        buynums: Array(items.length)
          .fill(1)
          .join(","),
        skus: items.map(({ id }) => id).join(","),
        area: "1_72_2819_0",
      },
      referer:
        "https://so.m.jd.com/list/couponSearch.action?" + qs_lib.stringify(_qs),
    }
  );
  Object.keys(stockstate.data).forEach((key) => {
    var { a } = stockstate.data[key];
    var item = items.find((item) => item.id === key);
    item.stock = a === "34" ? 0 : 1;
  });
  return {
    more: true,
    items: items.filter((item) => item.stock > 0),
    page: args.page,
  };
}

export async function getGoodsPrice(skuId: string) {
  // 小于0位已下架
  var [{ p }] = await request.jsonp(
    "https://wq.jd.com/pingou_api/getskusprice",
    {
      qs: {
        callback: "jsonp_7689380",
        skuids: skuId,
        area: "",
        platform: 3,
        origin: 2,
        source: "pingou",
        _: Date.now(),
        g_ty: "ls",
      },
    }
  );
  return Number(p);
}

// export async function requestData

type DisCount1 = {
  type: 1;
  needMoney: number;
  rewardMoney: number;
};
type DisCount2 = {
  type: 2;
  needMoney: number;
  rewardMoney: number;
  topMoney: number;
};
type DisCount3 = {
  type: 3;
  needNum: number;
  rebate: number;
};
type DisCount = DisCount1 | DisCount2 | DisCount3;

export async function calcPrice({
  skuId,
  plus = false,
}: {
  skuId: string;
  plus?: boolean;
}) {
  var {
    item,
    price,
    promov2: [{ pis }],
    pingouItem,
    coupons
  } = await getGoodsInfo(skuId);
  if (!coupons) {
    coupons = await queryGoodsCoupon({
      skuId,
      vid: item.venderID,
      cid: item.category[item.category.length - 1],
    });
  }
  pis = pis.filter(({ subextinfo }) => subextinfo);
  // 满199元减80元
  // {"extType":1,"subExtType":1,"subRuleList":[{"needMoney":"199","rewardMoney":"80","subRuleList":[],"subRuleType":1}]}
  // 每满199元，可减100元现金，最多可减800元
  // {"extType":2,"needMoney":"199","rewardMoney":"100","subExtType":8,"subRuleList":[],"topMoney":"800"}
  // 购买1件可优惠换购热销商品
  // {"extType":24,"needNum":"1","subExtType":36,"subRuleList":[]}
  // 满99元减30元，满199元减60元，满299元减90元
  // {"extType":6,"subExtType":14,"subRuleList":[{"needMoney":"99","rewardMoney":"30","subRuleList":[]},{"needMoney":"199","rewardMoney":"60","subRuleList":[]},{"needMoney":"299","rewardMoney":"90","subRuleList":[]}]}
  // 满2件，总价打8折；满3件，总价打7折
  // {"extType":15,"subExtType":23,"subRuleList":[{"needNum":"2","rebate":"8","subRuleList":[]},{"needNum":"3","rebate":"7","subRuleList":[]}]}

  var d1: DisCount[] = [];
  var f = R.compose(
    R.forEach((item: any) => {
      var { extType, subRuleList } = item;
      if (extType === 1 || extType === 6) {
        d1.push(
          ...subRuleList.map(({ needMoney, rewardMoney }) => ({
            type: 1,
            needMoney: Number(needMoney),
            rewardMoney: Number(rewardMoney),
          }))
        );
      } else if (extType === 2) {
        d1.push({
          type: 2,
          needMoney: Number(item.needMoney),
          rewardMoney: Number(item.rewardMoney),
          topMoney: Number(item.topMoney),
        });
      } else if (extType === 15) {
        d1.push(
          ...subRuleList.map(({ needNum, rebate }) => ({
            type: 3,
            needNum: Number(needNum),
            rebate: Number(rebate) / 10,
          }))
        );
      }
    }),
    R.map<any, any>(R.compose(JSON.parse, R.prop("subextinfo")))
  );
  f(pis);
  var d2: DisCount[] = coupons.map((item) => ({
    type: 1,
    needMoney: item.quota,
    rewardMoney: item.discount,
  }));
  var p = Number(price.p);
  if (pingouItem) {
    p = Number(pingouItem.m_bp);
  } else if (plus && price.tpp) {
    p = Number(price.tpp);
  }
  var ret: {
    total: number;
    num: number;
    price: number;
    d: any[];
    total_raw: number;
  }[] = [];
  [...d1, ...d2].forEach((item) => {
    if (item.type === 1 || item.type === 2) {
      let num = item.needMoney / p;
      if (item.needMoney - Math.floor(num) * p >= 1) {
        num++;
      }
      num = Math.floor(num);
      let total_raw = num * p;
      let total = total_raw - item.rewardMoney;
      ret.push({
        total,
        total_raw,
        num,
        price: total / num,
        d: [item],
      });
    } else if (item.type === 3) {
      let num = item.needNum;
      num = Math.floor(num);
      let total_raw = num * p;
      let total = total_raw * item.rebate;
      ret.push({
        total,
        total_raw,
        num,
        price: total / num,
        d: [item],
      });
    }
  });
  function calc1(item1: DisCount1, item2: DisCount1) {
    let maxNeedMoney = Math.max(item1.needMoney, item2.needMoney);
    let num = maxNeedMoney / p;
    if (maxNeedMoney - Math.floor(num) * p >= 1) {
      num++;
    }
    num = Math.floor(num);
    let total_raw = num * p;
    let total = total_raw - item1.rewardMoney - item2.rewardMoney;
    return {
      total,
      num,
      total_raw,
      price: total / num,
      d: [item1, item2],
    };
  }
  function calc2(item1: DisCount2, item2: DisCount1) {
    let maxNeedMoney = Math.max(item1.needMoney, item2.needMoney);
    let num = maxNeedMoney / p;
    if (maxNeedMoney - Math.floor(num) * p >= 1) {
      num++;
    }
    num = Math.floor(num);
    let total_raw = num * p;
    let total =
      num * p -
      Math.min(
        item1.rewardMoney * ((total_raw / item1.needMoney) >> 0),
        item1.topMoney
      ) -
      item2.rewardMoney;
    return {
      total,
      total_raw,
      num,
      price: total / num,
      d: [item1, item2],
    };
  }
  function calc3(item1: DisCount3, item2: DisCount1) {
    let maxNeedMoney = item2.needMoney;
    let num = maxNeedMoney / p;
    if (maxNeedMoney - Math.floor(num) * p >= 1) {
      num++;
    }
    num = Math.floor(num);
    let total_raw = num * p;
    let total = total_raw - total_raw * (1 - item1.rebate) - item2.rewardMoney;
    return {
      total,
      total_raw,
      num,
      price: total / num,
      d: [item1, item2],
    };
  }
  function gcc(a: number, b: number) {
    while (b > 0) {
      let m = b;
      b = a % b;
      a = m;
    }
    return a;
  }
  for (let item1 of d1) {
    for (let item2 of d2) {
      if (item2.type === 1) {
        if (item1.type === 1) {
          ret.push(calc1(item1, item2));
        } else if (item1.type === 2) {
          ret.push(calc2(item1, item2));
        } else if (item1.type === 3) {
          ret.push(calc3(item1, item2));
        }
      } else if (item2.type === 3) {
        if (item1.type === 1) {
          ret.push(calc3(item2, item1));
        } else if (item1.type === 2) {
        } else if (item1.type === 3) {
          let num = gcc(item1.needNum, item2.needNum);
          let total_raw = p * num;
          let total = total_raw * (1 - (1 - item1.rebate) - (1 - item2.rebate));
          ret.push({
            total,
            total_raw,
            num,
            price: total / num,
            d: [item1, item2],
          });
        }
      }
    }
  }
  if (!ret.find((item) => item.num === 1)) {
    ret.push({
      total: p,
      num: 1,
      price: p,
      d: [],
      total_raw: p,
    });
  }
  return R.uniqBy<any, any>((item) => item.num)(
    ret.sort((item1, item2) => item1.price - item2.price)
  );
}

export async function getStock(
  skuNumList: {
    skuId: string;
    num: string;
  }[],
  address: any
) {
  var res = await request.post(
    "https://trade.jd.com/api/v1/batch/stock",
    {
      skuNumList,
      areaRequest: {
        provinceId: address.provId,
        cityId: address.cityId,
        countyId: address.countyId,
        townId: address.townId,
      },
      coordnateRequest: {
        longtitude: address.longitude / 1000000 + "",
        latitude: address.latitude / 1000000 + "",
      },
    },
    {
      referer: "https://trade.jd.com/shopping/order/getOrderInfo.action",
      headers: {
        "x-requested-with": "XMLHttpRequest",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36",
      },
    }
  );
  return res.result;
}

export async function getGoodsCollection(page = 1) {
  var data = await request.jsonp(
    `https://wq.jd.com/fav/comm/FavCommQueryFilter?cp=${page}&pageSize=10&category=0&promote=0&cutPrice=0&coupon=0&stock=0&areaNo=1_72_4139_0&_=1567754146891&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_ty=ls`
  );
  var items = data.map((item) =>
    Object.assign(item, {
      title: item.commTitle,
      img: item.imageUrl,
      id: item.commId,
    })
  );
  return {
    items,
    more: items.length > 0,
  };
}

export function delGoodsCollection(items: any[]) {
  return Promise.all(
    items.map((item) =>
      request.jsonp(
        `https://wq.jd.com/fav/comm/FavCommDel?commId=${item.commId}&_=1567754783171&sceneval=2&g_login_type=1&callback=jsonpCBKII&g_ty=ls`
      )
    )
  );
}

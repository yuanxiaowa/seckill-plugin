import { requestData } from "./tools";
import { ArgSearch } from "./structs";
import { request } from "../common/request";
import { getJuhuasuanList } from "./juhuasuan";

export const getItemId = (url: string) => /id=(\d+)/.exec(url)![1];
export function getGoodsUrl(id) {
  return `https://detail.tmall.com/item.htm?id=${id}`;
}

export async function getGoodsSkus({ url }: { url: string }) {
  let itemId = getItemId(url);
  let { item, prop, skuMap } = await request.get(
    `https://tbskip.taobao.com/json/item_sku.do?item_num_id=${itemId}&_ksTS=1593914768673_421`
  );
  let minPrice = item.price / 100;
  let maxPrice = minPrice;
  let skus = [];
  if (prop) {
    const cates = Object.keys(prop).map((key) => ({
      key,
      item: prop[key],
    }));
    const propSerials = Object.keys(skuMap)[0]
      .split(";")
      .slice(1, -1)
      .map((key) => cates.find(({ item }) => item[key]));
    function handle(i, keys) {
      let prop = propSerials[i]!;
      if (i === propSerials.length - 1) {
        return Object.keys(prop.item)
          .map((value) => {
            const key = [...keys, value, ""].join(";");
            const item = skuMap[key];
            if (!item) {
              return;
            }
            let price = item.price / 100;
            maxPrice = Math.max(price, maxPrice);
            return {
              name: prop.key,
              label: prop.item[value][0],
              value,
              children: [
                {
                  label: `￥${price}，${item.stock}`,
                  value: item.skuId,
                },
              ],
            };
          })
          .filter(Boolean);
      }
      return Object.keys(prop.item).map((value) => ({
        name: prop.key,
        label: prop.item[value][0],
        value,
        children: handle(i + 1, [...keys, value]),
      }));
    }
    skus = handle(0, [""]);
  }
  return {
    skus: {
      children: skus,
    },
    price: [...new Set([minPrice, maxPrice])].join("-"),
    quantity: +item.stock,
  };
}

export async function getGoodsDetail(url: string) {
  var itemId = getItemId(url);
  /* 
    ttid: "2017@taobao_h5_6.6.0",
    AntiCreep: "true",
   */
  var { apiStack, item, skuBase: p_skuBase } = await requestData(
    "mtop.taobao.detail.getdetail",
    {
      data: { itemNumId: itemId },
      version: "6.0",
    }
  );
  let { skuBase, skuCore } = JSON.parse(apiStack[0].value);
  let sku_ret;
  let quantity = 0;
  let price: string = "0";
  if (!skuBase) {
    skuBase = p_skuBase;
  }
  if (skuBase) {
    let { props, skus } = skuBase;
    let sortOrders = props
      .map(({ values }, index) => ({
        sortOrder: +values[0].sortOrder,
        index,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ index }) => index);
    function f(i, vids: string[]) {
      var parent = {
        pid: props[i].pid,
        name: props[i].name,
        children: props[i].values
          .map((item) => {
            var data: any = {
              value: item.vid,
              label: item.name,
            };
            vids[i] = props[i].pid + ":" + item.vid;
            if (i < props.length - 1) {
              Object.assign(data, f(i + 1, vids));
            } else {
              let vid_str = sortOrders.map((i) => vids[i]).join(";");
              let sku = skus.find((item) => item.propPath === vid_str);
              if (!sku) {
                return;
              }
              let { skuId } = sku;
              let { quantity, price } = skuCore.sku2info[skuId];
              // if (+quantity === 0) {
              //   return;
              // }
              data.children = [
                {
                  label: `￥${price.priceText}, ${quantity}`,
                  value: skuId,
                },
              ];
            }
            return data;
          })
          .filter(Boolean),
      };
      return parent;
    }
    sku_ret = f(0, []);
  }
  if (skuCore && skuCore.sku2info) {
    if (skuCore.sku2info[0]) {
      quantity = +skuCore.sku2info[0].quantity;
      price = skuCore.sku2info[0].price.priceText;
    }
  }
  return { skus: sku_ret, item, title: item.title, quantity, price };
}

export async function getGoodsInfo(url: string, skuId?: string) {
  var itemId = getItemId(url);
  var data = await requestData("mtop.taobao.detail.getdetail", {
    data: { itemNumId: itemId },
    version: "6.0",
  });
  return transformMobileGoodsInfo(data, skuId);
}

function transformMobileGoodsInfo({ apiStack, item }, skuId?: string) {
  let { delivery, trade, skuBase, skuCore, price } = JSON.parse(
    apiStack[0].value
  );
  let buyEnable = trade.buyEnable === "true";
  let cartEnable = trade.cartEnable === "true";
  let msg: string | undefined;
  let cuxiao: any;
  let quantity = 0;
  if (!buyEnable) {
    if (trade.hintBanner) {
      msg = trade.hintBanner.text;
    } else {
      msg = trade.reason;
    }
  }
  if (!skuId) {
    skuId = "0";
  }
  /* if (skuBase && skuBase.props) {
    if (skus) {
      let propPath = skuBase.props
        .map(
          ({ pid, values }, i) =>
            `${pid}:${
              values[((skus[i] || 0) + values.length) % values.length].vid
            }`
        )
        .join(";");
      let skuItem = skuBase.skus.find(item => item.propPath === propPath);
      if (!skuItem) {
        throwError("指定商品型号不存在");
      } else {
        skuId = skuItem.skuId;
      }
    }
  } */
  if (skuCore) {
    if (skuId === "0") {
      let min = Infinity;
      for (let key of Object.keys(skuCore.sku2info)) {
        if (key === "0") {
          continue;
        }
        let { price, quantity } = skuCore.sku2info[key];
        if (price.priceText.includes("-") || !(Number(quantity) > 0)) {
          continue;
        }
        let p = Number(price.priceText);
        if (p < min) {
          min = p;
          skuId = key;
        }
      }
    }
    let item = skuCore.sku2info[skuId];
    if (item) {
      quantity = Number(item.quantity);
      price = item;
    }
  }
  if (price.shopProm) {
    cuxiao = price.shopProm.map(
      (p: { type: number; content: string[]; title: string }) => {
        var quota = 0;
        var discount = 1;
        var amount = 1;
        if (p.type === 3) {
          // 满多少件打折
          let arr = /满(\d+)件,打(\d+)折/.exec(p.content[0])!;
          amount = +arr[1];
          discount = +arr[2] / 10;
        } else if (p.type === 5) {
          // 送积分
          discount = Number(/(\d+)/.exec(p.content[0]![1]));
        }
        return {
          type: p.type,
          title: p.title,
          quota,
          discount,
          amount,
        };
      }
    );
  }
  return {
    itemId: item.itemId,
    title: item.title,
    quantity,
    buyEnable,
    cartEnable,
    msg,
    skuId,
    delivery,
    price: +price.price.priceText,
    cuxiao,
  };
}

/**
 * 搜索商品
 * @param data
 */
export async function getGoodsList(data: ArgSearch) {
  var page = data.page;
  if (data.is_juhuasuan) {
    return getJuhuasuanList({ page, force_update: data.force_update });
  }
  var q = data.keyword;
  delete data.page;
  delete data.keyword;
  var qs = Object.assign(
    {
      page_size: 20,
      sort: "p",
      type: "p",
      q,
      page_no: page,
      spm: "a220m.6910245.a2227oh.d100",
      from: "mallfp..m_1_searchbutton",
    },
    data
  );
  var { total_page, item } = await request.get(
    "https://list.tmall.com/m/search_items.htm",
    {
      // page_size=20&sort=s&page_no=1&spm=a3113.8229484.coupon-list.7.BmOFw0&g_couponFrom=mycoupon_pc&g_m=couponuse&g_couponId=2995448186&g_couponGroupId=121250001&callback=jsonp_90716703
      qs,
      referer: "https://list.tmall.com/coudan/search_product.htm",
    }
  );
  return {
    total: total_page,
    page,
    items: item.map((item) =>
      Object.assign(item, {
        url: "https:" + item.url,
        img: "https:" + item.img,
      })
    ),
  };
}

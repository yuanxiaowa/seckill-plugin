import { ArgSearch } from "../structs";
import { getJuhuasuanList } from "./juhuasuan";
import { request } from "@/background/common/request";
import { requestData } from "../tools";
import { formatUrl } from "@/background/common/tool";
import getShoudanList from "./shoudan";

/**
 * 搜索商品
 * @param data
 */
export async function getGoodsList(data: Partial<ArgSearch>) {
  var page = data.page;
  if (data.searchType === "juhuasuan") {
    return getJuhuasuanList({ page });
  }
  if (data.searchType === "shop") {
    return getShopGoodsList(data);
  }
  if (data.searchType === "shoudan") {
    return getShoudanList(data);
  }
  var q = data.keyword;
  delete data.page;
  delete data.keyword;
  delete data.end_price;
  delete data.searchType;
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
        url: formatUrl(item.url),
        img: formatUrl(item.img),
      })
    ),
    more: item.length > 0,
  };
}

export async function getShopGoodsList({
  page = 1,
  shopId,
  sellerId,
  start_price,
}: Partial<ArgSearch>) {
  var { itemsArray, totalResults, totalPage } = await requestData(
    "mtop.taobao.wsearch.appsearch",
    {
      data: {
        m: "shopitemsearch",
        vm: "nw",
        sversion: "4.6",
        shopId,
        sellerId,
        style: "wf",
        page,
        sort: "bid",
        catmap: "",
        wirelessShopCategoryList: "",
        start_price,
      },
      version: "1.0",
    }
  );
  return {
    total: Number(totalResults),
    page,
    items: itemsArray.map((item) => ({
      ...item,
      url: formatUrl(item.auctionUrl),
      img: formatUrl(item.pic_path),
    })),
    more: page < Number(totalPage),
  };
}

import { ArgSearch } from "../structs";
import { getJuhuasuanList } from "./juhuasuan";
import { request } from "@/background/common/request";

/**
 * 搜索商品
 * @param data
 */
export async function getGoodsList(data: ArgSearch) {
  var page = data.page;
  if (data.is_juhuasuan) {
    return getJuhuasuanList({ page });
  }
  var q = data.keyword;
  delete data.page;
  delete data.keyword;
  delete data.end_price;
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
    more: item.length > 0,
  };
}

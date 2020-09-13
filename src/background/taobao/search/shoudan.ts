import { request } from "@/background/common/request";
import { getGoodsUrl } from "../goods";

const getShoudanGetUrls = () =>
  [
    {
      itemid: "588459822182",
      itemshorttitle:
        "买一送一星纯灰绿美瞳女年抛大混血欧美小直径卡乐芙男半年抛日抛",
      activityid: "",
    },
    {
      itemid: "546011914384",
      itemshorttitle:
        "儿童自行车灯铃铛喇叭超响夜骑强光车前灯通用单车配件山地车车铃",
      activityid: "",
    },
  ].map((item) => ({
    title: item.itemshorttitle,
    url: getGoodsUrl(item.itemid),
    price: 0,
  }));

const fetcherMap = {
  // http://cms.molong666.cn/?yunzk=1#/pages/shoudan
  async molong666({ page, keyword }) {
    var {
      data: { data, currentPage, totalPages },
    } = await request.form("https://api.cmsv5.iyunzk.com/apis/Shoudan/goods", {
      activeType: "7",
      sidx: "hot",
      orderType: "p",
      size: 100,
      isJb: "0",
      order: "asc",
      page,
      keyword,
      catagoryId: "",
      site_id: "8925",
      channel_id: "",
      uid: "",
      cms_request: "1",
      device_type: "web",
    });
    const items = data.map((item) => ({
      ...item,
      url: item.auctionUrl,
      img: item.pictUrl,
      price: item.couponZkFinalPrice,
      title: item.shortTitle,
    }));
    if (currentPage === 1) {
      items.unshift(...getShoudanGetUrls());
    }
    return {
      more: currentPage < totalPages,
      page: currentPage,
      items,
    };
  },
  // http://www.ad2.store/firstorder.html?id=69711
  // http://www.bei7.store/firstorder.html?id=60979
  async haodanku({ page, keyword }) {
    var { data, count_page } = await request.get(
      `https://www.haodanku.com/activity/ActivityFristOrderItems`,
      {
        qs: {
          cat_id: "0",
          order: "3",
          p: page,
          keyword,
          received_price: "2",
        },
      }
    );
    const items = data.map((item) => ({
      ...item,
      img: item.itempic,
      url: getGoodsUrl(item.itemid),
      couponUrl: item.couponurl,
      price: item.itemendprice,
      title: item.itemtitle,
    }));
    if (+page === 1) {
      items.unshift(...getShoudanGetUrls());
    }
    return {
      more: +page < count_page,
      page,
      items,
    };
  },
};

export default async function getShoudanList({
  page = 1,
  keyword,
  subSearchType,
}: any) {
  return fetcherMap[subSearchType]({
    page,
    keyword,
  });
}

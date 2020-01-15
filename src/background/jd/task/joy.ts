import { request } from "@/background/common/request";
import { requestRaw } from "./tools";

async function getPetTaskConfig(taskType) {
  var { datas } = await request.get(
    "https://jdjoy.jd.com/pet/getPetTaskConfig?reqSource=h5"
  );
  return datas.find(item => item.taskType === taskType)!;
}

export const joy_tasks = [
  {
    title: "宠物馆签到",
    test() {
      return true;
    },
    async doTask() {
      await requestRaw(
        "https://api.m.jd.com/client.action?functionId=userSign",
        `body=%7B%22params%22%3A%22%7B%5C%22enActK%5C%22%3A%5C%226DiDTHMDvpNyoP9JUaEkki%2FsREOeEAl8M8REPQ%2F2eA4aZs%2Fn4coLNw%3D%3D%5C%22%2C%5C%22isFloatLayer%5C%22%3Afalse%2C%5C%22ruleSrv%5C%22%3A%5C%2200000392_26600662_t1%5C%22%2C%5C%22signId%5C%22%3A%5C%22Nk2fZhdgf5UaZs%2Fn4coLNw%3D%3D%5C%22%7D%22%2C%22riskParam%22%3A%7B%22platform%22%3A%223%22%2C%22orgType%22%3A%222%22%2C%22openId%22%3A%22-1%22%2C%22pageClickKey%22%3A%22Babel_Sign%22%2C%22eid%22%3A%22I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ%22%2C%22fp%22%3A%22-1%22%2C%22shshshfp%22%3A%2242164fbe34cb8f2e78f5cdc8ccdc241a%22%2C%22shshshfpa%22%3A%22a7064873-7229-2b70-3d19-1adb550c8c11-1578403003%22%2C%22shshshfpb%22%3A%22uFbABc%2BVH0lVNpFqvpJ%2FPZw%3D%3D%22%2C%22childActivityUrl%22%3A%22https%3A%2F%2Fpro.m.jd.com%2Fmall%2Factive%2F3GCjZzanFWbJEU4xYEjqfPfovokM%2Findex.html%3FcollectionId%3D98%26lng%3D116.41025%26lat%3D39.916411%26un_area%3D1_2802_2821_0%26sid%3D73641a5080591420c05145a27b66212w%22%7D%2C%22siteClient%22%3A%22android%22%2C%22mitemAddrId%22%3A%22%22%2C%22geo%22%3A%7B%22lng%22%3A%22116.41025%22%2C%22lat%22%3A%2239.916411%22%7D%2C%22addressId%22%3A%220%22%2C%22posLng%22%3A%22%22%2C%22posLat%22%3A%22%22%2C%22focus%22%3A%22%22%2C%22innerAnchor%22%3A%22%22%2C%22cv%22%3A%222.0%22%7D&screen=750*1334&client=wh5&clientVersion=1.0.0&sid=73641a5080591420c05145a27b66212w&uuid=865166029777979-008114eccc76&area=1_2802_2821_0`
      );
    }
  },
  {
    title: "每日签到",
    async test() {
      return (
        (await getPetTaskConfig("SignEveryDay")).taskStatus === "processing"
      );
    },
    async doTask() {
      return request.get("https://jdjoy.jd.com/pet/sign?taskType=SignEveryDay");
    }
  },
  {
    title: "关注店铺",
    async list() {
      var { followShops, taskChance } = await getPetTaskConfig("FollowShop");
      return followShops /* .slice(0, taskChance) */
        .filter(item => !item.status);
    },
    async doTask({ shopId }) {
      /* await requestRaw(
        "https://jdjoy.jd.com/pet/followShop",
        `shopId=${shopId}`
      ); */
      return request.form("https://jdjoy.jd.com/pet/followShop", {
        shopId
      });
    }
  },
  {
    title: "每日三餐",
    async period() {
      var {
        threeMealsVO: {
          breakfastStart,
          breakfastEnd,
          lunchStart,
          lunchEnd,
          dinnerStart,
          dinnerEnd
        }
      } = await getPetTaskConfig("ThreeMeals");
      return [
        [breakfastStart, breakfastEnd],
        [lunchStart, lunchEnd],
        [dinnerStart, dinnerEnd]
      ];
    },
    async doTask() {
      await request.get("https://jdjoy.jd.com/pet/getFood?taskType=ThreeMeals");
    }
  },
  {
    title: "逛会场",
    async list() {
      var { scanMarketList } = await getPetTaskConfig("ScanMarket");
      return scanMarketList.filter(item => !item.status);
    },
    async doTask({ marketLinkH5 }) {
      await request.post("https://jdjoy.jd.com/pet/scan", {
        marketLink: marketLinkH5,
        taskType: "ScanMarket",
        reqSource: "h5"
      });
    }
  },
  {
    title: "关注商品",
    async list() {
      var { followGoodList } = await getPetTaskConfig("FollowGood");
      return followGoodList.filter(item => !item.status);
    },
    async doTask({ sku }) {
      await request.post(
        "https://jdjoy.jd.com/pet/followGood",
        { sku },
        {
          dataType: "form"
        }
      );
    }
  },
  {
    title: "浏览频道",
    async list() {
      var { followGoodList, followChannelList } = await getPetTaskConfig(
        "FollowChannel"
      );
      return (followChannelList || followGoodList).filter(item => !item.status);
    },
    async doTask({ channelId }) {
      await request.post("https://jdjoy.jd.com/pet/scan", {
        channelId,
        taskType: "FollowChannel"
      });
    }
  },
  {
    title: "浏览商品奖励积分",
    async list() {
      var {
        data: { deskGoods }
      } = await request.get("https://jdjoy.jd.com/pet/getDeskGoodDetails");
      return deskGoods.filter(item => !item.status);
    },
    async doTask({ sku }) {
      await request.post("https://jdjoy.jd.com/pet/scan", {
        taskType: "ScanDeskGood",
        sku
      });
    }
  }
];

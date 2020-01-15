import { request } from "@/background/common/request";

async function getPetTaskConfig(taskType) {
  var { datas } = await request.get(
    "https://jdjoy.jd.com/pet/getPetTaskConfig?reqSource=h5"
  );
  return datas.find(item => item.taskType === taskType)!;
}

export const joy_tasks = [
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
    async doTask({ marketLink }) {
      await request.post("https://jdjoy.jd.com/pet/scan", {
        marketLink,
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

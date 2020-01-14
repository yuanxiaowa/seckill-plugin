import { requestRaw, requestRawGet } from "./tools";

export const joy_tasks = [
  {
    title: "签到",
    async test() {
      return true;
    },
    async doTask() {
      return requestRawGet(
        "https://jdjoy.jd.com/pet/sign?taskType=SignEveryDay"
      );
    }
  },
  {
    title: "宠物关注店铺领奖励",
    async list() {
      var { datas } = await requestRawGet(
        "https://jdjoy.jd.com/pet/getFollowShops"
      );
      return datas.slice(0, 5).filter(item => !item.status);
    },
    async doTask(item) {
      await requestRaw(
        "https://jdjoy.jd.com/pet/followShop",
        `shopId=${item.shopId}`
      );
    }
  }
];

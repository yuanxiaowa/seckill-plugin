import { request } from "@/background/common/request";
import moment from "moment";
import { delay } from "@/background/common/tool";

function requestData(functionId: string, body?: any) {
  return request.get("https://api.m.jd.com/client.action", {
    qs: {
      functionId,
      body: JSON.stringify(Object.assign({ version: 2, channel: 1 }, body)),
      appid: "wh5"
    }
  });
}

function getMeta() {
  return requestData("taskInitForFarm");
}

export const farm_tasks = [
  {
    title: "农场任务",
    async list() {
      await delay(120 * 1000);
      var { signInit, firstWaterInit, gotBrowseTaskAdInit } = await getMeta();
      var items: any[] = [];
      if (!signInit.f) {
        items.push({
          functionId: "signForFarm",
          body: { type: 0, version: 2, channel: 1 }
        });
      }
      if (!firstWaterInit.f) {
      }
      if (true) {
        items.push({
          functionId: "gotNewUserTaskForFarm"
        });
      }
      if (!gotBrowseTaskAdInit.f) {
        for (let {
          advertId,
          limit,
          hadFinishedTimes,
          hadGotTimes
        } of gotBrowseTaskAdInit.userBrowseTaskAds) {
          if (hadFinishedTimes < limit) {
            items.push({
              functionId: "browseAdTaskForFarm",
              body: { advertId, type: 0, version: 2, channel: 1 }
            });
          }
          if (hadGotTimes < limit) {
            items.push({
              functionId: "browseAdTaskForFarm",
              body: { advertId, type: 1, version: 2, channel: 1 }
            });
          }
        }
      }
      return items;
    },
    async doTask({ functionId, body }) {
      await requestData(functionId, body);
    }
  },
  {
    title: "定时领水",
    async period() {
      var { gotThreeMealInit } = await getMeta();
      return gotThreeMealInit.threeMealTimes.map(s =>
        s.split("-").map(h => moment(h, "HH").valueOf())
      );
    },
    async doTask() {
      return requestData("gotThreeMealForFarm", { type: 0 });
    }
  },
  {
    title: "收集水滴雨",
    async nextTime() {
      var {
        waterRainInit: { config, f, lastTime }
      } = await getMeta();
      if (f) {
        return;
      }
      return lastTime + config.intervalTime * 60 * 60 * 1000;
    },
    async doTask() {
      return requestData("waterRainForFarm", { type: 1, version: 2 });
    }
  },
  {
    title: "浇水",
    async test() {
      return true;
    },
    async doTask() {
      var { firstWaterInit, totalWaterTaskInit } = await getMeta();
      var count = 10 - firstWaterInit.totalWaterTimes;
      for (let i = 0; i < count; i++) {
        await requestData("waterGoodForFarm");
      }
      if (!firstWaterInit.f) {
        await requestData("firstWaterTaskForFarm");
      }
      if (!totalWaterTaskInit.f) {
        await requestData("totalWaterTaskForFarm");
      }
    }
  }
];

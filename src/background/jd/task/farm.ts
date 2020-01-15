import { request } from "@/background/common/request";

function requestData(functionId: string, body?: any) {
  return request.get("https://api.m.jd.com/client.action", {
    qs: {
      functionId,
      body: JSON.stringify(Object.assign({ version: 2, channel: 1 }, body)),
      appid: "wh5"
    }
  });
}

export const farm_tasks = [
  {
    title: "农场任务",
    async list() {
      var {
        gotThreeMealInit,
        signInit,
        firstWaterInit,
        waterRainInit,
        gotBrowseTaskAdInit
      } = await requestData("taskInitForFarm");
      var items: any[] = [];
      if (!signInit.f) {
        items.push({
          functionId: "signForFarm",
          body: { type: 0, version: 2, channel: 1 }
        });
      }
      if (!gotThreeMealInit.f) {
        items.push({
          functionId: "gotThreeMealForFarm",
          body: { type: 0 }
        });
      }
      if (!firstWaterInit.f) {
        for (let i = 0; i < 10 - firstWaterInit.totalWaterTimes; i++) {
          items.push({
            functionId: "waterGoodForFarm"
          });
        }
        items.push({
          functionId: "firstWaterTaskForFarm"
        });
      }
      if (!waterRainInit.f) {
        // 每天两次，间隔3小时
        items.push({
          functionId: "waterRainForFarm",
          body: { type: 1, version: 2 }
        });
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
  }
];

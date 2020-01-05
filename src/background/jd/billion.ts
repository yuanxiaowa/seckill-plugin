import { request } from "../common/request";
import { taskManager } from "../common/task-manager";
import moment from "moment";

export async function getBillionList({ url }) {
  var {
    data: { billionFloor, hotFloor }
  } = await request.post(
    "https://api.m.jd.com/client.action?functionId=getBillionSubsidyInfo&body=%7B%22source%22%3A%22home_subsidy%22%7D&client=m&appid=XPMSGC2019&area=&geo=%5Bobject%20Object%5D",
    undefined,
    {
      referer: url,
      headers: {
        _origin: "https://story.m.jd.com"
      }
    }
  );

  return [
    ...hotFloor.resultList,
    ...billionFloor.resultList,
    ...billionFloor.advanceList
  ].map(item =>
    Object.assign(item, {
      url: `https://item.jd.com/${item.skuId}.html`,
      referer: url,
      disCount: Number(item.disCount),
      pDisCount: Number(item.pDisCount)
    })
  );
}

export async function getBillion(item) {
  // {"code":999,"drawNum":1,"resultMsg":"领取成功！感谢您的参与，祝您购物愉快~","status":1}
  // {"code":17,"drawNum":3,"resultMsg":"此券已经被抢完了，下次记得早点来哟~","status":-1}
  var { code, resultMsg } = await request.post(
    "https://api.m.jd.com/client.action",
    undefined,
    {
      referer: item.referer,
      headers: {
        _origin: "https://story.m.jd.com"
      },
      qs: {
        functionId: "receiveSeckillCoupon",
        body: JSON.stringify({
          roleId: item.putKey,
          key: 60,
          skuId: item.skuId,
          quota: item.quota,
          disCount: item.disCount,
          batchId: item.batchId,
          source: "home_subsidy",
          floorType: "2"
        }),
        client: "m",
        appid: "XPMSGC2019"
      }
    }
  );
  if (code === 16 || code === 17) {
    let date: moment.Moment;
    if (code === 16) {
      let s = /(\d{2}:\d{2})/.exec(resultMsg)![1];
      date = moment(s, "HH:mm");
      if (s === "00:00") {
        date = date.add("d", 1);
      }
    } else {
      date = moment(item.nextTime);
    }
    (async () => {
      await taskManager.registerTask(
        {
          name: item.skuName,
          platform: "jingdong",
          comment: "京东百亿补贴",
          time: date.valueOf()
        },
        date.valueOf()
      );
      return getBillion(item);
    })();
  }
  return { data: item.skuName + "\n" + resultMsg, code: 0 };
}

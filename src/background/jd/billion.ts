import { request } from "../common/request";
import { taskManager } from "../common/task-manager";
import moment from "moment";

export async function getBillionList({ url }) {
  if (url.startsWith("https://story.m.jd.com")) {
    return getBillionList1(url);
  }
  return getBillionList2(url);
}
export async function getBillionList1(url: string) {
  var {
    data: { billionFloor, hotFloor },
  } = await request.post(
    "https://api.m.jd.com/client.action?functionId=getBillionSubsidyInfo&body=%7B%22source%22%3A%22home_subsidy%22%7D&client=m&appid=XPMSGC2019&area=&geo=%5Bobject%20Object%5D",
    undefined,
    {
      referer: url,
      headers: {
        _origin: "https://story.m.jd.com",
      },
    }
  );

  return [
    ...hotFloor.resultList,
    ...billionFloor.resultList,
    ...billionFloor.advanceList,
  ].map((item) =>
    Object.assign(item, {
      url: `https://item.jd.com/${item.skuId}.html`,
      referer: url,
      disCount: Number(item.disCount),
      pDisCount: Number(item.pDisCount),
      type: 1,
    })
  );
}

export async function getBillionList2(url) {
  var {
    data: {
      billionAllowanceHighCouponList: { list },
    },
  } = await request.post(
    "https://api.m.jd.com/client.action",
    {
      functionId: "qryCompositeMaterials",
      uuid: "1563154528363471128418",
      area: "",
      body: JSON.stringify({
        qryParam: JSON.stringify([
          {
            type: "advertGroup",
            id: "04492754",
            mapTo: "billionAllowanceFloorTitleBg",
          },
          {
            type: "advertGroup",
            id: "04942094",
            mapTo: "billionAllowancePreCouponList",
            next: [
              {
                type: "advertGroup",
                mapKey: "comment[1]",
                mapTo: "OrderConfig",
              },
            ],
          },
          {
            type: "advertGroup",
            id: "04942107",
            mapTo: "billionAllowanceHighCouponList",
            next: [
              {
                type: "advertGroup",
                mapKey: "comment[1]",
                mapTo: "OrderConfig",
              },
              {
                type: "productSku",
                mapKey: "extension.cpSkuId",
                mapTo: "product",
              },
            ],
          },
        ]),
        pageId: "1426387",
        activityIdRaw: "00576882",
        previewTime: "",
        platform: "APP/m",
      }),
      clientVersion: "1.0.0",
      client: "wh5",
    },
    {
      referer: url,
      dataType: "form",
    }
  );
  var activityId = /active\/(\w+)/.exec(url)![1];
  var ret = list.map(({ extension, next: { OrderConfig, product } }, i) => {
    var item = product.data.list[0];
    var nextTime;
    if (OrderConfig) {
      nextTime = moment(parseInt(OrderConfig.stageName) + "", "HH").valueOf();
    } else {
    }
    return {
      skuName: item.name,
      skuImage: item.skuImage,
      p: Number(item.pPrice),
      pDisCount: item.pPrice - extension.disCount,
      disCount: extension.disCount,
      type: 2,
      activityId,
      key: extension.key,
      roleId: extension.roleId,
      url: `https://item.jd.com/${item.skuId}.html`,
      referer: url,
      nextTime,
    };
  });
  console.log(ret);
  return ret;
}

export async function getBillion(item) {
  if (item.type === 1) {
    return getBillion1(item);
  }
  return getBillion2(item);
}

export async function getBillion1(item) {
  // {"code":999,"drawNum":1,"resultMsg":"领取成功！感谢您的参与，祝您购物愉快~","status":1}
  // {"code":17,"drawNum":3,"resultMsg":"此券已经被抢完了，下次记得早点来哟~","status":-1}
  var { code, resultMsg } = await request.post(
    "https://api.m.jd.com/client.action",
    undefined,
    {
      referer: item.referer,
      headers: {
        _origin: "https://story.m.jd.com",
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
          floorType: "2",
        }),
        client: "m",
        appid: "XPMSGC2019",
      },
    }
  );
  console.log(item.skuName, code, resultMsg);
  if (code === 16 || code === 17) {
    let date: moment.Moment;
    let arr = /(\d{2}:\d{2})/.exec(resultMsg);
    if (arr) {
      date = moment(arr[1], "HH:mm");
      if (arr[1] === "00:00") {
        date = date.add("d", 1);
      }
    } else {
      date = moment(item.nextTime);
      if (Date.now() > date.valueOf() + 1000) {
        return;
      }
    }
    (async () => {
      await taskManager.registerTask(
        {
          name: item.skuName,
          platform: "jingdong",
          comment: "京东百亿补贴",
          time: date.valueOf(),
        },
        date.valueOf()
      );
      return getBillion(item);
    })();
  }
  return { data: item.skuName + "\n" + resultMsg, code: 0 };
}

export async function getBillion2(item) {
  var { subCodeMsg, subCode } = await request.post(
    "https://api.m.jd.com/client.action",
    {
      functionId: "newBabelAwardCollection",
      body: JSON.stringify({
        activityId: item.activityId,
        scene: 1,
        args: `roleId=${item.roleId},key=${item.key}`,
      }),
      clientVersion: "1.0.0",
      client: "wh5",
    },
    {
      referer: item.referer,
      dataType: "form",
    }
  );
  // {"subCodeMsg":"本时段优惠券已抢完，请14:00再来吧！","subCode":"D2","code":"0","msg":null}
  // Apple 苹果 iPhone 11 手机 黑色 全网通128G A25 活动太火爆，休息一会再来哟~~
  // 鲜本味 德国罗曼白羽鸡蛋 30枚 1.35kg 粉壳蛋年货礼盒 A16 您提交过于频繁，过一会再试试吧~
  console.log(item.skuName, subCode, subCodeMsg);
  if (/(\d{2}:\d{2})/.test(subCodeMsg)) {
    let nextTime = moment(RegExp.$1, "HH:mm").valueOf();
    await taskManager.registerTask(
      {
        name: item.skuName,
        platform: "jingdong",
        comment: "京东百亿补贴",
        time: nextTime,
      },
      nextTime
    );
    return getBillion2(item);
  }
}

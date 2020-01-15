import { flatten } from "ramda";
import { delay } from "../../common/tool";
import { request } from "../../common/request";

async function requestData({
  functionId,
  data
}: {
  functionId: string;
  data: any;
  method?: "get" | "post";
}) {
  var res = await request({
    url: "https://api.m.jd.com/client.action",
    data: {
      functionId,
      body: JSON.stringify(data),
      client: "wh5",
      clientVersion: "1.0.0"
    },
    method: "post",
    dataType: "form",
    headers: {
      "_user-agent":
        "jdapp;iPhone;8.4.2;13.3;38276cc01428d153b8a9802e9787d279e0b5cc85;network/wifi;ADID/3D52573B-D546-4427-BC41-19BE6C9CE864;supportApplePay/3;hasUPPay/1;pushNoticeIsOpen/0;model/iPhone9,2;addressid/1264128857;hasOCPay/0;appBuild/166820;supportBestPay/0;pv/976.14;apprpd/Home_Main;ref/JDWebViewController;psq/13;ads/;psn/38276cc01428d153b8a9802e9787d279e0b5cc85|4642;jdv/0|kong|t_1001480949_|jingfen|c0aa745595be4d9bba7a7c422bd878d3|1578709542835|1578709548;adk/;app_device/IOS;pap/JA2015_311210|8.4.2|IOS 13.3;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
    }
  });
  var code = Number(res.code);
  if (code === 0) {
    return res.data;
  }
  if (code === 2) {
    return requestData({
      functionId,
      data
    });
  }
  throw new Error(res.msg);
}

export const nianshou_tasks = [
  {
    title: "年兽任务",
    async list() {
      var {
        result: { taskVos }
      } = await requestData({
        functionId: "bombnian_getTaskDetail",
        data: {},
        method: "post"
      });
      var items = taskVos.slice(1);
      return flatten(
        items.map(item => {
          if (item.status !== 1) {
            return [];
          }
          var key = Object.keys(item).find(key => Array.isArray(item[key]))!;
          var subitems: any[];
          if (key) {
            subitems = item[key];
          } else {
            if (item.simpleRecordInfoVo) {
              subitems = [item.simpleRecordInfoVo];
            } else {
              return;
            }
          }
          return subitems
            .filter(subitem => subitem.status === 1)
            .map(subitem =>
              Object.assign(subitem, {
                waitDuration: item.waitDuration,
                taskId: item.taskId
              })
            );
        })
      );
    },
    async doTask(item) {
      await requestData({
        functionId: "tc_doTask_mongo",
        data: {
          taskToken: item.taskToken,
          actionType: 1
        },
        method: "post"
      });
      await delay(item.waitDuration + 2000);
      await requestData({
        functionId: "bombnian_collectScore",
        data: {
          taskId: item.taskId,
          itemId: item.itemId
        },
        method: "post"
      });
    }
  },
  {
    title: "炸年兽",
    async test() {
      return true;
    },
    async doTask() {
      while (true) {
        let { success } = requestData({
          functionId: "bombnian_raise",
          data: {},
          method: "post"
        });
        if (!success) {
          return;
        }
      }
    }
  }
];

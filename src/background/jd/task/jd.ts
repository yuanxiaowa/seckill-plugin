import { requestDataByFunction, requestRaw } from "./tools";
import { request } from "@/background/common/request";

export function signInJd() {
  return requestDataByFunction(
    "signBeanIndex",
    {
      jda: "-1",
      monitor_source: "bean_app_bean_index",
      shshshfpb: "",
      fp: "-1",
      eid: "",
      shshshfp: "-1",
      monitor_refer: "",
      userAgent: "-1",
      rnVersion: "4.0",
      shshshfpa: "-1",
      referUrl: "-1"
    },
    "post",
    {
      sign: "6d78be68bd08ad9e6eea153ea362cbd8",
      st: "1561685238868",
      sv: "100"
    }
  );
}

export const jd_tasks = [
  {
    title: "种豆得豆任务",
    async list() {
      return [
        {
          url:
            "https://api.m.jd.com/client.action?functionId=plantBeanIndex&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=unknown&st=1579009983649&sign=a9fcd18dbb06262e0e6d99f97c4e79cc&sv=122",
          data:
            "body=%7B%22followType%22%3A%221%22%2C%22monitor_refer%22%3A%22%22%2C%22monitor_source%22%3A%22plant_app_plant_index%22%2C%22shareUuid%22%3A%22%22%2C%22version%22%3A%228.4.0.0%22%2C%22wxHeadImgUrl%22%3A%22%22%7D&"
        },
        {
          url:
            "https://api.m.jd.com/client.action?functionId=purchaseRewardTask&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=unknown&st=1579015717630&sign=54d2023009fae3ae2a6047c915f226d5&sv=121",
          data:
            "body=%7B%22monitor_refer%22%3A%22plant_purchaseRewardTask%22%2C%22monitor_source%22%3A%22plant_app_plant_index%22%2C%22roundId%22%3A%22n3kp6xjxvxogcoqbns6eertieu%22%2C%22version%22%3A%228.4.0.0%22%7D&"
        },
        {
          url:
            "https://api.m.jd.com/client.action?functionId=receiveNutrientsTask&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=unknown&st=1579015810004&sign=41bf59799d54a5f41a889a66e9cd78c4&sv=122",
          data:
            "body=%7B%22awardType%22%3A%227%22%2C%22monitor_refer%22%3A%22plant_receiveNutrientsTask%22%2C%22monitor_source%22%3A%22plant_app_plant_index%22%2C%22version%22%3A%228.4.0.0%22%7D&"
        }
      ];
    },
    async doTask(item) {
      return requestRaw(item.url, item.data);
    }
  },
  {
    title: "关注频道领营养液",
    delay: 3000,
    async list() {
      var {
        data: { goodChannelList, normalChannelList }
      } = await request.get(
        "https://api.m.jd.com/client.action?functionId=plantChannelTaskList&body=%7B%7D&uuid=865166029777979-008114eccc76&appid=ld"
      );
      return normalChannelList
        .slice(0, 5)
        .filter(item => item.taskState === "2");
    },
    async doTask({ channelId, channelTaskId }) {
      await request.get("https://api.m.jd.com/client.action", {
        qs: {
          functionId: "plantChannelNutrientsTask",
          body: JSON.stringify({ channelTaskId, channelId }),
          uuid: "865166029777979-008114eccc76",
          appid: "ld"
        }
      });
    }
  },
  {
    title: "关注商品领营养液",
    delay: 3000,
    async list() {
      var {
        data: { productInfoList }
      } = await request.get(
        "https://api.m.jd.com/client.action?functionId=productTaskList&body=%7B%22monitor_source%22%3A%22plant_m_plant_index%22%2C%22monitor_refer%22%3A%22plant_productTaskList%22%2C%22version%22%3A%228.4.0.0%22%7D&appid=ld&client=android&clientVersion=8.4.2&networkType=wifi&osVersion=5.1.1&uuid=865166029777979-008114eccc76"
      );
      return productInfoList
        .map(([item]) => item)
        .filter(item => item.taskState === "2");
    },
    async doTask({ productTaskId, skuId }) {
      await request.get(
        "https://api.m.jd.com/client.action?functionId=productNutrientsTask&appid=ld&client=android&clientVersion=8.4.2&networkType=wifi&osVersion=5.1.1&uuid=865166029777979-008114eccc76&jsonp=jsonp_1579103007009_62910",
        {
          qs: {
            body: JSON.stringify({
              productTaskId,
              skuId,
              monitor_source: "plant_m_plant_index",
              monitor_refer: "plant_productNutrientsTask",
              version: "8.4.0.0"
            })
          }
        }
      );
    }
  },
  {
    title: "领每小时的营养液",
    period: 1000 * 60 * 60 * 2,
    doTask() {
      return requestRaw(
        "https://api.m.jd.com/client.action?functionId=receiveNutrients&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=unknown&st=1579009990839&sign=4c384b4f8aed8bbfd36e6339e3349787&sv=121",
        `body=%7B%22monitor_refer%22%3A%22plant_receiveNutrients%22%2C%22monitor_source%22%3A%22plant_app_plant_index%22%2C%22roundId%22%3A%22n3kp6xjxvxogcoqbns6eertieu%22%2C%22version%22%3A%228.4.0.0%22%7D&`
      );
    }
  },
  {
    title: "京东优惠券签到领红包",
    async test() {
      return true;
    },
    doTask() {
      return requestRaw(
        "https://api.m.jd.com/client.action?functionId=ccSignInNew",
        "adid=3D52573B-D546-4427-BC41-19BE6C9CE864&area=12_988_47821_48031&body=%7B%22pageClickKey%22%3A%22CouponCenter%22%2C%22eid%22%3A%22eidI5B820114MEIyQjg1ODgtM0U2Qy00OQ%3D%3DH7EFGMDYl9hrkgRaHyasfTfnHj8TMpWo8evL4bpDG0OIQXzNNSwh9uzitnan%2BQAeieHwU9aXjsqhiBwb%22%2C%22shshshfpb%22%3A%22tQFD84i0iQ5D5JGqRkKjrdp%5C/jMdLdn4WZNvxLhlBwaTiYSiko4ksawh6bqrrw8oeUXeAho8H%5C/02KRTmqivgZiXg%3D%3D%22%2C%22childActivityUrl%22%3A%22openapp.jdmobile%253a%252f%252fvirtual%253fparams%253d%257b%255c%2522category%255c%2522%253a%255c%2522jump%255c%2522%252c%255c%2522des%255c%2522%253a%255c%2522couponCenter%255c%2522%257d%22%2C%22monitorSource%22%3A%22cc_sign_ios_index_config%22%7D&build=166820&client=apple&clientVersion=8.4.2&d_brand=apple&d_model=iPhone9%2C2&eid=eidI5B820114MEIyQjg1ODgtM0U2Qy00OQ%3D%3DH7EFGMDYl9hrkgRaHyasfTfnHj8TMpWo8evL4bpDG0OIQXzNNSwh9uzitnan%2BQAeieHwU9aXjsqhiBwb&isBackground=N&joycious=196&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=38276cc01428d153b8a9802e9787d279e0b5cc85&osVersion=13.3&partner=apple&rfs=0000&scope=01&screen=1242%2A2208&sign=1e142f665d41e61347556ecee6e02bd6&st=1578912451044&sv=101&uuid=coW0lj7vbXVin6h7ON%2BtMNFQqYBqMahr&wifiBssid=unknown"
      );
    }
  },
  {
    title: "边玩边赚任务",
    async list() {
      var { data } = await request.form("https://api.m.jd.com/client.action", {
        functionId: "playTaskCenter",
        body: JSON.stringify({ client: "app" }),
        client: "wh5",
        clientVersion: "1.0.0"
      });
      return data;
    },
    async doTask({ playId, type }) {
      await request.form("https://api.m.jd.com/client.action", {
        functionId: "playAction",
        body: JSON.stringify({
          client: "app",
          playId: String(playId),
          type: String(type)
        }),
        client: "wh5",
        clientVersion: "1.0.0"
      });
    }
  },
  {
    title: "福利转盘",
    async list() {
      var {
        data: { lotteryCount, lotteryCode }
      } = await request.get(
        "https://api.m.jd.com/client.action?functionId=wheelSurfIndex&body=%7B%22actId%22%3A%22jgpqtzjhvaoym%22%2C%22appSource%22%3A%22jdhome%22%7D&appid=ld&client=android&clientVersion=&networkType=wifi&osVersion=5.1.1&uuid=865166029777979-008114eccc76"
      );
      return [...Array(Number(lotteryCount))].map(() => ({ lotteryCode }));
    },
    async doTask({ lotteryCode }) {
      await request.get("https://api.m.jd.com/client.action", {
        qs: {
          functionId: "lotteryDraw",
          body: JSON.stringify({
            actId: "jgpqtzjhvaoym",
            appSource: "jdhome",
            lotteryCode
          }),
          appid: "ld",
          client: "android",
          clientVersion: "",
          networkType: "wifi",
          osVersion: "5.1.1",
          uuid: "865166029777979-008114eccc76",
          jsonp: "jsonp_1579104686225_44841"
        }
      });
    }
  },
  {
    title: "店铺签到领京豆",
    async list() {
      var { data } = await request.post(
        "https://bean.jd.com/myJingBean/getPopSign"
      );
      return data;
    },
    async doTask({ shopUrl }) {
      var shopId;
      if (!/^http:\/\/mall\./.test(shopUrl)) {
        let html = await request.get(shopUrl);
        shopId = /var\s+shopId\s*=\s*"(\d+)/.exec(html)![1];
      } else {
        shopId = /-(\d+)/.exec(shopUrl)![1];
      }
      return request.get(`https://mall.jd.com/shopSign-${shopId}.html`);
    }
  }
];

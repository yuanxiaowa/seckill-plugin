import { request } from "@/background/common/request";
import moment from "moment";
import { mermorize } from "@/background/common/tool";

async function requestData(url: string, body: any) {
  var { data, code, echo } = await request.form(
    url,
    {
      body: JSON.stringify(body)
    },
    {
      headers: {
        _origin: "https://api.m.jd.com"
      }
    }
  );
  if (code !== "0") {
    throw new Error(echo);
  }
  return data;
}

var getIndex = mermorize(function() {
  return requestData(
    "https://api.m.jd.com/client.action?functionId=plantBeanIndex&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=ea8683e82e32666b8ecd789b2fc7933f&st=1579182263066&sign=451e8b17e18a2094ec6fee23cc2d3ef8&sv=101",
    {
      followType: "1",
      monitor_refer: "",
      monitor_source: "plant_app_plant_index",
      shareUuid: "",
      version: "8.4.0.0",
      wxHeadImgUrl: ""
    }
  );
}, 200);

export const nutrient_tasks = [
  {
    title: "种豆得豆任务",
    async list() {
      var { awardList } = await getIndex();
      var items: any[] = [];
      if (awardList[3].limitFlag === "1") {
        items.push({
          url:
            "https://api.m.jd.com/client.action?functionId=purchaseRewardTask&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=unknown&st=1579015717630&sign=54d2023009fae3ae2a6047c915f226d5&sv=121",
          data: {
            monitor_refer: "plant_purchaseRewardTask",
            monitor_source: "plant_app_plant_index",
            roundId: "n3kp6xjxvxogcoqbns6eertieu",
            version: "8.4.0.0"
          }
        });
      }
      if (awardList[4].childAwardList[0].limitFlag === "1") {
        items.push({
          url:
            "https://api.m.jd.com/client.action?functionId=receiveNutrientsTask&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=unknown&st=1579015810004&sign=41bf59799d54a5f41a889a66e9cd78c4&sv=122",
          data: {
            awardType: "7",
            monitor_refer: "plant_receiveNutrientsTask",
            monitor_source: "plant_app_plant_index",
            version: "8.4.0.0"
          }
        });
      }
      return items;
    },
    async doTask(item) {
      return requestData(item.url, item.data);
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
    forever: true,
    async nextTime() {
      var {
        timeNutrientsRes: { nextReceiveTime, countDown }
      } = await getIndex();
      console.log(
        new Date(Number(nextReceiveTime || moment(7, "HH").valueOf()))
      );
      return Number(nextReceiveTime || moment(7, "HH").valueOf());
    },
    doTask() {
      return requestData(
        "https://api.m.jd.com/client.action?functionId=receiveNutrients&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=unknown&st=1579009990839&sign=4c384b4f8aed8bbfd36e6339e3349787&sv=121",
        {
          monitor_refer: "plant_receiveNutrients",
          monitor_source: "plant_app_plant_index",
          roundId: "n3kp6xjxvxogcoqbns6eertieu",
          version: "8.4.0.0"
        }
      );
    }
  },
  {
    title: "喂营养液",
    period: 3 * 60 * 60 * 1000,
    async doTask() {
      var { roundList } = await getIndex();
      if (Number(roundList[1].nutrients) > 0) {
        return requestData(
          "https://api.m.jd.com/client.action?functionId=cultureBean&clientVersion=8.4.2&build=71043&client=android&d_brand=vivo&d_model=vivoy31a&osVersion=5.1.1&screen=1280*720&partner=jingdong&aid=33b8e7b27dbbd174&oaid=&eid=I6DTSOY3JWZ6IAISM62QQJAVUS2FR7ABUASGK552AMB5IRBE2MN67VBSA67GIEU573OZZOCXNRHBCQ63L4DOAZMKOICV6CLIWVKJ77MKTWJCPDIFQMTQ&sdkVersion=22&lang=zh_CN&uuid=865166029777979-008114eccc76&area=1_2802_2821_0&networkType=wifi&wifiBssid=ea8683e82e32666b8ecd789b2fc7933f&st=1579186086718&sign=ec57e91023afdb933c2e2b96501755c3&sv=122",
          {
            monitor_refer: "plant_index",
            monitor_source: "plant_app_plant_index",
            roundId: "n3kp6xjxvxogcoqbns6eertieu",
            version: "8.4.0.0"
          }
        );
      }
    }
  },
  {
    title: "帮收",
    period: 10 * 60 * 1000,
    delay: 3000,
    async list() {
      var { friendInfoList } = await requestData(
        "https://api.m.jd.com/client.action?functionId=plantFriendList&appid=ld&client=android&clientVersion=8.4.2&networkType=wifi&osVersion=5.1.1&uuid=865166029777979-008114eccc76",
        {
          pageNum: "1",
          monitor_source: "plant_m_plant_index",
          monitor_refer: "plantFriendList",
          version: "8.4.0.0"
        }
      );
      return friendInfoList.filter(
        ({ nutrCount }) => nutrCount && Number(nutrCount) > 0
      );
    },
    async doTask({ paradiseUuid }) {
      await requestData(
        "https://api.m.jd.com/client.action?functionId=collectUserNutr&appid=ld&client=android&clientVersion=8.4.2&networkType=wifi&osVersion=5.1.1&uuid=865166029777979-008114eccc76",
        {
          paradiseUuid,
          roundId: "n3kp6xjxvxogcoqbns6eertieu",
          monitor_source: "plant_m_plant_index",
          monitor_refer: "collectUserNutr",
          version: "8.4.0.0"
        }
      );
    }
  }
];

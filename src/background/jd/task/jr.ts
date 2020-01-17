import { requestJr } from "./tools";
import { request } from "@/background/common/request";
import { signInJd } from "./jd";

async function signInJr() {
  // var {
  //   resBusiData: { isSign }
  // } = await requestJr(
  //   `https://ms.jr.jd.com/gw/generic/gry/h5/m/querySignHistory?_=${Date.now()}`,
  //   {
  //     channelSource: "JRAPP",
  //     riskDeviceParam:
  //       '{"deviceType":"iPhone 7 Plus (A1661/A1785/A1786)","traceIp":"","macAddress":"02:00:00:00:00:00","imei":"7B4C588C-8371-4F85-B91D-F015D8C88E90","os":"iOS","osVersion":"13.3","fp":"7e8fbf00ae6a55bd7ef3b4513f6793d4","ip":"172.16.91.146","eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","appId":"com.jd.jinrong","openUUID":"9d6039ba9a88469d7733658d45e3dae4df03af46","uuid":"","clientVersion":"5.3.30","resolution":"736*414","channelInfo":"appstore","networkType":"WIFI","startNo":212,"openid":"","token":"","sid":"","terminalType":"02","longtitude":"","latitude":"","securityData":"","jscContent":"","fnHttpHead":"","receiveRequestTime":"","port":"","appType":1,"optType":"","idfv":"","wifiSSID":"","wifiMacAddress":"","cellIpAddress":"","wifiIpAddress":"","sdkToken":"C3ROKUU3EHCQVKIYXBHNGOUUHUFXRPQQBWS6QRIXFWZDQZ2J5B4DQEAZHORMUG6L3KG6LHYMWY6Q4"}'
  //   }
  // );
  // if (isSign) {
  //   return;
  // }
  var { resBusiMsg, resBusiCode } = await requestJr(
    `https://ms.jr.jd.com/gw/generic/gry/h5/m/signIn`,
    {
      channelSource: "JRAPP"
    }
  );
  if (!(resBusiCode === 0 || resBusiCode === 15)) {
    throw new Error(resBusiMsg);
  }
}

function getSignAwardJR() {
  return requestJr(`https://nu.jr.jd.com/gw/generic/jrm/h5/m/process`, {
    actCode: "FBBFEC496C",
    type: 4
  });
}

export const jr_tasks = [
  {
    title: "双签",
    async list() {
      var { businessData } = await requestJr(
        `https://nu.jr.jd.com/gw/generic/jrm/h5/m/process?_=${Date.now()}`,
        { actCode: "FBBFEC496C", type: 9, frontParam: { channel: "JR" } },
        true
      );
      if (!businessData.get) {
        return [businessData];
      }
      return [];
    },
    async doTask(item) {
      if (!item.signInJd) {
        await signInJd();
      }
      if (item.signInJr) {
        await signInJr();
      }
      await getSignAwardJR();
    }
  },
  {
    title: "翻钢镚",
    async list() {
      var { data } = await request.get(
        `https://gps.jd.com/activity/signin/reward/home?uaType=2&platCode=3`
      );
      return [...Array(data.left)];
    },
    async doTask() {
      return request.get(
        "https://gps.jd.com/activity/signin/reward/choice?uaType=2&position=1&deviceInfo=%7B%22location%22:%7B%22clientVersion%22:%225.3.20%22,%22imei%22:%227B4C588C-8371-4F85-B91D-F015D8C88E90%22,%22deviceType%22:%22iPhone+7+Plus+(A1661%2FA1785%2FA1786)%22,%22osPlatform%22:%22iOS%22,%22osVersion%22:%2213.3%22,%22channelInfo%22:%22appstore%22,%22macAddress%22:%2202:00:00:00:00:00%22,%22clientIp%22:%22172.16.91.146%22,%22startNo%22:212,%22resolution%22:%22736*414%22,%22networkType%22:%22WIFI%22%7D,%22deviceInfo%22:%7B%22macAddress%22:%2202:00:00:00:00:00%22,%22channelInfo%22:%22appstore%22,%22IPAddress1%22:%22172.16.91.146%22,%22OpenUDID%22:%229d6039ba9a88469d7733658d45e3dae4df03af46%22,%22clientVersion%22:%225.3.20%22,%22terminalType%22:%2202%22,%22osVersion%22:%2213.3%22,%22appId%22:%22com.jd.jinrong%22,%22deviceType%22:%22iPhone9,2%22,%22networkType%22:%22WIFI%22,%22startNo%22:212,%22UUID%22:%22%22,%22IPAddress%22:%22%22,%22deviceId%22:%227B4C588C-8371-4F85-B91D-F015D8C88E90%22,%22IDFA%22:%223D52573B-D546-4427-BC41-19BE6C9CE864%22,%22resolution%22:%221242*2208%22,%22osPlatform%22:%22iOS%22%7D,%22eid%22:%22XPYRQKYPRDZOXAAHSFNAICGWZ2SZUFGXSHY7A76H3BFL7PEZE5EZD6NCYGADCBSQKA4M7LFAXP7QX444SEC7PTRO3Q%22,%22fp%22:%2203b9a11b84573b6cc2b42eacf8bd9c8f%22%7D&platCode=3"
      );
    }
  },
  {
    title: "赚钱签到",
    async list() {
      var {
        data: { signRecords }
      } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/zc/h5/m/signRecords",
        {
          bizLine: 2,
          deviceInfo: {
            eid:
              "XPYRQKYPRDZOXAAHSFNAICGWZ2SZUFGXSHY7A76H3BFL7PEZE5EZD6NCYGADCBSQKA4M7LFAXP7QX444SEC7PTRO3Q",
            fp: "03b9a11b84573b6cc2b42eacf8bd9c8f",
            token:
              "ZHL5STL7BZ5DOGZJGPAOGOO65KRTZFU77U64QVT2O72DMFN3DGGXJ4KE7MEGTVGZTJVWRSBIPELUW",
            openUUID: "",
            optType: "https://jddx.jd.com/m/jddnew/money/index.html"
          },
          clientType: "sms",
          clientVersion: "11.0"
        }
      );
      return signRecords.filter(item => item.signStatus === 2);
    },
    async doTask() {
      return requestJr(
        "https://ms.jr.jd.com/gw/generic/zc/h5/m/signRewardGift",
        {
          bizLine: 2,
          signDate: "20200114",
          deviceInfo: {
            eid:
              "XPYRQKYPRDZOXAAHSFNAICGWZ2SZUFGXSHY7A76H3BFL7PEZE5EZD6NCYGADCBSQKA4M7LFAXP7QX444SEC7PTRO3Q",
            fp: "03b9a11b84573b6cc2b42eacf8bd9c8f",
            token:
              "ZHL5STL7BZ5DOGZJGPAOGOO65KRTZFU77U64QVT2O72DMFN3DGGXJ4KE7MEGTVGZTJVWRSBIPELUW",
            openUUID: "",
            optType: "https://jddx.jd.com/m/jddnew/money/index.html"
          },
          clientType: "sms",
          clientVersion: "11.0"
        }
      );
    }
  },
  {
    title: "看广告领金豆",
    delay: 30 * 1000,
    async list() {
      var { bannerList } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/jrm/h5/m/getMsgAdPageDataService",
        {
          clientType: "ios",
          actKey: "176696",
          userDeviceInfo: { env: "jrapp" },
          isclientnew: "new",
          from: "kggljdzqbn",
          bizsource: "appqdkp",
          jrcontainer: "h5",
          jrlogin: "true",
          jrcloseweb: "false"
        }
      );
      return bannerList;
    },
    async doTask(item) {
      var { canGetGb } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/jrm/h5/m/canGetGb",
        {
          clientType: "ios",
          actKey: "176696",
          userDeviceInfo: { adId: Math.abs(item.adId) }
        }
      );
      if (!canGetGb) {
        return;
      }
      return requestJr("https://ms.jr.jd.com/gw/generic/jrm/h5/m/sendAdGb", {
        clientType: "ios",
        actKey: "176696",
        userDeviceInfo: { adId: 9999999 },
        deviceInfoParam: {
          macAddress: "02:00:00:00:00:00",
          channelInfo: "appstore",
          IPAddress1: "172.16.91.146",
          OpenUDID: "9d6039ba9a88469d7733658d45e3dae4df03af46",
          clientVersion: "5.3.20",
          terminalType: "02",
          osVersion: "13.3",
          appId: "com.jd.jinrong",
          deviceType: "iPhone9,2",
          networkType: "WIFI",
          startNo: 212,
          UUID: "",
          IPAddress: "",
          deviceId: "7B4C588C-8371-4F85-B91D-F015D8C88E90",
          IDFA: "3D52573B-D546-4427-BC41-19BE6C9CE864",
          resolution: "1242*2208",
          osPlatform: "iOS"
        },
        bussource: ""
      });
    }
  },
  {
    title: "浏览赚金豆",
    async list() {
      return [115, 143, 145, 146];
    },
    async doTask(actId) {
      await requestJr("https://ms.jr.jd.com/gw/generic/zc/h5/m/receiveAct", {
        bizLine: 15,
        actId,
        extRule: null
      });
      var { status } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/zc/h5/m/canCompleteZJAct",
        {
          bizLine: 15,
          actId,
          extRule: null
        }
      );
      if (!status) {
        return;
      }
      var { resultCode } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/zc/h5/m/completeZJAct",
        {
          bizLine: 15,
          actId,
          extRule: null
        }
      );
      if (resultCode !== "00000") {
        return;
      }
      await requestJr("https://ms.jr.jd.com/gw/generic/zc/h5/m/rewardGift", {
        bizLine: 15,
        actId,
        deviceInfo: {
          eid:
            "XPYRQKYPRDZOXAAHSFNAICGWZ2SZUFGXSHY7A76H3BFL7PEZE5EZD6NCYGADCBSQKA4M7LFAXP7QX444SEC7PTRO3Q",
          fp: "03b9a11b84573b6cc2b42eacf8bd9c8f",
          token:
            "FDM576RS7ZWPHUWMTIAT4D2V5Q2GFL7MBSSNX5VFJOQAWYJXFSKCG3FUTLIPZQCBFA2SXLJTPIMDQ",
          optType:
            "https://jddx.jd.com/m/jddnew/btyingxiao/sfstore/index.html?from=jrdaka&final_page=xxf_yxmx"
        },
        extRule: null
      });
    }
  },
  {
    title: "答题赢金币",
    async list() {
      var {
        data: { questions, code }
      } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/hyqy/h5/m/queryAnswer",
        { timeStamp: 1578999902603 }
      );
      return questions
        .filter(item => item.status === 2)
        .map(item =>
          Object.assign(item, {
            code
          })
        );
    },
    async doTask(item) {
      await requestJr("https://ms.jr.jd.com/gw/generic/hyqy/h5/m/doAnswer", {
        code: item.code,
        useOption: 1,
        timeStamp: Date.now()
      });
    }
  },
  {
    async list() {
      var { lotteryCoins, data } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/hy/h5/m/lotteryInfo",
        {
          actKey: "AbeQry",
          t: Date.now()
        }
      );
      if (lotteryCoins === 0) {
        return [data];
      }
      return [];
    },
    async doTask(item) {
      var { code, data } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/hy/h5/m/lottery",
        {
          actKey: "AbeQry",
          t: Date.now()
        }
      );
      if (code === "0000") {
        console.log(new Date(), "金币抽奖：" + data.awardTitle);
      }
    }
  },
  {
    // https://jdde.jd.com/btyingxiao/marketing/html/index.html?from=kgg
    title: "签到赢免息红包",
    async test() {
      var { data } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/syh_yxmx/h5/m/canJoin",
        {
          clientType: "sms",
          actKey: "181299"
        }
      );
      return data;
    },
    async doTask() {
      var { data } = await requestJr(
        "https://ms.jr.jd.com/gw/generic/syh_yxmx/h5/m/interestFreeLottery",
        {
          clientType: "sms",
          actKey: "181299",
          deviceInfo: {
            eid:
              "TNNEVY6UM2645G3OEU4WPA5OIB7A4MZSUPXMQVREJQ2P5IZKD5RUIEF7AXO6RA5W5SMDN3LPMAPSKAOKQWLD4ADVGU",
            fp: "fa9f69f8e3aacd84b3b69f64b1f01cca",
            token:
              "RA3LSBN6GPSJYASTJ447XKRRSKQJZOQ247WCWLHKBDJFS7CKM3USKKC7ZEJRCMBXKUD2NA3GZOUUM"
          }
        }
      );
      if (data) {
        console.log(this.title, data);
      }
    }
  }
];

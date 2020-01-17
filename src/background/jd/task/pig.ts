import { requestJr } from "./tools";
import { mermorize } from "@/background/common/tool";

export async function requestData(url: string, data) {
  var { resultData } = await requestJr(url, data);
  return resultData;
}

export const getMeta = mermorize(
  () =>
    requestData(
      `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetLogin?_=${Date.now()}`,
      {
        shareId: "",
        helpId: "",
        cardId: "",
        source: 2,
        channelLV: "qdy",
        riskDeviceParam:
          '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"efdfbfeb15d4fc35bd008b3dab4b4ab9","token":"6CGKIGCYKG7FEBCRPAPP3O2DAQ6BHH3UMAK7AZYZZC6QZOI2CWNHE2MBJ3RGVTXGJSCKBM5NENER2"}'
      }
    ),
  200
);

export const pig_tasks = [
  {
    title: "小猪任务",
    async list() {
      var { missions } = await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetMissionList?_=${Date.now()}`,
        {
          source: 2,
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"efdfbfeb15d4fc35bd008b3dab4b4ab9","token":"DAQGUGX7UWH3RYNXT5KMTXXDOYMIR6C4W2B6IXUIVBODNBF5E4GP3FMQ7SEQKDM3Z3VBBVZOPM6EQ"}'
        }
      );
      return missions.filter(({ status }) => status >= 3);
    },
    async doTask({ mid, status }) {
      var missionId = /(\d+)/.exec(mid)![1];
      if (status === 3) {
        await requestData(
          "https://ms.jr.jd.com/gw/generic/mission/h5/m/finishReadMission",
          { missionId, readTime: 10 }
        );
        await requestData(
          `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetDoMission?_=${Date.now()}`,
          {
            source: 2,
            mid,
            channelLV: "qdy",
            riskDeviceParam:
              '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"efdfbfeb15d4fc35bd008b3dab4b4ab9","token":"6CGKIGCYKG7FEBCRPAPP3O2DAQ6BHH3UMAK7AZYZZC6QZOI2CWNHE2MBJ3RGVTXGJSCKBM5NENER2"}'
          }
        );
      }
      await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetDoMission?_=${Date.now()}`,
        {
          source: 2,
          mid,
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"7e8fbf00ae6a55bd7ef3b4513f6793d4","token":"C2EPPZICYK2Y6Q7LYP3K433W7QPNVSGKYEEVF3ASSJ2LM6UUBIQXQEEAHLEHGCMPCP4LW24HLTSV6"}'
        }
      );
    }
  },
  {
    title: "领箱子",
    async list() {
      var { boxCount } = await getMeta();
      if (boxCount > 0) {
        return [...Array(boxCount)];
      }
      return [];
    },
    delay: 8 * 1000,
    async doTask() {
      await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetOpenBox?_=${Date.now()}`,
        {
          source: 2,
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"7e8fbf00ae6a55bd7ef3b4513f6793d4","token":"C2EPPZICYK2Y6Q7LYP3K433W7QPNVSGKYEEVF3ASSJ2LM6UUBIQXQEEAHLEHGCMPCP4LW24HLTSV6"}'
        }
      );
    }
  },
  {
    title: "喂食",
    forever: true,
    async nextTime() {
      var {
        cote: { foodBowl }
      } = await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetRefreshPig?_=${Date.now()}`,
        {
          source: 2,
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"efdfbfeb15d4fc35bd008b3dab4b4ab9","token":"6CGKIGCYKG7FEBCRPAPP3O2DAQ6BHH3UMAK7AZYZZC6QZOI2CWNHE2MBJ3RGVTXGJSCKBM5NENER2"}'
        }
      );
      return Date.now() + foodBowl.stillTime;
    },
    async doTask() {
      var {
        goods: [item]
      } = await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetUserBag?_=${Date.now()}`,
        {
          source: 2,
          category: "1001",
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"7e8fbf00ae6a55bd7ef3b4513f6793d4","token":"C2EPPZICYK2Y6Q7LYP3K433W7QPNVSGKYEEVF3ASSJ2LM6UUBIQXQEEAHLEHGCMPCP4LW24HLTSV6"}'
        }
      );
      await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetAddFood?_=${Date.now()}`,
        {
          source: 2,
          skuId: item.sku,
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"7e8fbf00ae6a55bd7ef3b4513f6793d4","token":"C2EPPZICYK2Y6Q7LYP3K433W7QPNVSGKYEEVF3ASSJ2LM6UUBIQXQEEAHLEHGCMPCP4LW24HLTSV6"}'
        }
      );
    }
  },
  {
    title: "抽奖",
    async list() {
      var { currentCount } = await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetLotteryIndex?_=${Date.now()}`,
        {
          source: 2,
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"7e8fbf00ae6a55bd7ef3b4513f6793d4","token":"C2EPPZICYK2Y6Q7LYP3K433W7QPNVSGKYEEVF3ASSJ2LM6UUBIQXQEEAHLEHGCMPCP4LW24HLTSV6"}'
        }
      );
      return [...Array(currentCount)];
    },
    async doTask() {
      await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetLotteryPlay?_=${Date.now()}`,
        {
          source: 2,
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"7e8fbf00ae6a55bd7ef3b4513f6793d4","token":"C2EPPZICYK2Y6Q7LYP3K433W7QPNVSGKYEEVF3ASSJ2LM6UUBIQXQEEAHLEHGCMPCP4LW24HLTSV6"}'
        }
      );
    }
  },
  {
    title: "许愿",
    async test() {
      var { wished } = await getMeta();
      return !wished;
    },
    async doTask() {
      var [
        {
          awards: [item]
        },
        {
          cote: { pig }
        }
      ] = await Promise.all([
        requestData(
          `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetAllWishes1?_=${Date.now()}`,
          {
            source: 2,
            batchCount: 1,
            channelLV: "qdy",
            riskDeviceParam:
              '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"efdfbfeb15d4fc35bd008b3dab4b4ab9","token":"6CGKIGCYKG7FEBCRPAPP3O2DAQ6BHH3UMAK7AZYZZC6QZOI2CWNHE2MBJ3RGVTXGJSCKBM5NENER2"}'
          }
        ),
        getMeta()
      ]);
      await requestData(
        `https://ms.jr.jd.com/gw/generic/uc/h5/m/pigPetChangeWish1?_=${Date.now()}`,
        {
          source: 2,
          awardId: item.id,
          pigId: pig.pigId,
          channelLV: "qdy",
          riskDeviceParam:
            '{"eid":"DC2RJF5LVTZ4FRINXN3WARSD3AD5W3Y6HY2KZJ67ZWGCWZAHRVAHBSTLURKL23PFZWXTJ7FGAO5MOBD6T4KIT45DZI","dt":"iPhone 7 Plus (A1661/A1785/A1786)","ma":"","im":"","os":"iOS","osv":"13.3","ip":"180.117.160.226","apid":"JDJR-App","ia":"","uu":"","cv":"5.3.30","nt":"WIFI","at":"1","fp":"efdfbfeb15d4fc35bd008b3dab4b4ab9","token":"6CGKIGCYKG7FEBCRPAPP3O2DAQ6BHH3UMAK7AZYZZC6QZOI2CWNHE2MBJ3RGVTXGJSCKBM5NENER2"}'
        }
      );
    }
  }
];

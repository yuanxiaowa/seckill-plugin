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
      sign: "a37085c0c95ed57920107de3bd0fa2a7",
      st: "1580917838307",
      sv: "101"
    }
  );
}

export const jd_tasks = [
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
      await request.get("https://bean.jd.com/myJingBean/list");
      var { data } = await request.post(
        "https://bean.jd.com/myJingBean/getPopSign"
      );
      return data.filter(({ signed }) => !signed);
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

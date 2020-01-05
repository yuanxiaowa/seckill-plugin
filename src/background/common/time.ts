import axios from "axios";
import moment from "moment";
import { DT, config } from "./setting";

export function getSysTime(url: string, transform: (data: any) => number) {
  return async () => {
    function getDt(): Promise<{
      rtl: number;
      dt: number;
    }> {
      return new Promise(async (resolve, reject) => {
        var start = Date.now();
        try {
          var { data } = await axios.get(url);
          var end = Date.now();
          var rtl = (end - start) / 2;
          var t = transform(data);
          resolve({
            dt: rtl - (end - t),
            rtl
          });
        } catch (e) {
          reject(e);
        }
      });
    }
    var count = 100;
    var total = 0;
    var total_rtl = 0;
    var total_count = 0;
    for (let i = 0; i < count; i++) {
      try {
        var { rtl, dt } = await getDt();
        total += dt;
        total_rtl += rtl;
        total_count++;
      } catch (e) {}
    }
    return {
      dt: total / total_count,
      rtl: total_rtl / total_count
    };
  };
}

export const sysTaobaoTime = getSysTime(
  "https://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp",
  ({ data: { t } }) => t
);
export const sysJingdongTime = getSysTime(
  "https://a.jd.com//ajax/queryServerData.html",
  ({ serverTime }) => serverTime
);

export async function sysPlatformTime(platform: string) {
  var handler = platform === "taobao" ? sysTaobaoTime : sysJingdongTime;
  console.log(platform + "开始同步时钟");
  var { dt, rtl } = await handler();
  console.log(
    platform + "同步时间",
    (dt > 0 ? "慢了" : "快了") + Math.abs(dt) + "ms"
  );
  console.log(platform + "单程时间", rtl + "ms");
  DT[platform] =
    dt +
    (platform === "taobao"
      ? Math.max(0, rtl - config.delay_all)
      : Math.max(0, rtl - 100));
}

export const getDelayTime = (() => {
  var map: Record<number, Promise<number>> = {};
  return async (t: number, platform: string) => {
    if (map[t]) {
      return map[t];
    }
    let toTime = moment(t);
    if (toTime.format("mm:ss") !== "00:00") {
      return DT[platform];
    }
    let bt = 1000 * 60 * 10;
    let p = new Promise<number>(resolve => {
      setTimeout(async () => {
        await sysPlatformTime(platform);
        setTimeout(() => {
          delete map[t];
        }, bt + 5000);
        resolve(DT[platform]);
      }, toTime.diff(moment()) - DT[platform] - bt);
    });
    map[t] = p;
    return p;
  };
})();

import { resolveUrl } from "./api";
import { Platform } from "./handlers";

/*
 * @Author: oudingyin
 * @Date: 2019-08-26 09:17:50
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-10-08 16:33:24
 */
interface Ret {
  action: string;
  expectedPrice: number;
  type: string;
  urls: string[];
  quantities: number[];
  forcePrice: boolean;
  t?: string;
  platform: Platform;
  datetime?: string;
  jianlou?: number;
  from_pc?: boolean;
}

const blacklist = require("./text/blacklist.json");
// @ts-ignore
window.resolveText = resolveText;
const num_cn_map = "零一二三四五六七八九十".split("").reduce(
  (state, s, i) => {
    state[s] = i;
    return state;
  },
  {
    两: 2
  }
);
const NUM_CN_STR = Object.keys(num_cn_map).join("");
const r_url = /https?:\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?/g;

export function resolveText(text: string, datetime?: string | Date) {
  var type: string;
  var urls: string[] = [];
  var quantities: number[] | null;
  var forcePrice = false;
  text = text.trim();
  while (r_url.test(text)) {
    urls.push(RegExp["$&"]);
  }
  if (urls.length === 0) {
    urls =
      text.match(/(?<![a-zA-Z0-9&=./?])[a-zA-Z0-9]{11}(?![a-zA-Z0-9&=./?])/g) ||
      [];
  }
  if (urls.length > 0) {
    type = "taokouling";
  } else {
    urls =
      text.match(
        /https?:\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?/g
      ) || [];
  }
  if (urls.length > 0) {
    type = "url";
    urls.forEach(url => {
      text = text.replace(url, "");
    });
    let quantities_arr = text.match(
      /(?<=(?<!拍)下|拍|买|加车|加购|选)\d+(?!元|选项)/g
    )!;
    if (!quantities_arr) {
      quantities_arr = text.match(/(?<!前\d*)\d+(?=件(?!套)|份)/g)!;
    }
    if (!quantities_arr) {
      quantities_arr = text.match(
        new RegExp(`(?<!限购)[${NUM_CN_STR}](?=件|份)`, "g")
      )!;
      if (quantities_arr) {
        quantities_arr = quantities_arr.map(key => num_cn_map[key]);
      }
    }

    if (quantities_arr) {
      quantities = urls.map((_, i) => Number(quantities_arr[i]) || 1);
    } else {
      quantities = Array(urls.length).fill(1);
    }
    let expectedPrice = 10;
    let action: string = "";
    let diejia: any;
    if (
      /([\d.]+)元/.test(text) ||
      /付([\d.]+)/.test(text) ||
      /(?:到手|预计|拍下)([\d\.]+)/.test(text) ||
      /【([\d.]+)(包邮)?】/.test(text) ||
      /\[([\d.]+)\]/.test(text) ||
      /(?:[\s：:，,]|半价|折合|折后)([\d.]+)(?!\w)/.test(text) ||
      /([\d\.]+)包邮/.test(text) ||
      /件([\d\.]+)/.test(text) ||
      /([\d\.]+)到手/.test(text) ||
      /价([\d\.]+)/.test(text) ||
      /([\d\.]+)起/.test(text) ||
      /^\s*([\d.]+)(?!点)/.test(text)
    ) {
      forcePrice = true;
      expectedPrice = Number(RegExp.$1);
    }
    if (/^(?:下|拍)(\d+)$/.test(text.trim())) {
      expectedPrice = 50;
      action = "coudan";
      forcePrice = true;
    } else if (
      /(?<!\d|第..)0(?=元|[!\d])|0撸|零撸|免单|不是(0|零)不要买|实付0|直接(够)买就是0|到手0/.test(
        text
      )
    ) {
      expectedPrice = 0;
      forcePrice = true;
      action = "coudan";
    } else if (text.includes("一分")) {
      expectedPrice = 0.01;
      action = "coudan";
      forcePrice = true;
    } else if (/(?<!\d|件|份|条)(?<!\d)(0\.\d+)/.test(text)) {
      expectedPrice = Number(RegExp.$1);
      action = "coudan";
      forcePrice = true;
    } else if (
      text.includes("锁单") ||
      text.includes("先锁") ||
      text.includes("速度拍下")
    ) {
      action = "coudan";
      if (expectedPrice > 500) {
        expectedPrice = 500;
      }
    } else if (text.includes("试试")) {
      if (!/\d+点/.test(text)) {
        expectedPrice = 10;
        action = "coudan";
      } else {
        action = "qiangquan";
      }
    } else if (text.includes("叠加")) {
      let r = /(\d+)-(\d+)/g;
      let quote = 0;
      let discount = 0;
      while (r.test(text)) {
        quote = Math.max(+RegExp.$1, quote);
        discount = Math.max(+RegExp.$2, discount);
      }
      if (text.includes("米") || /[^酱]油/.test(text)) {
        if (expectedPrice !== 10) {
          let _p = expectedPrice / quantities[0];
          if (_p > 1.75) {
            expectedPrice = Math.min(10, expectedPrice);
          }
        } else {
          expectedPrice = Math.min(expectedPrice, 50);
        }
      } else if (text.includes("洗衣") || text.includes("洗发")) {
        expectedPrice = Math.min(expectedPrice, 30);
      } else {
        if (text.includes("婴") || text.includes("孕")) {
          expectedPrice = Math.min(expectedPrice, 5);
        } else if (quote > 70) {
          if (!text.includes("衣")) {
            expectedPrice = Math.min(expectedPrice, 20);
          }
        } else {
          expectedPrice = Math.min(expectedPrice, 10);
        }
      }
      if (!/\d+点/.test(text)) {
        action = "coudan";
        diejia = quote;
      } else {
        action = "qiangquan";
      }
    } else if (
      /前\d+(?!分钟)|(?<!\d)0\.\d+|速度|抽奖|淘礼金|领金豆|淘宝搜|(?<!可用|消灭|叠加)(小|聚划算)?红包|虹包|神价|秒杀|神车|手慢无|手快有|好价|神价/.test(
        text
      )
    ) {
      action = "qiangquan";
    } else if (
      /拼购([券卷]|日)|领[券卷]|新[券卷]|领全品|白条[券卷]|吱付[券卷]|支付[券卷]|可领|领取优惠[券卷]|无门槛|史低|漏洞|bug|抢[券卷]|快领|速度领|(\d+)?-\d+[券卷]|领(标题)?下方|领\d+折?[券卷]|防身|福利|(\d|一二三四五六七八九)(毛|分)/.test(
        text
      )
    ) {
      if (type! === "taokouling" && blacklist.find(t => text.includes(t))) {
        return;
      }
      return <Ret>{
        type: type!,
        action: "qiangquan",
        urls,
        quantities,
        expectedPrice,
        datetime: getDate(datetime)
      };
    } else if (text.includes("1元包邮")) {
      if (!/钢化膜|手机膜|数据线/.test(text)) {
        action = "notice";
      }
    } else if (/大米|盐|猫超|有货的上|蟹|桌|椅/.test(text)) {
      action = "notice";
    }
    if (!/(\d+)点/.test(text)) {
      if (expectedPrice < 1 && datetime) {
        action = "coudan";
      }
      if (!action && text.includes("抢单")) {
        action = "coudan";
      }
    }
    // @ts-ignore
    return <Ret>{
      type: type!,
      urls,
      quantities,
      expectedPrice,
      action,
      forcePrice,
      diejia,
      datetime: getDate(datetime),
      jianlou: action === "coudan" && datetime ? 35 : undefined
    };
  }
  if (/速度|锁单|试试|叠加/.test(text)) {
    return <Ret>{
      action: "notice"
    };
  }
}

export function getDate(datetime?: string | Date) {
  if (!datetime) {
    return;
  }
  if (datetime instanceof Date) {
    return datetime.toString();
  }
  let h = +datetime;
  let now = new Date();
  let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h);
  if (h === 0 || now.getHours() > h) {
    date.setDate(date.getDate() + 1);
  }
  return date.toString();
}

export async function getUrls({ urls, platform }: any): Promise<string[]> {
  return Promise.all(urls.map(url => resolveUrl({ data: url }, platform)));
}

export async function getDealedData(data: any) {
  var platform = "taobao";
  if (data.urls[0].includes(".jd.com")) {
    platform = "jingdong";
  }
  data.platform = platform;
  var urls = await getUrls(data);
  data.urls = urls;
  return <Ret & { platform: Platform }>data;
}

export async function getDealedDataFromText(text: string) {
  text = text
    .replace(/\s+/, " ")
    .replace(/&amp;/g, "&")
    .replace(/💰/g, "元")
    .trim();
  var data = resolveText(text);
  data = await getDealedData(data);
  if (!data) {
    throw new Error("无链接");
  }
  return data;
}

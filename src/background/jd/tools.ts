import axios from "axios";
import { request } from "../common/request";
import setting from "./setting";

export function getCookie(name: string) {
  return new Promise<string | null>(resolve => {
    chrome.cookies.get(
      {
        name,
        url: "https://www.jd.com"
      },
      cookie => resolve(cookie && cookie.value)
    );
  });
}

export async function requestData(
  body: any,
  {
    functionId,
    api = "api"
  }: {
    functionId: string;
    api?: string;
  }
) {
  var res = await request.get("https://api.m.jd.com/" + api, {
    qs: {
      client: "wh5",
      clientVersion: "2.0.0",
      agent:
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36",
      lang: "zh_CN",
      networkType: "4g",
      eid: setting.eid,
      fp: setting.fp,
      functionId,
      body: JSON.stringify(body),
      jsonp: "cb",
      loginType: 2,
      _: Date.now()
    },
    type: "jsonp"
  });
  let { data, code, msg } = res;
  if (code !== 0) {
    let err = new Error(msg);
    throw err;
  }
  return data;
}

export function getBaseData() {
  return {
    eid: setting.eid,
    fp: setting.fp
  };
}

export async function resolveUrl(url: string) {
  if (!url.startsWith("https://u.jd.com/")) {
    /* if (url.startsWith('https://wq.jd.com/item/view')) {
      let id = /sku=\d+/
    } */
    return url;
  }
  let html: string = await request.get(url);
  let hrl = /var hrl='([^']+)/.exec(html)![1];
  let p = await axios.get(hrl);
  let l = p.request.responseURL;
  if (
    /^https?:\/\/(?!=www|order|trade|cart|home|mall|bean)\w+\.jd\.com/.test(l)
  ) {
    html = p.data;
    if (/var shopId = "(\d+)";/.test(html)) {
      return `https://shop.m.jd.com/?shopId=${RegExp.$1}`;
    }
  }
  return l;
}

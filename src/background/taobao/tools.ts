// @ts-ignore
import md5 from "js-md5";
import axios from "axios";
import qs_lib from "qs";
import { request } from "../common/request";
import { getJsonpData } from "../common/tool";

export function getCookie(name: string, domain = "taobao") {
  return new Promise<string>((resolve) => {
    chrome.cookies.get(
      {
        name,
        url: `https://www.${domain}.com`,
      },
      (cookie) => resolve(cookie?.value)
    );
  });
}

export function getToken(domain: string) {
  return getCookie("_m_h5_tk", domain);
}

export async function getUserName() {
  return eval(
    `"${decodeURIComponent(
      (await getCookie("dnk")) || (await getCookie("__nk__"))
    )}"`
  );
}

const appKey = "12574478";

export async function requestData(
  api: string,
  {
    data,
    method = "get",
    version = "4.0",
    ttid = "#b#ad##_h5",
    qs,
    referer,
    advance,
    origin,
    apiHost = "taobao",
  }: {
    data: any;
    method?: "get" | "post";
    version?: string;
    qs?: any;
    ttid?: string;
    referer?: string;
    advance?: number;
    origin?: string;
    apiHost?: "tmall" | "taobao";
  }
) {
  var t = Date.now();
  if (advance) {
    t -= advance;
  }
  var data_str = JSON.stringify(data);
  var form: any;
  var token = await getToken(apiHost);
  token = token && token.split("_")![0];
  var params: any = {
    jsv: "2.5.1",
    appKey,
    api,
    v: version,
    type: "originaljson",
    ecode: 1,
    dataType: "json",
    t,
    ttid,
    AntiFlood: true,
    LoginRequest: true,
    H5Request: true,
    post: method === "post" ? 1 : undefined,
    ...qs,
  };
  params.sign = md5([token, t, appKey, data_str].join("&"));
  if (method === "get") {
    params.data = data_str;
  } else {
    form = qs_lib.stringify({
      data: data_str,
    });
  }
  var headers: any;
  if (referer) {
    headers = Object.assign(
      {
        _referer: referer,
      },
      headers
    );
  }
  if (origin) {
    headers = Object.assign(
      {
        _origin: origin,
      },
      headers
    );
  }
  var res = await axios.request({
    url: `https://h5api.m.${apiHost}.com/h5/${api}/${version}/`,
    method,
    params,
    data: form,
    headers,
  });

  data = res.data.data;
  var ret = res.data.ret;
  var arr_msg = ret[ret.length - 1].split("::");
  var code = arr_msg[0];
  var msg = arr_msg[arr_msg.length - 1];
  if (code !== "SUCCESS") {
    let err = new Error(msg);
    if (res.data && res.data.url) {
      err.name = "x5-code";
    } else {
      err.name = api + code;
    }
    throw err;
  }
  return data;
}

export async function resolveTaokouling(password: string) {
  // var data = await requestData("com.taobao.redbull.getpassworddetail", {
  //   data: { password },
  //   version: "1.0",
  // });
  // var { data } = await request.get(
  //   "http://www.taofake.com/index/tools/gettkljm.html",
  //   {
  //     qs: {
  //       tkl: password,
  //     },
  //   }
  // );
  var { data } = await request.form(
    "https://taodaxiang.com/taopass/parse/get",
    {
      content: password,
    }
  );
  return data.url;
}

export async function resolveUrl(url: string) {
  if (!url.startsWith("http")) {
    // url = await taokouling.resolveText(url);
    url = await resolveTaokouling(url);
  } else if (url.startsWith("https://m.tb.cn/")) {
    let { data } = await axios.get(url);
    url = /var url = '([^']+)/.exec(data)![1];
  } else if (
    url.startsWith("https://url.cn/") ||
    url.startsWith("http://t.cn/")
  ) {
    let res = await axios.get(url);
    url = res.request.responseURL;
  }
  if (/^https?:\/\/s.click.taobao.com\/t/.test(url)) {
    let res1 = await axios.get(url);
    let url1 = /real_jump_address\s*=\s*'([^']*)/
      .exec(res1.data)![1]
      .replace(/&amp;/g, "&");
    let res2 = await axios.get(url1, {
      headers: {
        _referer: url,
      },
    });
    url = res2.request.responseURL;
    /* url = await axios.post(
      "http://www.taokouling.com/index/tbclickljjx/",
      {
        url
      },
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Cookie:
            "PHPSESSID=pm3qggbm4u7p8373ogu3aljqj4; UM_distinctid=16df26fbfa43f0-03658146aed134-3c375f0d-1fa400-16df26fbfa549c; tkdg_user_info=think%3A%7B%22id%22%3A%2245137%22%2C%22password%22%3A%2229d82efd358b8a2f85ac0b7d99a8fbe2%22%7D; Hm_lvt_73f904bff4492e23046b74fe0d627b3d=1575264071,1575264385,1575264390,1575264467; CNZZDATA1261806159=583648882-1571728999-https%253A%252F%252Fwww.baidu.com%252F%7C1575270309; Hm_lpvt_73f904bff4492e23046b74fe0d627b3d=1575272041"
        }
      }
    ); */
  }
  return url;
}

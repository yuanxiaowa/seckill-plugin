import { request } from "../../common/request";

const extra_data = {
  appid: "ld",
  client: "apple",
  clientVersion: "8.4.2",
  networkType: "wifi",
  osVersion: "12.3.1",
  openudid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
  uuid: "38276cc01428d153b8a9802e9787d279e0b5cc85"
};

export async function requestDataByFunction(
  functionId: string,
  body: any,
  method: "get" | "post" = "get",
  extra?: Record<string, any>
) {
  var qs: Record<string, string> = {
    functionId
  };
  var data;
  if (method === "get") {
    qs.body = JSON.stringify(body);
    Object.assign(qs, extra, extra_data);
  } else {
    data = Object.assign(
      {
        body: JSON.stringify(body)
      },
      extra_data,
      extra
    );
  }
  var ret = await request({
    url: "https://api.m.jd.com/client.action",
    method,
    headers: {
      "_user-agent":
        "jdapp;iPhone;8.4.2;13.3;38276cc01428d153b8a9802e9787d279e0b5cc85;network/wifi;ADID/3D52573B-D546-4427-BC41-19BE6C9CE864;supportApplePay/3;hasUPPay/1;pushNoticeIsOpen/0;model/iPhone9,2;addressid/1264128857;hasOCPay/0;appBuild/166820;supportBestPay/0;pv/976.14;apprpd/Home_Main;ref/JDWebViewController;psq/13;ads/;psn/38276cc01428d153b8a9802e9787d279e0b5cc85|4642;jdv/0|kong|t_1001480949_|jingfen|c0aa745595be4d9bba7a7c422bd878d3|1578709542835|1578709548;adk/;app_device/IOS;pap/JA2015_311210|8.4.2|IOS 13.3;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
      _origin: "https://api.m.jd.com"
    },
    data,
    dataType: "form",
    qs
  });
  if (typeof ret === "string") {
    ret = JSON.parse(ret);
  }
  var { code, data } = ret;
  if (code !== "0") {
    throw new Error(data);
  }
  return data;
}

export var jr_params = {
  riskDeviceParam: JSON.stringify({
    eid:
      "XPYRQKYPRDZOXAAHSFNAICGWZ2SZUFGXSHY7A76H3BFL7PEZE5EZD6NCYGADCBSQKA4M7LFAXP7QX444SEC7PTRO3Q",
    dt: "iPhone 7 Plus (A1661/A1785/A1786)",
    ma: "",
    im: "",
    os: "iOS",
    osv: "13.3",
    ip: "180.117.160.226",
    apid: "JDJR-App",
    ia: "",
    uu: "",
    cv: "5.3.20",
    nt: "WIFI",
    at: "1",
    fp: "967ded3c77573bf46285db66ed106ed7",
    token:
      "L5TGWHAQ5QAM7PQXAOO6I3SLC4TZTE4GRA6R5XNBNLV6OPLKIDBN4PY5YZH65SHCHSA5FCY2QBFBW"
  })
};

export async function requestJr<T = any>(
  url: string,
  data,
  inner = false
): Promise<T> {
  var res = await request({
    url,
    data: {
      reqData: JSON.stringify(Object.assign({}, data, jr_params))
    },
    referer: "https://m.jr.jd.com/",
    dataType: "form",
    method: "post",
    headers: {
      "_user-agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/application=JDJR-App&deviceId=7B4C588C-8371-4F85-B91D-F015D8C88E90&clientType=ios&iosType=iphone&clientVersion=5.2.32&HiClVersion=5.2.32&isUpdate=0&osVersion=12.3.1&osName=iOS&platform=iPhone 7 Plus (A1661/A1785/A1786)&screen=736*414&src=App Store&ip=2408:84ec:a012:4fe0:8e8:d4c0:79ca:649e&mac=02:00:00:00:00:00&netWork=1&netWorkType=1&stockSDK=stocksdk-iphone_3.0.0&sPoint=MTAwMDUjSlJMaWZlQ2hhbm5lbFZpZXdDb250cm9sbGVyI3RhbmNodWFuZzQwMDFfSlJMaWZlQ2hhbm5lbFZpZXdDb250cm9sbGVyKihudWxsKSrkvJfnrbnmibbotKvlpKfotZst5YWo6YeP&jdPay=(*#@jdPaySDK*#@jdPayChannel=jdfinance&jdPayChannelVersion=5.2.32&jdPaySdkVersion=2.23.3.0&jdPayClientName=iOS*#@jdPaySDK*#@)"
    }
  });
  res = res.resultData;
  if (inner) {
    if (!["0000", "200"].includes(res.code)) {
      console.log(url);
      console.trace();
      throw new Error(res.msg);
    }
    return res.data;
  }
  return res;
}

export async function requestRaw(url, data: string) {
  return request.post(url, data, {
    headers: {
      "_user-agent": "JD4iPhone/166820 (iPhone; iOS 13.3; Scale/3.00)",
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
}

export async function requestRawGet(url) {
  return request.get(url, {
    headers: {
      "_user-agent": "JD4iPhone/166820 (iPhone; iOS 13.3; Scale/3.00)",
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
}

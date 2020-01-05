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
  extra?: Record<string, string>
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
      extra,
      extra_data
    );
  }
  var ret = await request({
    url: "https://api.m.jd.com/client.action",
    method,
    data
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

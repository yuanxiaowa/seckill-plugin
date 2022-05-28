import axios from "axios";
import qs_lib from "qs";
import { getJsonpData } from "./tool";

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";
axios.defaults.paramsSerializer = (data) => {
  return qs_lib.stringify(data);
};

type Method = "get" | "post";
type DataType = "string" | "json" | "jsonp";

interface RequestOption {
  url: string;
  data?: any;
  qs?: Record<string, any>;
  method?: Method;
  headers?: Record<string, string>;
  type?: DataType;
  referer?: string;
  dataType?: "json" | "form";
}

// @ts-ignore
export const request: {
  <T = any>(options: RequestOption): Promise<T>;
  get<T = any>(
    url: string,
    options?: Omit<RequestOption, "url" | "method">
  ): Promise<T>;
  post<T = any>(
    url: string,
    data?: any,
    options?: Omit<RequestOption, "url" | "data" | "method">
  ): Promise<T>;
  jsonp<T = any>(
    url: string,
    options?: Omit<RequestOption, "url" | "type">
  ): Promise<T>;
  form<T = any>(
    url: string,
    data?: any,
    options?: Omit<RequestOption, "url" | "dataType" | "method" | "data">
  ): Promise<T>;
} = async function({
  url,
  data,
  qs,
  method = "get",
  headers,
  type,
  referer,
  dataType,
}) {
  if (referer) {
    headers = {
      _referer: referer,
      ...headers,
    };
  }
  if (dataType === "json") {
    data = JSON.stringify(data);
    headers = {
      "content-type": "application/json",
      ...headers,
    };
  } else if (dataType === "form") {
    data = qs_lib.stringify(data);
  }
  var res = await axios({
    url,
    data,
    params: qs,
    method,
    headers: {
      // _origin: new URL(url).origin,
      ...headers,
    },
  });
  if (res.status >= 300) {
    throw res;
  }
  if (type === "jsonp") {
    return getJsonpData(res.data);
  }
  return res.data;
};

request.get = (url, options) => request(Object.assign({ url }, options));
request.post = (url, data, options) =>
  request(Object.assign({ url, data, method: <Method>"post" }, options));
request.jsonp = (url, options) =>
  request(Object.assign({ url, type: <DataType>"jsonp" }, options));
request.form = (url, data, options) =>
  request(
    // @ts-ignore
    Object.assign(
      { url, method: <Method>"post", dataType: "form", data },
      options
    )
  );

export async function getRedirectedUrl(url: string) {
  var res = await axios.get(url);
  return res.request.responseURL;
}

export async function isRedirectedUrl(url: string) {
  return (await getRedirectedUrl(url)) !== url;
}

// @ts-ignore
window.request = request;

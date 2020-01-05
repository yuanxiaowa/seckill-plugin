const axios = require("axios");
const qs_lib = require("querystring");
const md5 = require("js-md5");

var sign = "479ea491b842c40a2389b1d4506c33db";

var data = {
  body: JSON.stringify({
    monitor_source: "plant_app_plant_index",
    monitor_refer: "plant_shopList",
    version: "8.4.0.0"
  }),
  // appid
  client: "apple",
  clientVersion: "8.4.2",
  st: "1577434210357",
  openudid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
  uuid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
  sv: "121"
};

var s = Object.keys(data)
  // .sort((a, b) => a <= b)
  .reduce(
    (state, key) => `${state}${key}=${encodeURIComponent(data[key])}`,
    ""
  );
console.log(s);
console.log(md5(s));

axios
  .post(
    "https://api.m.jd.com/client.action",
    {
      ...data,
      sign
    },
    {
      params: {
        functionId: "shopTaskList"
      },
      headers: {
        Cookie: `pin=yuanxiaowa_m;wskey=AAJcf7shAEDYu7LaGcbk-nbWLcDnG4Oeoz_J_xZxoK4REAJZkwdZi92N_GfRW2SRoLkV6aTVKDUBACmFY2zf4kM8L-I_bGQf;whwswswws=tQFD84i0iQ5D5JGqRkKjrdp/jMdLdn4WZNvxLhlBwaTiYSiko4ksawh6bqrrw8oeUXeAho8H/02KRTmqivgZiXg==;unionwsws={"jmafinger":"tQFD84i0iQ5D5JGqRkKjrdp\/jMdLdn4WZNvxLhlBwaTiYSiko4ksawh6bqrrw8oeUXeAho8H\/02KRTmqivgZiXg==","devicefinger":"eidI5B820114MEIyQjg1ODgtM0U2Qy00OQ==H7EFGMDYl9hrkgRaHyasfTfnHj8TMpWo8evL4bpDG0OIQXzNNSwh9uzitnan+QAeieHwU9aXjsqhiBwb"}`
      },
      transformRequest(data) {
        return qs_lib.stringify(data);
      }
    }
  )
  .then(({ data }) => console.log(data));

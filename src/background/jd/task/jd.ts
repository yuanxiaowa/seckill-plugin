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
      sign: "6d78be68bd08ad9e6eea153ea362cbd8",
      st: "1561685238868",
      sv: "100"
    }
  );
}

/**
 * 京东优惠券签到领红包
 */
export function signInJdCoupon() {
  return requestRaw(
    "https://api.m.jd.com/client.action?functionId=ccSignInNew",
    "adid=3D52573B-D546-4427-BC41-19BE6C9CE864&area=12_988_47821_48031&body=%7B%22pageClickKey%22%3A%22CouponCenter%22%2C%22eid%22%3A%22eidI5B820114MEIyQjg1ODgtM0U2Qy00OQ%3D%3DH7EFGMDYl9hrkgRaHyasfTfnHj8TMpWo8evL4bpDG0OIQXzNNSwh9uzitnan%2BQAeieHwU9aXjsqhiBwb%22%2C%22shshshfpb%22%3A%22tQFD84i0iQ5D5JGqRkKjrdp%5C/jMdLdn4WZNvxLhlBwaTiYSiko4ksawh6bqrrw8oeUXeAho8H%5C/02KRTmqivgZiXg%3D%3D%22%2C%22childActivityUrl%22%3A%22openapp.jdmobile%253a%252f%252fvirtual%253fparams%253d%257b%255c%2522category%255c%2522%253a%255c%2522jump%255c%2522%252c%255c%2522des%255c%2522%253a%255c%2522couponCenter%255c%2522%257d%22%2C%22monitorSource%22%3A%22cc_sign_ios_index_config%22%7D&build=166820&client=apple&clientVersion=8.4.2&d_brand=apple&d_model=iPhone9%2C2&eid=eidI5B820114MEIyQjg1ODgtM0U2Qy00OQ%3D%3DH7EFGMDYl9hrkgRaHyasfTfnHj8TMpWo8evL4bpDG0OIQXzNNSwh9uzitnan%2BQAeieHwU9aXjsqhiBwb&isBackground=N&joycious=196&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=38276cc01428d153b8a9802e9787d279e0b5cc85&osVersion=13.3&partner=apple&rfs=0000&scope=01&screen=1242%2A2208&sign=1e142f665d41e61347556ecee6e02bd6&st=1578912451044&sv=101&uuid=coW0lj7vbXVin6h7ON%2BtMNFQqYBqMahr&wifiBssid=unknown"
  );
}
import { requestDataByFunction } from "./tools";

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
      openudid: "38276cc01428d153b8a9802e9787d279e0b5cc85",
      sign: "6d78be68bd08ad9e6eea153ea362cbd8",
      st: "1561685238868",
      sv: "100"
    }
  );
}

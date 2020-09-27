import { requestData } from "../tools";
import moment from "moment";
import { formatUrl } from "../../common/tool";
import { ArgSearch } from "../structs";

let prevTime = 0;
let prevData: any;
const url =
  "https://pages.tmall.com/wow/a/act/ju/dailygroup/723/wupr?ut_sk=1.WkOnn8QgYxYDAC42U2ubIAfi_21380790_1593010749859.TaoPassword-QQ.2688&spm=a2159r.13376465.0.0&share_crt_v=1&wh_pid=daily-170313&tk_cps_ut=2&tkFlag=0&ali_trackid=2%3Amm_861730015_1553400420_110284350049%3A1593013398_131_1705734287&sp_tk=77%2BlNmFCVzF2clNDcGTvv6U%3D&type=2&tk_cps_param=861730015&sourceType=other&suid=2D73AC47-64A6-4CB9-A548-12D1BEF8A340&un=76330553bf75bc2614ac4609adad532d&e=KAuYzy4CJwG1FPctOrxNnLYjX5dnbRmoa9Zayan4NwFhGg-LLz6Wj_dhuRmx2XoHREJPtG1mEAntBPF7s_uuFun9vYX4Ahty2Hyr0OpOG9Iko_W9Rx1HRienk9h8MsFR__daPf51h4rZJ8zo8IRxFS4eiZYdr4TBjCuesrAY1eJz4TSEzuGYAlA_uIzAGoXqDEmds0M-bMBkNXSwYM2HwSNkEXXRhXEeNqI69rZv1JNl2AIq07ZjIiYjAC4DzCisb7DB_2x99AgG9POgDCMrIg&ttid=201200%40taobao_iphone_9.8.0&cpp=1&shareurl=true&short_name=h.VpPGexI&sm=f62fe6&app=chrome";
async function getMeta(force_update = false) {
  if (!force_update) {
    if (Date.now() - prevTime < 10 * 60 * 1000) {
      return prevData;
    }
  }
  const {
    resultValue: {
      pvuuid,
      pageInfo: { campaignPageId },
    },
  } = await requestData(
    "mtop.tmall.kangaroo.core.service.route.PageRecommendService",
    {
      data: {
        url,
        cookie: "sm4=320583;hng=CN|zh-CN|CNY|156",
        device: "phone",
        backupParams: "device",
      },
      version: "1.0",
    }
  );
  prevTime = Date.now();
  prevData = {
    pvuuid,
    campaignPageId,
  };
  return prevData;
}

export async function getJuhuasuanList({
  page = 1,
  subSearchType,
}: Partial<ArgSearch>) {
  const { pvuuid, campaignPageId } = await getMeta(page === 1);
  // 5912546
  // 5831003
  const appId = subSearchType;
  const {
    resultValue: {
      [appId]: { data },
    },
  } = await requestData(
    "mtop.tmall.kangaroo.core.service.route.AldLampService",
    {
      data: {
        curPageUrl: url,
        page,
        app: "",
        isbackup: true,
        backupParams: "page",
        appId,
        bizId: "99",
        terminalType: "1",
        _pvuuid: pvuuid,
        wh_pid: Number(campaignPageId),
      },
      version: "1.0",
    }
  );
  let now = moment(moment().format(moment.HTML5_FMT.DATE));
  return {
    more: data.length > 0,
    page,
    items: data.map((item) => {
      // itemStatus: "blank" 还未开始
      // itemStatus: "avil" 已开始的
      var mjContent = item.mjContent;
      if (mjContent) {
        mjContent = JSON.parse(item.mjContent);
        let startTime = moment(mjContent.startTime);
        let d = moment(startTime.format(moment.HTML5_FMT.DATE)).diff(
          now,
          "day"
        );
        let str =
          {
            0: "今天",
            1: "明天",
            2: "后天",
          }[d] || "dd/MM";
        mjContent.startTime_str = startTime.format("HH:mm/" + str);
      }
      return {
        ...item,
        mjContent,
        url: formatUrl(item.itemUrl),
        img: formatUrl(item.picUrl),
        price: +item.actPrice,
        title: item.shortName,
      };
    }),
  };
}

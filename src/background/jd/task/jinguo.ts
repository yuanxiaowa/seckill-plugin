import { requestJr } from "./tools";
import { delay } from "@/background/common/tool";

interface TreeInfo {
  // 升级需要
  upgradeDemand: number;
  treeName: string;
  progressLeft: string;
  // 等级
  level: number;
  fruit: number;
  fruitHarvest: number;
  // 树上的果实
  fruitOnTree: number;
  // 工人数量
  workerSum: number;
  // 容量
  capacity: number;
}

/**
 * 获取金果详情
 */
export function getJinguoInfo() {
  interface T {
    // 昵称
    nick: string;
    treeInfo: TreeInfo & {
      coin: number;
    };
    userInfo: string;
    userToken: string;
    sharePin: string;
    workerList: any[];
    avatar: string;
    firstLogin: boolean;
  }
  return requestJr<T>(
    `https://ms.jr.jd.com/gw/generic/uc/h5/m/login`,
    {
      sharePin: "",
      channelLV: "",
      shareType: 1,
      source: 2
    },
    true
  );
}

export function harvestJinguo(data: { userId: string; userToken: string }) {
  interface T {
    upgrade: boolean;
    treeInfo: TreeInfo;
  }
  return requestJr<T>(
    `https://ms.jr.jd.com/gw/generic/uc/h5/m/harvest`,
    // {"source":2,"sharePin":null,"userId":"EC5B554148D04B120512A21099D81D44","userToken":"6643208177167641D8408BEC3F35F2C4"}
    Object.assign(
      {
        source: 2,
        sharePin: "",
        shareType: 1
      },
      data
    ),
    true
  );
}

/**
 * 金果签到
 * @param workType
 * @param opType 1:执行前置操作 2:领取奖励
 */
export function signJinguo(workType: number, opType: number) {
  interface T {
    opMsg: string;
    // 0：成功 1：失败
    opResult: number;
    // 获得金果数量
    prizeAmount: number;
  }
  return requestJr<T>(
    `https://ms.jr.jd.com/gw/generic/uc/h5/m/doWork`,
    { source: 2, workType, opType },
    true
  );
}

export function getJinguoDayWork() {
  type T = {
    // 奖励数量
    prizeAmount: number;
    prizeType: number;
    workContent: string;
    workName: string;
    // -1:不可操作 0:可操作 1:可领取 2:已完成
    workStatus: -1 | 0 | 1 | 2;
    workType: number;
  }[];
  return requestJr<T>(
    `https://ms.jr.jd.com/gw/generic/uc/h5/m/dayWork`,
    { source: 2 },
    true
  );
}

export async function doHarvest() {
  var { userInfo, userToken } = await getJinguoInfo();
  return harvestJinguo({ userId: userInfo, userToken });
}

export async function doJinguo() {
  var [signData, shareData] = await getJinguoDayWork();
  // signJinguo(signData.workType, 2);
  if (signData.workStatus === 0) {
    await signJinguo(signData.workType, 2);
  }
  console.log("金果分享状态", shareData.workStatus);
  if (shareData.workStatus === 0) {
    await signJinguo(shareData.workType, 1);
    await delay(3000);
    shareData.workStatus = 1;
  }
  if (shareData.workStatus === 1) {
    await signJinguo(shareData.workType, 2);
  }
}

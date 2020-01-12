import { requestJr } from "./tools";

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

export function harvestJinguo(data: { userId: string; userToken: string }) {
  interface T {
    upgrade: boolean;
    treeInfo: TreeInfo;
  }
  return requestJr<T>(
    `https://ms.jr.jd.com/gw/generic/uc/h5/m/harvest`,
    // {"source":2,"sharePin":null,"userId":"EC5B554148D04B120512A21099D81D44","userToken":"6643208177167641D8408BEC3F35F2C4"}
    Object.assign({ source: 2, sharePin: null }, data),
    true
  );
}

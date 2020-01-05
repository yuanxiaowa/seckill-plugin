import { requestDataByFunction } from "./tools";
import { delay } from "../../common/tool";

enum ContionType {
  // 条件判断
  normal,
  list,
  count
}

interface RequestMeta {
  key: string;
  method?: "get" | "post";
  data: any;
  transform?(data: any): any;
  extra?: Record<string, string>;
}

type ActionItem = {
  title: string;
  action: RequestMeta;
} & (
  | {
      type: ContionType.normal;
      test: RequestMeta;
    }
  | {
      type: ContionType.list;
      list: RequestMeta;
      delay?: number;
      transform?(data: any): any;
    }
);

const actions: ActionItem[] = [
  {
    title: "京东签到",
    type: ContionType.normal,
    test: {
      // 获取签到状态
      key: "findBeanIndex",
      data: {
        rnClient: "2",
        monitor_refer: "",
        monitor_source: "bean_app_bean_index",
        source: "AppHome",
        rnVersion: "4.7"
      },
      transform({ status }) {
        return status === "2";
      }
    },
    action: {
      // 签到
      key: "signBeanIndex",
      method: "post",
      data: {
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
      extra: {
        sign: "6d78be68bd08ad9e6eea153ea362cbd8",
        st: "1561685238868"
      }
    }
  },
  {
    title: "转盘",
    type: ContionType.list,
    delay: 1000,
    list: {
      key: "wheelSurfIndex",
      data: { actId: "jgpqtzjhvaoym", appSource: "jdhome" },
      transform({ lotteryCount }) {
        return [...Array(lotteryCount)];
      }
    },
    action: {
      key: "lotteryDraw",
      data: {
        actId: "jgpqtzjhvaoym",
        appSource: "jdhome",
        lotteryCode:
          "mwsevpvqu3t57je23kq7pva3wb6e2sbuc4ihzru63p5pso7sqeq5fz65ajnlm2llhiawzpccizuck"
      }
    }
  }
];

async function doRequest({
  key,
  data,
  transform,
  extra,
  method
}: {
  key: string;
  data: any;
  transform?: Function;
  extra?: any;
  method?: "get" | "post";
}) {
  var res = await requestDataByFunction(key, data, method, extra);
  if (transform) {
    return transform(res);
  }
  return res;
}

async function doAction(action) {
  if (action.type === ContionType.normal) {
    let status = await doRequest(action.test);
    if (status) {
      await doRequest(action.action);
    }
    return;
  }
  if (action.type === ContionType.list) {
    let list = await doRequest(action.list);
    for (let i = 0; i < list.length; i++) {
      let data = action.action;
      if (action.transformActionArg) {
        data = action.transformActionArg(list[i], data);
      }
      await doRequest(data);
      if (action.delay) {
        await delay(action.delay);
      }
    }
  }
}

actions.forEach(doAction);

export async function doNutient() {
  // {"code":"0","data":{"entryId":"2tpyf45pvqnbyoqbns6eertieu","skin":{"landImgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/97119/2/7420/240068/5dfb291fEaa338109/80419a411fd0f458.png","buttonImgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/98773/13/7393/5742/5dfb2941Eddbe7935/142b4aeb28313f2d.png","cloudImgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/86436/3/7344/27831/5dfb2929E6910422b/8328cf767b468070.png","backImgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/108774/29/1141/59478/5dfb292dE915582de/634c32f28afef35a.jpg"},"broadcastList":[{"messageText":"宝宝生气了，要一冰箱的肉肉才能哄好的那种！"},{"messageText":"hi 我是小小豆，成熟了会结京豆哦"},{"messageText":"何以解忧，唯有肉肉"},{"messageText":"打开京东APP搜索“种豆得豆”可以找到本豆豆哦~"},{"messageText":"要多多做任务哦，本豆豆的成长值越高瓜分的京豆越多哦~"},{"messageText":"每周收获的京豆奖励超过48小时未领会悄悄溜走哦，记得及时领取"},{"messageText":"快快长大，要做更有肉的豆豆呀"},{"messageText":"最开心的三件事儿：吃肉！吃肉！吃肉！！！"},{"messageText":"点击【每日签到】能获取更多京豆哦"},{"messageText":"帮忙收取也是获得营养液的隐藏技能哦，快去别人的乐园看看吧"}],"ruleLink":"https://pro.m.jd.com/mall/active/3o5pcJjuj3dK64Wtf5VxHk6GfP6A/index.html","advert":{"imgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/102057/19/7357/9309/5dfb26dfE071cf8b6/3ff8750c5f9ff1b3.gif","linkUrl":"https://pro.m.jd.com/mall/active/CZaa8uXzhG44FGRneS7EfUDnGW9/index.html"},"roundList":[{"roundId":"ikpk2cciepmbooqbns6eertieu","roundState":"1","headImgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/102607/4/7880/15747/5dff95c8E619837fe/a57dd9c269f95919.png","awardState":"6","awardBeans":"39","beanState":"4","growth":"93","redDot":"2","tipBeanEndTitle":"本轮已开奖"},{"roundId":"tpfxnzttfpry2oqbns6eertieu","roundState":"2","headImgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/98361/23/7887/17399/5dff94ccE64c5a3c9/d4a317f50e692c5e.png","awardState":"1","beanState":"1","growth":"1","nutrients":"68","redDot":"2"},{"roundId":"6d4d22durlc4koqbns6eertieu","roundState":"3","headImgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/106041/7/7606/35803/5dfce1bbE6d9b37c9/317fd470684fcf2d.png","awardState":"1","growth":"0","nutrients":"0","redDot":"2"}],"awardList":[{"state":"1","awardName":"每日签到","awardType":"1","timesNutrients":"1","daysNutrients":"1","limitFlag":"2","linkUrl":"openapp.jdmobile://virtual?params={\"category\":\"jump\",\"des\":\"jdreactcommon\",\"modulename\":\"JDReactCollectJDBeans\",\"appname\":\"JDReactCollectJDBeans\",\"ishidden\":true,\"param\":{\"page\":\"collectJDBeansHomePage\",\"source\":\"actest\",\"transparentenable\":true}}"},{"awardName":"关注任务","awardType":"6","daysNutrients":"13","limitFlag":"1","childAwardList":[{"state":"1","awardName":"浏览店铺","awardType":"3","timesNutrients":"1","daysNutrients":"4","limitFlag":"1"},{"state":"1","awardName":"关注商品","awardType":"5","timesNutrients":"1","daysNutrients":"6","limitFlag":"1"},{"state":"1","awardName":"关注频道","awardType":"10","timesNutrients":"1","daysNutrients":"3","limitFlag":"1","linkUrl":"https://h5.m.jd.com/babelDiy/Zeus/3dR9Aagh5K8jZt1855RB5WrcNJHa/index.html"}]},{"state":"1","awardName":"邀请好友","awardType":"2","timesNutrients":"2","daysNutrients":"10","limitFlag":"1"},{"state":"1","awardName":"联合会场","awardType":"4","timesNutrients":"1","daysNutrients":"31","limitFlag":"1","linkUrl":"https://pro.m.jd.com/mall/active/CZaa8uXzhG44FGRneS7EfUDnGW9/index.html"},{"awardName":"更多任务","awardType":"9","daysNutrients":"7","limitFlag":"1","childAwardList":[{"state":"1","awardName":"金融双签","awardType":"7","timesNutrients":"1","daysNutrients":"1","limitFlag":"2","linkUrl":"https://m1.jr.jd.com/integrate/signin/index.html?source=zddd"},{"state":"1","awardName":"评价奖励","awardType":"8","timesNutrients":"6","daysNutrients":"6","limitFlag":"1","linkUrl":"openApp.jdMobile://virtual?params={\"category\":\"jump\",\"des\":\"commentCenter\",\"jumpType\":\"1\"}"}]}],"accessFlag":"2","roundAccessFag":"2","timeNutrientsRes":{"state":"1","countDown":"980","bottleState":"2","nextReceiveTime":"1577434857000","nutrCount":"2"},"purchasePopTxt":"浏览联合会场即可获得1瓶营养液，购买会场商品次日12点前可得30瓶营养液！","commentPopTxt":"评价商品有机会获得营养液，每日最多可获取6瓶营养液!","shareInfo":{"shareTitle":"惊了！有的游戏一言不合就狂撒京豆，快来玩","shareContent":"这是一封来自种豆得豆的邀请函","shareIcon":"https://m.360buyimg.com/mobilecms/jfs/t1/29481/22/5958/5227/5c4538e9Ea92a164e/2488f53a3acd0704.png","shareTitleImage":"https://img12.360buyimg.com/devfe/jfs/t1/22818/22/5934/1759/5c4562f3E395bd4dd/fea7c18329970ad8.png","shareMainTitle":"我在参与种豆得豆活动","shareSubTitle":"邀请你来和我一起种豆","shareImage":"https://img30.360buyimg.com/devfe/jfs/t1/10500/39/9383/143980/5c453c64Eb4600d89/e8f8c914bd6af877.png","shareUrl":"https://plantearth.m.jd.com/s3hare3/plantShareIndex?shareUuid=rekak56n5vpe3mqpjgyldxi4me5ac3f4ijdgqji","atmosImgUrl":"https://m.360buyimg.com/mobilecms/jfs/t1/59624/16/12445/90386/5d9c4778E1cd70c26/b3bd42a8b4f1fde6.png","cardImgUrl":"https://m.360buyimg.com/babel/jfs/t1/87840/39/990/27308/5db7dff2Ed3b1c250/2c6063c770c1e870.png"},"timeNutrsCalenInfo":{"openTxt":"打开营养液收取提醒，一瓶也不错过","openBtnTxt":"开启提醒","closeTxt":"真的不需要提醒了嘛？再考虑一下吧","closeBtnTxt":"关闭提醒","openToastTxt":"小水车营养液收取提醒已开启","closeToastTxt":"小水车营养液收取提醒已关闭","calenTitle":"种豆得豆","calenContent":"小水车已生产完营养液，快来领取吧","calenLinkUrl":"{\"des\":\"jdreactcommon\",\"params\":{\"modulename\":\"JDReactSowAndReap\",\"appname\":\"JDReactSowAndReap\",\"param\":{\"page\":\"JDReactSowAndReap\",\"source\":\"\",\"transparentenable\":true}}}"},"timeNutrsCalenFlag":"2","dynamicSwitch":"1","plantUserInfo":{"plantNickName":"jd_逝水流年","userHeadImg":"https://m.360buyimg.com/mobilecms/jfs/t1/28488/11/5963/1415/5c4597f7E17865e2b/f34d8f9da07e991d.png"},"stealEntrySwitch":"1","farmAdvert":{"storeAdImgUrl":"https://m.360buyimg.com/njmobilecms/jfs/t1/64191/18/11714/12671/5d91cf67Eb4841be7/0081ef39fef9995d.gif","storeAdLinkUrl":"https://h5.m.jd.com/babelDiy/Zeus/2rooSNdvm3kS9y21MYCnek4SaoWj/index.html?babelChannel=8"}}}
  var { awardList } = await requestDataByFunction(
    "plantBeanIndex",
    {
      shareUuid: "",
      monitor_refer: "",
      wxHeadImgUrl: "",
      followType: "1",
      monitor_source: "plant_app_plant_index",
      version: "8.4.0.0"
    },
    "post",
    {
      st: "1577429419023",
      sv: "120"
    }
  );
  var mp /*: Record<string, ActionItem>*/ = {
    3: {
      // {"code":"0","data":{"goodShopList":[{"shopTaskId":"12408","shopId":"1000003015","taskState":"2","shopName":"百雀羚旗舰店京东自营官方店","shopLogo":"https://img14.360buyimg.com/cms/jfs/t21268/82/778994733/6794/6a8cf545/5b18a3b8N532eee65.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000003015"},{"shopTaskId":"12409","shopId":"1000001314","taskState":"2","shopName":"奥克斯空调京东自营旗舰店","shopLogo":"https://img10.360buyimg.com/cms/jfs/t1/78141/18/9567/14874/5da856a4Ee021ddcb/011d46aecdf96eae.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000001314"},{"shopTaskId":"12410","shopId":"1000002826","taskState":"2","shopName":"创维电视京东自营旗舰店","shopLogo":"https://img13.360buyimg.com/cms/jfs/t1/48007/38/11304/6372/5d83ccadEc6f760a2/0a8bc22310ed7a22.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000002826"},{"shopTaskId":"12411","shopId":"778227","taskState":"2","shopName":"立邦旗舰店","shopLogo":"https://img30.360buyimg.com/popshop/jfs/t18541/207/1699204347/13257/3d6857a9/5ad6b1e6Ncc956fe8.jpg","linkUrl":"https://shop.m.jd.com/?shopId=778227"},{"shopTaskId":"12412","shopId":"57885","taskState":"2","shopName":"慕思官方旗舰店","shopLogo":"https://img30.360buyimg.com/popshop/jfs/t14137/315/1726935911/6253/16725936/5a26500cN450aeda1.jpg","linkUrl":"https://shop.m.jd.com/?shopId=57885"},{"shopTaskId":"12413","shopId":"1000072699","taskState":"2","shopName":"车仆京东自营旗舰店","shopLogo":"https://img11.360buyimg.com/cms/jfs/t22633/301/1073004642/6999/e7e17a61/5b50369dNd844d1e3.png","linkUrl":"https://shop.m.jd.com/?shopId=1000072699"}],"moreShopList":[{"shopTaskId":"12347","shopId":"707779","taskState":"2","shopName":"威乐旗舰店","shopLogo":"https://img30.360buyimg.com/popshop/jfs/t7312/158/4111305983/10252/b0b129e0/59cdfea2N7156e7ef.jpg","linkUrl":"https://shop.m.jd.com/?shopId=707779"},{"shopTaskId":"12288","shopId":"1000086171","taskState":"2","shopName":"正大食品（CP）京东自营旗舰店","shopLogo":"https://img11.360buyimg.com/jshopm/jfs/t14965/114/2028807669/4189/f6000ebf/5a72e2e2N007188dd.png","linkUrl":"https://shop.m.jd.com/?shopId=1000086171"},{"shopTaskId":"12343","shopId":"1000097294","taskState":"2","shopName":"锐能工具京东自营旗舰店","shopLogo":"https://img13.360buyimg.com/cms/jfs/t18760/364/2613764323/5641/a54def7b/5aff789aNbc680c0f.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000097294"},{"shopTaskId":"12358","shopId":"1000000946","taskState":"2","shopName":"鱼跃京东自营旗舰店","shopLogo":"https://img10.360buyimg.com/cms/jfs/t1/12045/5/12670/12681/5c99ae5aE3f2c2538/3c717fe5891f9f7d.gif","linkUrl":"https://shop.m.jd.com/?shopId=1000000946"},{"shopTaskId":"12278","shopId":"1000001782","taskState":"2","shopName":"海尔京东自营旗舰店","shopLogo":"https://img12.360buyimg.com/cms/jfs/t1/43619/32/464/12325/5cc25c6bE0903e660/585c49592d4df32b.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000001782"},{"shopTaskId":"12335","shopId":"642452","taskState":"2","shopName":"3M工业品官方旗舰店","shopLogo":"https://img11.360buyimg.com/jshopm/jfs/t3829/243/3286713507/7790/68bbf534/58803454N5ba8aaa3.png","linkUrl":"https://shop.m.jd.com/?shopId=642452"},{"shopTaskId":"12287","shopId":"1000135202","taskState":"2","shopName":"凤祥食品京东自营旗舰店","shopLogo":"https://img13.360buyimg.com/cms/jfs/t1/66032/22/6676/9295/5d4b8db7Eb909ac28/cbec19f49c86db8f.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000135202"},{"shopTaskId":"12293","shopId":"90117","taskState":"2","shopName":"VOA旗舰店","shopLogo":"https://img14.360buyimg.com/cms/jfs/t29146/175/405111515/7824/de4622be/5bf26200Nb4a59405.jpg","linkUrl":"https://shop.m.jd.com/?shopId=90117"},{"shopTaskId":"12328","shopId":"1000128012","taskState":"2","shopName":"hcjyet测量工具京东自营旗舰店","shopLogo":"https://img14.360buyimg.com/cms/jfs/t1/2326/28/14908/8178/5bdc17afE4c50e29d/80a8467b09e1e9a7.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000128012"},{"shopTaskId":"12282","shopId":"1000089686","taskState":"2","shopName":"徐福记京东自营旗舰店","shopLogo":"https://img30.360buyimg.com/popshop/jfs/t7039/116/2634194474/6796/8b0a386f/598d7771N28fa79a3.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000089686"},{"shopTaskId":"12301","shopId":"25789","taskState":"2","shopName":"良品铺子官方旗舰店","shopLogo":"https://img12.360buyimg.com/cms/jfs/t1/4530/18/707/16843/5b9252a6Ec7680221/1142e4e3fe69aadd.jpg","linkUrl":"https://shop.m.jd.com/?shopId=25789"},{"shopTaskId":"12281","shopId":"867956","taskState":"2","shopName":"敷尔佳轩轶专卖店","shopLogo":"https://img12.360buyimg.com/cms/jfs/t1/9880/23/251/5076/5bc9a9f9Ef7d4a7e2/979f052be2429111.png","linkUrl":"https://shop.m.jd.com/?shopId=867956"},{"shopTaskId":"12326","shopId":"1000090691","taskState":"2","shopName":"星工京东自营旗舰店","shopLogo":"https://img13.360buyimg.com/jshopm/jfs/t9379/95/2063424529/29887/a57e8028/59c322d5N87548d8e.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000090691"},{"shopTaskId":"12272","shopId":"1000114151","taskState":"2","shopName":"缤若诗Bifesta京东自营旗舰店","shopLogo":"https://img11.360buyimg.com/cms/jfs/t25678/125/1313533864/6073/340732ed/5b90dbd3Nde4ab426.png","linkUrl":"https://shop.m.jd.com/?shopId=1000114151"},{"shopTaskId":"12295","shopId":"86595","taskState":"2","shopName":"艾莱依旗舰店","shopLogo":"https://img11.360buyimg.com/cms/jfs/t29209/201/893070120/5452/9f7704de/5c00907eN09665689.jpg","linkUrl":"https://shop.m.jd.com/?shopId=86595"},{"shopTaskId":"12350","shopId":"1000278653","taskState":"2","shopName":"仁和京东自营专区","shopLogo":"https://img30.360buyimg.com/popshop/jfs/t1/77938/1/13178/9840/5da80ec7E24948d0f/295d83a9c58d9290.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000278653"},{"shopTaskId":"12299","shopId":"64526","taskState":"2","shopName":"宝岛眼镜旗舰店","shopLogo":"https://img30.360buyimg.com/popshop/jfs/t1942/104/2201652347/8416/e6eb6901/56cbd403Ncf0485ec.png","linkUrl":"https://shop.m.jd.com/?shopId=64526"},{"shopTaskId":"12273","shopId":"1000015562","taskState":"2","shopName":"雅芳(AVON)京东自营旗舰店","shopLogo":"https://img13.360buyimg.com/jshopm/jfs/t5983/4/8766662588/5626/7f2b24/598ac462Nc4263535.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000015562"},{"shopTaskId":"12279","shopId":"1000085162","taskState":"2","shopName":"好想你京东自营旗舰店","shopLogo":"https://img14.360buyimg.com/cms/jfs/t20545/240/1372478667/12826/4b509617/5b28b44fNbdb3ad9c.png","linkUrl":"https://shop.m.jd.com/?shopId=1000085162"},{"shopTaskId":"12310","shopId":"1000128304","taskState":"2","shopName":"新越昌晖搬运工具京东自营旗舰店","shopLogo":"https://img13.360buyimg.com/cms/jfs/t1/4140/39/14010/5625/5bd97390E229643e7/d1ae75b6de39eeca.jpg","linkUrl":"https://shop.m.jd.com/?shopId=1000128304"}]}}
      type: ContionType.list,
      list: {
        method: "post",
        key: "shopTaskList",
        data: {
          monitor_source: "plant_app_plant_index",
          monitor_refer: "plant_shopList",
          version: "8.4.0.0"
        },
        extra: {
          sign: "479ea491b842c40a2389b1d4506c33db",
          st: "1577434210357",
          sv: "121"
        },
        transform({ goodShopList, moreShopList }) {
          // 1: 已操作 2: 未操作
          return goodShopList
            .concat(moreShopList)
            .filter(({ taskState }) => taskState === "2");
        }
      },
      transform(data, { shopId, shopTaskId }) {
        return Object.assign({ shopId, shopTaskId }, data);
      },
      action: {
        // {"code":"0","data":{"nutrState":"2","followState":"1","nutrToast":"营养液走丢了","shopLinkUrl":"openApp.jdMobile://virtual?params={\"category\":\"jump\",\"des\":\"jshopMain\",\"shopId\":\"1000003015\",\"showingUrl\":\"https://self.jd.com/snowandreap?beanNum=0&shopId=1000003015&v_clientVersion=8.4.2&v_client=apple\",\"complexSource\":\"collectCard\",\"sourceInfo\":{\"moduleId\":\"rn-sowAndReap\",\"entrance\":\"种豆得豆\"}}"}}
        // {"code":"0","data":{"nutrState":"1","followState":"1","nutrToast":"恭喜你获得营养液，快去培养小小豆吧","nutrCount":"1","shopLinkUrl":"openApp.jdMobile://virtual?params={\"category\":\"jump\",\"des\":\"jshopMain\",\"shopId\":\"1000001314\",\"showingUrl\":\"https://self.jd.com/snowandreap?beanNum=1&shopId=1000001314&v_clientVersion=8.4.2&v_client=apple\",\"complexSource\":\"collectCard\",\"sourceInfo\":{\"moduleId\":\"rn-sowAndReap\",\"entrance\":\"种豆得豆\"}}"}}
        method: "post",
        key: "shopNutrientsTask",
        data: {
          version: "8.4.0.0",
          monitor_refer: "plant_shopNutrientsTask",
          monitor_source: "plant_app_plant_index"
        },
        extra: {
          sign: "3f321a4e443a9151cb88893e74d2ab3f",
          st: "1577436285630",
          sv: "110"
        },
        transform({ nutrState }) {
          return nutrState === "1";
        }
      }
    }
  };
  function f({ limitFlag, awardType, childAwardList }) {
    if (limitFlag === "1") {
      if (mp[awardType]) {
        doAction(mp[awardType]);
      }
    }
    if (childAwardList) {
      childAwardList.forEach(f);
    }
  }
  awardList.forEach(f);
}

import { requestData } from "../tools";
import { getGoodsInfo } from "../goods";
import setting from "../setting";
import { CartItem, addCart, updateCart, ParamsOfAddCart } from "../cart";
import { VendorInfo } from "../cart";
import { taskManager } from "@/background/common/task-manager";
import { formatUrl } from "@/background/common/tool";
import { request } from "@/background/common/request";

const spm = "a222m.7628550.0.0";
export async function getRawCartListFromMobile() {
  return requestData("mtop.trade.querybag", {
    data: {
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.0.0",
        globalSell: "1",
        spm,
        cartfrom: "detail",
      }),
      isPage: "false",
      extStatus: "0",
      spm,
      cartfrom: "detail",
    },
    version: "5.0",
  });
}

const pattern = /\$\{(.*)\}/;
export async function getCartListFromMobile() {
  var resData = await getRawCartListFromMobile();
  var { hierarchy, data, controlParas } = resData;

  var structure: Record<string, string[]> = hierarchy.structure;

  function getPatternUrl(data: any) {
    var url = data.url;
    if (url.startsWith("$")) {
      url = (<string>controlParas[pattern.exec(data.url)![1]]).replace(
        pattern,
        (_, key) => data[key]
      );
    }
    if (url.startsWith("//")) {
      url = "https:" + url;
    }
    return url;
  }

  function mapper(key: string) {
    var { id, fields } = data[key];
    var {
      title,
      valid,
      settlement,
      quantity: { quantity },
      sellerId,
      cartId,
      shopId,
      itemId,
      sku: { skuId, title: skuName },
      pay: { now },
      pic,
      checked,
    } = fields;
    return <CartItem>{
      id,
      title,
      valid,
      settlement,
      quantity,
      sellerId,
      cartId,
      shopId,
      itemId,
      skuId,
      price: now / 100,
      img: pic.startsWith("//") ? "https:" + pic : pic,
      url: getPatternUrl(fields),
      checked,
      skuName,
    };
  }

  var ret: VendorInfo[] = [];
  function findData(name: string) {
    if (!structure[name]) {
      return;
    }
    var items = structure[name];
    if (items[0].startsWith("shop")) {
      let { id, fields } = data[items[0]];
      // let groups = items.filter(item => item.startsWith("group_"));
      let children: any[] = [];
      items.slice(1).forEach((key) => {
        if (!structure[key]) {
          return;
        }
        let promotions: any[] = [];
        let groupData = data[key];
        const { groupPromotion } = groupData.fields;
        if (groupPromotion) {
          promotions.push({
            title: groupPromotion.title,
            url: formatUrl(groupPromotion.url),
          });
        }

        structure[key].forEach((_item) => {
          const data: any = mapper(_item);
          data.promotions = promotions;
          children.push(data);
        });
      });
      // 店铺
      ret.push({
        id,
        title: fields.title,
        sellerId: fields.sellerId,
        shopId: fields.shopId,
        valid: fields.valid,
        url: getPatternUrl(fields),
        items: children,
      });
    } else {
      if (name === "bundlev2_invalid") {
        let items_jhs = items
          .filter((key) => data[key].fields.titleInCheckBox === "预热")
          .map(mapper);
        if (items_jhs.length > 0) {
          ret.unshift({
            id: "",
            title: "聚划算未开团",
            sellerId: "",
            shopId: "",
            valid: false,
            url: "",
            items: items_jhs,
          });
        }
        let items_invalid = items
          .filter((key) => data[key].fields.titleInCheckBox !== "预热")
          .map(mapper);
        if (items_invalid.length > 0) {
          ret.push({
            id: name,
            title: "失效宝贝",
            sellerId: "",
            shopId: "",
            valid: false,
            url: "",
            items: items_invalid,
          });
        }
        return;
      }
      structure[name].forEach((key) => findData(key));
    }
  }

  findData(hierarchy.root);
  return ret;
}

export async function addCartFromMobile(args: ParamsOfAddCart) {
  var itemId;
  var skuId;
  var res;
  if (/skuId=(\d+)/.test(args.url)) {
    skuId = RegExp.$1;
    itemId = /id=(\d+)/.exec(args.url)![1];
  } else {
    res = await getGoodsInfo(args.url, args.skuId);
    if (res.quantity === 0 && !args.jianlou) {
      throw new Error("无库存了");
    }
    skuId = res.skuId;
    itemId = res.itemId;
  }
  async function handler() {
    try {
      var { cartId } = await requestData("mtop.trade.addbag", {
        data: {
          itemId,
          quantity: args.quantity,
          exParams: JSON.stringify({
            addressId: "9607477385",
            etm: "",
            buyNow: "true",
            _input_charset: "utf-8",
            areaId: "320583",
            divisionId: "320583",
          }),
          skuId,
        },
        method: "post",
        version: "3.1",
      });
      return cartId;
    } catch (e) {}
  }
  if (args.jianlou) {
    return taskManager.registerTask(
      {
        name: "加入购物车捡漏",
        platform: "taobao-mobile",
        comment: res?.title,
        handler,
        time: Date.now() + 1000 * 60 * args.jianlou!,
      },
      0,
      `\n🐱加入购物车刷到库存了`
    );
  }
  return handler();
}

export async function updateCartFromMobile(
  {
    items,
  }: {
    items: any[];
  },
  action: string
) {
  await request.form(
    "https://cart.taobao.com/json/AsyncUpdateCart.do",
    {
      _input_charset: "utf-8",
      tk: "617bb7e57e3e",
      data: JSON.stringify(
        items.map(({ shopId, cartId, quantity, skuId, itemId }) => {
          return {
            shopId,
            comboId: 0,
            shopActId: 0,
            cart: [
              {
                cartId,
                quantity,
                skuId,
                itemId,
              },
            ],
            operate: [cartId],
            type: action,
          };
        })
      ),
      shop_id: 0,
      t: Date.now(),
      type: action,
      ct: "2a466d1898d45b61432b1f0023b5bf47",
      page: 1,
      _thwlang: "zh_CN",
    },
    {
      referer:
        "https://cart.taobao.com/cart.htm?spm=a1z0d.6639537.1997525049.1.c7047484iYgRz5&from=mini&ad_id=&am_id=&cm_id=&pm_id=1501036000a02c5c3739",
    }
  );
  // var { cartId, quantity, skuId } = items[0];
  // var { hierarchy, data }: any = await getRawCartListFromMobile();
  // var updateKey = Object.keys(data).find(
  //   (key) => data[key].fields.cartId === cartId
  // )!;
  // var key = Object.keys(hierarchy.structure).find((key) =>
  //   hierarchy.structure[key].includes(updateKey)
  // )!;
  // var cdata = hierarchy.structure[key].reduce((state, key) => {
  //   var { fields } = data[key];
  //   state[key] = {
  //     fields: {
  //       bundleId: fields.bundleId,
  //       cartId: fields.cartId,
  //       checked: fields.checked,
  //       itemId: fields.itemId,
  //       quantity: fields.quantity.quantity,
  //       shopId: fields.shopId,
  //       valid: fields.valid,
  //     },
  //   };
  //   return state;
  // }, {});
  // Object.assign(cdata[updateKey].fields, {
  //   quantity,
  //   skuId,
  // });
  // // cdata[updateKey].fields.quantity = quantity;
  // var { cartId } = await requestData("mtop.trade.updatebag", {
  //   data: {
  //     p: JSON.stringify({
  //       data: cdata,
  //       operate: { [action]: [updateKey] },
  //       hierarchy,
  //     }),
  //     extStatus: "0",
  //     feature: '{"gzip":false}',
  //     exParams: JSON.stringify({
  //       mergeCombo: "true",
  //       version: "1.0.0",
  //       globalSell: "1",
  //       spm: setting.spm,
  //       cartfrom: "detail",
  //     }),
  //     spm: setting.spm,
  //     cartfrom: "detail",
  //   },
  //   method: "post",
  // });
  // return cartId;
}

export async function getNewCartDatas() {
  const {
    data,
    hierarchy: { root, structure },
    linkage: {
      common: { compress, queryParams, validateParams },
      signature,
    },
  } = await requestData("mtop.trade.query.bag", {
    data: {
      isPage: false,
      extStatus: 0,
      netType: 0,
      exParams: JSON.stringify({
        mergeCombo: "true",
        version: "1.1.1",
        globalSell: "1",
        spm: "a222m.7628550.0.0",
        cartfrom: "detail",
        dataformat: "dataformat_ultron_h5",
      }),
      spm: "a222m.7628550.0.0",
      cartfrom: "detail",
      dataformat: "dataformat_ultron_h5",
      ttid: "h5",
    },
    version: "5.0",
  });
  return {
    data,
    hierarchy: { root, structure },
    linkage: {
      common: { compress, queryParams, validateParams },
      signature,
    },
  };
}

export async function calcPrice(items: any[]) {
  const itemKeys: string[] = [];
  const {
    data: oldData,
    hierarchy: { root, structure },
    linkage,
  } = await getNewCartDatas();
  if (structure.invalidBlock_1) {
    delete structure.invalidBlock_1;
    structure.global_1 = structure.global_1.filter(
      (item) => !item.startsWith("invalid")
    );
  }
  const data = Object.keys(oldData).reduce((acc, key) => {
    const item = oldData[key];
    if (item.submit || item.tag === "global") {
      acc[key] = item;
    } else {
      // if (key.startsWith("item_")) {
      //   itemKeys.push(key);
      // }
      if (items.includes(key)) {
        item.fields.isChecked = "true";
        const checkClickItem = item.events.checkClick[0];
        checkClickItem.fields.checkedItems = [key];
        checkClickItem.fields.isChecked = true;
        acc[key] = item;
      }
    }
    return acc;
  }, {});
  const {
    data: { submit_1 },
  } = await requestData("mtop.trade.update.bag", {
    data: {
      params: JSON.stringify({
        operator: items[0],
        operatorEvent: "checkClick.cartSelect",
        data,
        hierarchy: {
          structure,
        },
        linkage,
      }),
      isPage: false,
      extStatus: 0,
      netType: 0,
      feature: JSON.stringify({ gzip: false }),
      exParams: {
        mergeCombo: "true",
        version: "1.1.1",
        globalSell: "1",
        spm: "a222m.7628550.0.0",
        cartfrom: "detail",
        dataformat: "dataformat_ultron_h5",
      },
      spm: "a222m.7628550.0.0",
      cartfrom: "detail",
      dataformat: "dataformat_ultron_h5",
    },
    method: "post",
  });
  console.log(submit_1);
}

// // @ts-ignore
// window.getNewCartDatas = getNewCartDatas;
// // @ts-ignore
// window.calcPrice = calcPrice;

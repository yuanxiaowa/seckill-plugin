import { request } from "../common/request";
import { getSkuId } from "./goods";

export async function getCartList() {
  var html: string = await request.get(
    "https://p.m.jd.com/cart/cart.action?sceneval=2"
  );
  var text = /window.cartData =([\s\S]*?)(if\s*\(|window\._)/.exec(html)![1];
  var data: {
    traceId: string;
    areaId: string;
    cart: {
      allChecked: string;
      venderCart: {
        // 价格×100
        price: string;
        // 1: 选中 0:未选中
        checkType: string;
        popInfo: {
          vid: string;
          vname: string;
          type: string;
          fbpVender: string;
        };
        sortedItems: {
          itemId: string;
          polyType: string;
          polyItem: {
            checkType: string;
            ts: string;
            price: string;
            products: {
              checkType: string;
              mainSku: {
                id: string;
                name: string;
                maxNum: string;
              };
            }[];
          };
        }[];
      }[];
    };
  } = JSON.parse(text);
  var other = {
    areaId: data.areaId,
    traceId: data.traceId,
  };
  var items = data.cart.venderCart.map((item, i) => {
    var vendor: any = {
      id: item.popInfo.vid + i,
      title: item.popInfo.vname,
      items: [],
      checked: item.checkType === "1",
    };
    item.sortedItems.forEach(({ polyItem, itemId, polyType }: any) => {
      polyItem.products.forEach((product) => {
        var sku = product.mainSku;
        vendor.items.push({
          id: sku.id,
          itemId: itemId,
          title: sku.name,
          cid: sku.cid,
          img: "https://img10.360buyimg.com/cms/s80x80_" + sku.image,
          url: `https://item.jd.com/${sku.id}.html`,
          price: product.price / 100,
          quantity: product.num,
          polyType,
          checked: product.checkType === "1",
        });
      });
    });
    return vendor;
  });
  return {
    other,
    items,
  };
}

function getItype(t, e) {
  var n = 0;
  switch (t) {
    case "1":
      n = 1;
      break;
    case "2":
      n = 4;
      break;
    case "3":
      n = "cmdty" == e ? 11 : "canselectgift" == e ? 10 : "xnzt" == e ? 24 : 9;
      break;
    case "4":
      n =
        "cmdty" === e
          ? 13
          : "canselectgift" === e
          ? 15
          : "selectedgift" === e
          ? 16
          : "xnzt" == e
          ? 29
          : 12;
  }
  return 0 == n && console.error("iType error"), n;
}

async function operateCart(
  url: string,
  data: {
    areaId: string;
    traceId: string;
    items: any[];
  }
) {
  var qs = {
    templete: "1",
    version: "20190418",
    sceneval: "2",
    // mainSku.id,,1,mainSku.id,11,itemid,0
    commlist: data.items
      .map((item) =>
        [
          item.id,
          ,
          item.quantity,
          item.id,
          getItype(item.polyType, "cmdty"),
          // Number(item.polyType).toString(2),
          item.polyType === "1" ? "" : item.itemId,
          0,
        ].join(",")
      )
      .join("$"),
    callback: "checkCmdyCbA",
    type: "0",
    all: data.items.length === 0 ? 1 : 0,
    checked: "0",
    reg: "1",
    traceid: data.traceId,
    locationid: data.areaId,
    t: Math.random(),
  };
  var { errId, errMsg } = await request.get(url, {
    qs,
    referer: "https://p.m.jd.com/cart/cart.action?sceneval=2",
    type: "jsonp",
  });
  if (errId !== "0") {
    throw new Error(errMsg);
  }
}

export async function toggleCartChecked(data) {
  await operateCart(
    `https://wqdeal.jd.com/deal/mshopcart/${
      data.checked ? "checkcmdy" : "uncheckcmdy"
    }`,
    data
  );
}

export async function addCart(args) {
  var { url, quantity }: { url: string; quantity: number } = args;
  var skuId = getSkuId(url);
  // var { errId, errMsg } = await request.get(
  //   "https://wq.jd.com/deal/mshopcart/addcmdy",
  //   {
  //     qs: {
  //       callback: "addCartCBA",
  //       sceneval: "2",
  //       reg: "1",
  //       scene: "2",
  //       type: "0",
  //       commlist: [skuId, , quantity, skuId, 1, 0, 0].join(","),
  //       // locationid: "12-988-40034",
  //       t: Math.random(),
  //     },
  //     referer: `https://item.m.jd.com/product/${skuId}.html`,
  //     type: "jsonp",
  //   }
  // );
  // if (errId !== "0") {
  //   throw new Error(errMsg);
  // }
  await request.get(`https://cart.jd.com/gate.action`, {
    qs: {
      pid: skuId,
      pcount: quantity,
      ptype: 1,
    },
  });
  return skuId;
}

export async function delCart(data: any) {
  await operateCart("https://wqdeal.jd.com/deal/mshopcart/rmvCmdy", data);
}

export async function updateCartQuantity(data: any) {
  await operateCart("https://wqdeal.jd.com/deal/mshopcart/modifycmdynum", data);
}

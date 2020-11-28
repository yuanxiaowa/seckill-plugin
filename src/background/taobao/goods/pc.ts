import { request } from "@/background/common/request";

export async function getGoodsInfoFromPc(url: string, hasForm = false, quantity = 1) {
  url = url.replace("detail.m.tmall.com/", "detail.tmall.com/");
  var html = await request.get(url);
  var text = /TShop\.Setup\(\s*(.*)\s*\);/.exec(html)![1];
  // detail.isHiddenShopAction
  var ret = JSON.parse(text);
  var { itemDO, valItemInfo, valTimeLeft, detail } = ret;
  /* if (!valTimeLeft) {
    throwError("商品已下架");
  } */
  if (hasForm) {
    let form_str = /<form id="J_FrmBid"[^>]*>([\s\S]*?)<\/form>/.exec(html)![1];
    let form_item_r = /\sname="([^"]+)"\s+value="([^"]*)"/g;
    let form: Record<string, string> = {};
    while (form_item_r.test(form_str)) {
      form[RegExp.$1] = RegExp.$2;
    }
    if (!form.buyer_from) {
      form.buyer_from = "ecity";
    }
    let skuId = "0";
    if (itemDO.hasSku) {
      let { skuList, skuMap } = <
        {
          skuList: {
            names: string;
            pvs: string;
            skuId: string;
          }[];
          skuMap: {
            price: string;
            priceCent: number;
            skuId: string;
            stock: number;
          }[];
        }
      >valItemInfo;
      let items = Object.values(skuMap)
        .filter((item) => item.stock > 0)
        .sort((a, b) => a.priceCent - b.priceCent);
      let skuItem = items[0];
      if (skuItem) {
        skuId = skuItem.skuId;
      } else {
        throw new Error("没货了");
      }
    }
    Object.assign(form, {
      root_refer: "",
      item_url_refer: url,

      allow_quantity: itemDO.quantity,
      buy_param: [itemDO.itemId, quantity, skuId].join("_"),
      _tb_token_: "edeb7b783ff65",
      skuInfo: [itemDO.title].join(";"),
      _input_charset: "UTF-8",
      skuId,
      bankfrom: "",
      from_etao: "",
      item_id_num: itemDO.itemId,
      item_id: itemDO.itemId,
      auction_id: itemDO.itemId,
      seller_rank: "0",
      seller_rate_sum: "0",
      is_orginal: "no",
      point_price: "false",
      secure_pay: "true",
      pay_method: "\u6b3e\u5230\u53d1\u8d27",
      from: "item_detail",
      buy_now: itemDO.reservePrice,
      current_price: itemDO.reservePrice,
      auction_type: itemDO.auctionType,
      seller_num_id: itemDO.userId,
      activity: "",
      chargeTypeId: "",
    });
    ret.form = form;
  }
  /* var pdetail = this.req.get("https:" + /var l,url='([^']+)/.exec(html)![1], {
      headers: {
        Referer: url
      }
    });
    var detail_text = await pdetail;
    var {
      defaultModel: {
        deliveryDO: { areaId }
      }
    } = JSON.parse(/\((.*)\)/.exec(detail_text)![1]);
    Object.assign(form, {
      destination: areaId
    }); */
  /* var qs_data = {
      "x-itemid": itemDO.itemId,
      "x-uid": getCookie("unb", setting.cookie)
    }; */
  /* var page = await newPage();
    // await page.goto(url);
    await page.evaluate(form => {
      var ele = document.createElement("form");
      ele.action = "https://buy.tmall.com/order/confirm_order.htm";
      ele.method = "post";
      Object.keys(form).forEach(name => {
        var input = document.createElement("input");
        input.name = name;
        input.value = form[name];
        ele.appendChild(input);
      });
      document.body.appendChild(ele);
      ele.submit();
    }, form); */
  return ret;
}

export async function getStock(arg: {
  url: string;
  id: string;
  skuId?: string;
}) {
  var text = await request.get(
    `https://mdskip.taobao.com/core/initItemDetail.htm?itemId=${arg.id}`,
    {
      referer: arg.url,
    }
  );
  try {
    var res = JSON.parse(text);
    var { defaultModel } = res;
    if (!defaultModel) {
      throw new Error(res.url);
    }
    var { inventoryDO } = defaultModel;
    var { skuQuantity, icTotalQuantity } = <
      {
        skuQuantity: Record<
          string,
          {
            icTotalQuantity: number;
            quantity: number;
            totalQuantity: number;
            type: number;
          }
        >;
        icTotalQuantity: number;
        totalQuantity: number;
      }
    >inventoryDO;
    if (!arg.skuId || !skuQuantity[arg.skuId]) {
      return icTotalQuantity;
    }
    return skuQuantity[arg.skuId].quantity;
  } catch (e) {
    if (e.message.startsWith("https://mdskip.taobao.com")) {
      throw new Error("遇到拦截");
    }
    return 0;
  }
}

export async function getGoodsCollection({ page = 1 }) {
  var html: string = await request.get(
    `https://shoucang.taobao.com/item_collect_n.htm?spm=a1z0k.7385961.1997985201.2.348b10190raj9v`
  );
  var $: any; // = cheerio.load(html);
  var _tb_token_ = /_tb_token_: '(\w+)'/.exec(html)![1];
  var items = $(".J_FavListItem")
    .map((_, ele) => {
      var $ele = $(ele);
      var img = $ele.find(".logo-img").attr("src");
      var $link = $ele.find(".img-controller-img-link");
      var url = $link.attr("href");
      var title = $link.attr("title");
      var id = $ele.data("id");
      return {
        id,
        img,
        url,
        title,
        _tb_token_,
      };
    })
    .get();
  return {
    items,
    more: items.length > 0,
  };
}

export async function delGoodsCollectionFromPc(items: any[]) {
  var text: string = await request.form(
    `https://shoucang.taobao.com/favorite/api/CollectOperating.htm`,
    {
      _tb_token_: items[0]._tb_token_,
      _input_charset: "utf-8",
      favType: 1,
      "favIdArr[]": items.map(({ id }) => id),
      operateType: "delete",
    },
    {
      // form: {
      //   _tb_token_: items[0]._tb_token_,
      //   _input_charset: "utf-8",
      //   favType: 1,
      //   "favIdArr[]": items.map(({ id }) => id),
      //   operateType: "delete"
      // },
      referer:
        "https://shoucang.taobao.com/item_collect.htm?spm=a21bo.2017.1997525053.2.5af911d9umD3GI",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  );
  var { success, errorMsg } = JSON.parse(text);
  if (success) {
    return errorMsg;
  }
  throw new Error(errorMsg);
}

<!--
 * @Author: oudingyin
 * @Date: 2019-08-09 14:04:57
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-31 17:15:38
 -->
<template>
  <div>
    <el-form size="small">
      <el-form-item label="平台">
        <el-radio-group v-model="form_data.platform">
          <el-radio label="taobao">淘宝</el-radio>
          <el-radio label="jingdong">京东</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-col :span="12">
          <el-form-item label="关键字">
            <el-input v-model="form_data.keyword"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form_data.platform==='taobao'">
          <el-form-item>
            <el-checkbox v-model="is_juhuasuan">聚划算</el-checkbox>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-col :span="12">
          <el-form-item label="地址">
            <el-input v-model="url" @blur="onBlur"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="只显示有满减的">
            <el-checkbox v-model="only_double"></el-checkbox>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <!-- <el-col :span="12" v-if="form_data.platform==='taobao'">
          <el-form-item label="津贴">
            <el-input v-model="form_data.g_couponId"></el-input>
          </el-form-item>
        </el-col>
        <template v-else>
          <el-col :span="6">
            <el-form-item label="优惠券id">
              <el-input v-model="form_data.couponbatch"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="店铺id">
              <el-input v-model="form_data.coupon_shopid"></el-input>
            </el-form-item>
          </el-col>
        </template>-->
        <el-col :span="6">
          <el-form-item label="最低价格">
            <el-input v-model="form_data.start_price" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="最高价格">
            <el-input v-model="form_data.end_price" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="额外参数">
            <el-input v-model="extra_params" type="textarea" v-storage="getStorager()" />
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button @click="search">获取</el-button>
        <el-button @click="showCouponDialog">优惠券搜索</el-button>
        <el-button v-if="form_data.platform==='jingdong'" @click="doubleCoudan">0撸</el-button>
        <el-row>
          <el-col :span="12">
            <el-input v-model="filter_kw"></el-input>
          </el-col>
          <el-col :span="12">
            <el-input v-model="filter_not_kw"></el-input>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <el-table
      ref="tb"
      max-height="400"
      :data="filtered_table_data"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="商品名称">
        <template slot-scope="{row}">
          <img :src="row.img" width="50" />
          <a :href="row.url" target="_blank">{{row.title}}</a>
        </template>
      </el-table-column>
      <el-table-column label="价格">
        <template slot-scope="{row}">
          <template v-if="is_juhuasuan&&row.mjContent">
            <b style="color:red">￥{{row.mjContent.promInfos[0].discount/1000*row.price}}</b>
            /
            <span style="color:#aaa">前{{row.mjContent.quantityLimit}}件</span>
            <span>[{{row.mjContent.startTime}}]</span>
          </template>
          ￥{{row.price}}
        </template>
      </el-table-column>
      <el-table-column v-if="only_double" label="凑199数量">
        <template slot-scope="{row}">
          数量：{{coudan_price.num}}
          <span>价格：{{row.coudan_price}}</span>
          <el-button size="small" @click="toCoudan(row)">凑单</el-button>
        </template>
      </el-table-column>
      <el-table-column width="120">
        <template slot-scope="{row}">
          <el-button @click="addCart(row)">加入购物车</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div>
      <el-checkbox>数据附加</el-checkbox>
      <el-button v-if="!is_attach" :disabled="form_data.page<=1" @click="go(-1)">上一页</el-button>
      <el-button v-if="more" @click="go(1)">下一页</el-button>
    </div>
    <el-dialog :visible.sync="show_coupon">
      <div v-for="item of coupons" :key="item.id">
        <el-button @click="chooseCoupon(item)" size="small">选择</el-button>
        <span style="color:red;margin:1em">{{item.quota}}-{{item.discount}}</span>
        <span>{{item.title}}</span>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { goodsList, cartAdd, coudan, getMyCoupons } from "../api";
import bus from "../bus";
import { fromPairs } from "ramda";

@Component
export default class Search extends Vue {
  @Prop() value!: any[];
  tableData: any[] = [];
  multipleSelection: any[] = [];
  more = false;
  pending = false;
  url = "";
  coupons: any[] = [];
  show_coupon = false;
  only_double = false;
  is_juhuasuan = true;
  is_attach = true;

  params: any = {};
  filter_kw = "";
  filter_not_kw = "裤|衣|耳环|T恤|百草味|鞋|外套|真皮|包包|大嘴猴";

  form_data = {
    platform: "taobao",
    keyword: "",
    start_price: 0,
    end_price: 9999,
    page: 1
    // g_couponId: /* "117700001" */ "3485480227",
    // coupon_shopid: 0,
    // g_couponFrom: "mycoupon_pc",
    // shopType: "any",
    // g_couponGroupId: 239140001,
    // couponbatch: "",
    // coupon_id: ""
  };
  onBlur() {
    if (!this.url) {
      return;
    }
    var { searchParams } = new URL(this.url);
    // var params: any = this.params = {};
    if (this.form_data.platform === "jingdong") {
      /* ["coupon&batch", "coupon_shopid"].forEach(key => {
        params[key.replace("&", "")] =
          searchParams.get(key.replace("&", "")) ||
          searchParams.get(key.replace("&", "_"));
      }); */
      this.form_data.keyword = searchParams.get("key")!;
      searchParams.delete("key");
      // params.g_couponId = searchParams.get("coupon_tag_id")!;
    }
    this.params = fromPairs([...searchParams.entries()]);
  }
  addCart(item: any) {
    cartAdd(
      {
        url: item.url,
        quantity: 1
      },
      this.form_data.platform
    );
  }
  search() {
    this.form_data.page = 1;
    this.refresh(true);
  }
  async doubleCoudan() {
    // var f = async (quantity: number) => {
    //   bus.$emit("unselect-all", "jingdong");
    //   var start_price = 189.1 / quantity;
    //   var end_price = 202 / quantity;
    //   var ret = await goodsList(
    //     Object.assign({}, this.form_data, {
    //       start_price,
    //       end_price
    //     })
    //   );
    //   var items = ret.items
    //     .filter(
    //       ({
    //         pfdt
    //       }: {
    //         pfdt: {
    //           m: string;
    //           j: string;
    //           // 1:优惠券 2:满减 4:多少几件 5:几件几折
    //           t: string;
    //         };
    //       }) => pfdt.t === "2" && pfdt.m === "199" && pfdt.j === "100"
    //     )
    //     .map(({ id, price, lowestbuy, url }) => ({
    //       id,
    //       price: Number(price),
    //       lowest: Number(lowestbuy) || 1,
    //       url
    //     }));
    //   if (items.length > 0) {
    //     return handler([
    //       {
    //         url: items[0].url,
    //         quantity
    //       }
    //     ]);
    //   }
    //   return false;
    // };
    // for (let i = 0; i < 100; i++) {
    //   let b = await f(i + 1);
    //   if (b !== false) {
    //     break;
    //   }
    // }
    // async function handler(items: any[]) {
    //   var ids = await Promise.all(
    //     items.map(({ url, quantity }) => cartAdd({ url, quantity }, "jingdong"))
    //   );
    //   await coudan({ data: ids }, "jingdong");
    // }
  }
  getStorager() {
    return {
      name: "search_extra_params",
      value: this.extra_params,
      setValue: (v: string) => {
        this.extra_params = v;
      }
    };
  }
  extra_params = "g_couponGroupId=12786776025";
  async refresh(force_update = false) {
    var extra_params = this.extra_params
      .trim()
      .split(/\r?\n/)
      .map(item => item.trim())
      .filter(Boolean)
      .reduce((state, item) => {
        var [key, value] = item.split("=");
        state[key] = value;
        return state;
      }, {});
    var ret = await goodsList(
      Object.assign(
        {
          is_juhuasuan: this.is_juhuasuan,
          force_update
        },
        this.params,
        extra_params,
        this.form_data
      )
    );
    if (!force_update && this.is_attach) {
      this.tableData = this.tableData.concat(ret.items);
    } else {
      this.tableData = ret.items;
    }
    this.more = ret.more;
  }

  go(num: number) {
    this.form_data.page += num;
    this.refresh();
  }

  onSelectionChange(val: any) {
    this.multipleSelection = val;
  }

  showCouponDialog() {
    this.show_coupon = true;
    this.getCoupons();
  }

  async getCoupons() {
    var { items, page, more } = await getMyCoupons({
      platform: this.form_data.platform
    });
    this.coupons = items.map(item =>
      Object.assign(item, {
        discount: Number(item.discount),
        quota: Number(item.quota)
      })
    );
  }

  chooseCoupon(item) {
    // this.form_data.coupon_shopid = item.shopId;
    // this.form_data.coupon_id = item.couponid;
    // this.form_data.couponbatch = item.batchid;
    this.params = Object.assign({}, item.params);
    this.show_coupon = false;
    this.search();
  }

  toCoudan(item) {
    bus.$emit("coupon", {
      urls: [item.url],
      quantities: [item.num],
      expectedPrice: item.coudan_price
    });
  }

  get filtered_table_data() {
    const filter_kws = this.filter_kw
      .trim()
      .split(/\s+|\|/)
      .filter(Boolean)
      .map(item => item.toLowerCase());
    const filter_not_kws = this.filter_not_kw
      .trim()
      .split(/\s+|\|/)
      .filter(Boolean)
      .map(item => item.toLowerCase());
    let datas = this.tableData;

    if (!this.only_double || this.form_data.platform === "taobao") {
      if (filter_kws.length > 0) {
        datas = datas.filter(item =>
          filter_kws.some(kw => item.title.toLowerCase().includes(kw))
        );
      }
      if (filter_not_kws.length > 0) {
        datas = datas.filter(
          item =>
            !filter_not_kws.some(kw => item.title.toLowerCase().includes(kw))
        );
      }
      return datas;
    }
    datas = datas.filter(
      ({ pfdt, title }) =>
        pfdt.t === "2" && pfdt.m === "199" && pfdt.j === "100"
    );

    if (filter_kws.length > 0) {
      datas = datas.filter(item =>
        filter_kws.some(kw => item.title.toLowerCase().includes(kw))
      );
    }
    if (filter_not_kws.length > 0) {
      datas = datas.filter(
        item =>
          !filter_not_kws.some(kw => item.title.toLowerCase().includes(kw))
      );
    }
    return datas.map(item => {
      item.num = Math.ceil(199 / item.price);
      item.coudan_price = item.num * item.price;
      return item;
    });
  }
}
</script>

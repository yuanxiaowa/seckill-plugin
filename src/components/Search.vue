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
      <el-form-item label="关键字">
        <el-input v-model="form_data.keyword"></el-input>
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
        <template slot-scope="{row}">￥{{row.price}}</template>
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
      <el-button :disabled="form_data.page<=1" @click="go(-1)">上一页</el-button>
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
  only_double = true;

  params: any = {};

  form_data = {
    platform: "jingdong",
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
    this.refresh();
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
  async refresh() {
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
      Object.assign({}, this.params, extra_params, this.form_data)
    );
    this.tableData = ret.items;
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
    if (!this.only_double || this.form_data.platform === "taobao") {
      return this.tableData;
    }
    return this.tableData
      .filter(
        ({ pfdt }) => pfdt.t === "2" && pfdt.m === "199" && pfdt.j === "100"
      )
      .map(item => {
        item.num = Math.ceil(199 / item.price);
        item.coudan_price = item.num * item.price;
        return item;
      });
  }
}
</script>

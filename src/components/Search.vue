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
            <el-input v-model="extra_params" type="textarea" />
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button @click="search">获取</el-button>

        <Coupons :platform="form_data.platform" @select="chooseCoupon">
          <el-button>优惠券搜索</el-button>
        </Coupons>
        <el-button v-if="form_data.platform==='jingdong'" @click="doubleCoudan">0撸</el-button>
      </el-form-item>
    </el-form>
    <data-list-wrapper
      ref="tb"
      :fetcher="fetcher"
      :filters="{keys:['title']}"
      :excludeFilters="{keys:['title'],default:defaultExcudeFilter}"
      :extraFilter="filterDatas"
      :columns="columns"
      :max-height="500"
    >
      <template slot-scope="{row}" slot="actions">
        <el-button @click="addCart(row)" size="small">加入购物车</el-button>
        <el-button @click="showQrcode(row)" size="small">查看二维码</el-button>
      </template>
    </data-list-wrapper>
  </div>
</template>

<script lang="tsx">
import { Component, Prop, Vue } from "vue-property-decorator";
import { goodsList, cartAdd, coudan } from "../api";
import bus from "../bus";
import { fromPairs } from "ramda";
import storageMixin from "@/mixins/storage";
import Coupons from "./Coupons.vue";
import DataListWrapper from "./DataListWrapper.vue";
import QRCode from "qrcode";

@Component({
  components: {
    Coupons,
    DataListWrapper
  },
  mixins: [
    storageMixin({
      key: "extra_params",
      skey: "search_extra_params",
      defaultValue: "g_couponGroupId=12786776025"
    })
  ]
})
export default class Search extends Vue {
  @Prop() value!: any[];
  url = "";
  coupons: any[] = [];
  only_double = false;
  is_juhuasuan = true;

  params: any = {};
  defaultExcudeFilter = "裤|衣|耳环|T恤|百草味|鞋|外套|真皮|包包|大嘴猴";

  form_data = {
    platform: "taobao",
    keyword: "",
    start_price: 0,
    end_price: 9999
    // g_couponId: /* "117700001" */ "3485480227",
    // coupon_shopid: 0,
    // g_couponFrom: "mycoupon_pc",
    // shopType: "any",
    // g_couponGroupId: 239140001,
    // couponbatch: "",
    // coupon_id: ""
  };

  columns = [
    {
      label: "商品名称",
      prop: "title",
      render: this.renderTitle,
      width: 300
    },
    {
      label: "价格",
      prop: "price",
      width: 100,
      formatter(row) {
        return `￥${row.price}`;
      }
    },
    {
      label: "聚划算抢名额",
      align: "center",
      show: this.isJuhuasuan,
      children: [
        {
          label: "价格",
          prop: "price",
          width: 100,
          color: "red",
          formatter(row) {
            return `￥${(row.mjContent.promInfos[0].discount / 1000) *
              row.price}`;
          }
        },
        {
          label: "名额",
          width: 100,
          prop: "mjContent.quantityLimit",
          color: "#aaa"
        },
        {
          label: "时间",
          width: 150,
          prop: "mjContent.startTime_str",
          filters: [
            { text: "今天", value: "今天" },
            { text: "明天", value: "明天" },
            { text: "后天", value: "后天" }
          ],
          "filter-method"(value, row) {
            return row.mjContent.startTime_str.includes(value);
          }
        }
      ]
    }
  ];

  showQrcode(row) {
    QRCode.toDataURL(row.url).then(url => {
      this.$alert(
        // @ts-ignore
        <img src={url} />,
        "二维码",
        {
          center: true,
          closeOnClickModal: true,
          closeOnPressEscape: true
        }
      );
    });
  }

  isJuhuasuan() {
    return this.is_juhuasuan;
  }

  renderTitle({ row }) {
    return (
      <span>
        <img src={row.img} width="50" />
        <a href={row.url} target="_blank">
          {row.title}
        </a>
      </span>
    );
  }
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
  extra_params = "";

  search() {
    (this.$refs.tb as DataListWrapper).reload();
  }

  fetcher({ page }, force_update) {
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
    console.log(force_update);
    return goodsList(
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
  }

  chooseCoupon({ params }) {
    // this.form_data.coupon_shopid = item.shopId;
    // this.form_data.coupon_id = item.couponid;
    // this.form_data.couponbatch = item.batchid;
    this.params = params;
    this.search();
  }

  toCoudan(item) {
    bus.$emit("coupon", {
      urls: [item.url],
      quantities: [item.num],
      expectedPrice: item.coudan_price
    });
  }

  filterDatas(datas) {
    return datas.map(item => {
      item.num = Math.ceil(199 / item.price);
      item.coudan_price = item.num * item.price;
      return item;
    });
  }
}
</script>

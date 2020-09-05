<!--
 * @Author: oudingyin
 * @Date: 2019-07-15 08:54:29
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-07 11:39:48
 -->
<template>
  <el-form label-width="80px">
    <el-form-item>
      <el-col :span="6">
        <el-form-item label="平台">
          <el-radio-group v-model="platform">
            <el-radio label="auto">自动选择</el-radio>
            <el-radio label="taobao">淘宝</el-radio>
            <el-radio label="jingdong">京东</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="捡漏">
          <el-input :disabled="!force_jianlou" v-model="jianlou">
            <el-checkbox slot="prepend" v-model="force_jianlou"></el-checkbox>
            <span slot="append">分钟</span>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-checkbox v-model="from_cart">加车购买</el-checkbox>
        <el-checkbox :value="!no_relay" @input="no_relay=!$event">接力</el-checkbox>
      </el-col>
      <el-col :span="6">
        <el-form-item label="pc购买">
          <el-checkbox v-model="from_pc"></el-checkbox>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="地址">
          <address-picker v-model="addressId"></address-picker>
        </el-form-item>
      </el-col>
    </el-form-item>
    <el-form-item label="解析">
      <goods-resolver
        @datas="datas=$event"
        @metadata="metadata=$event"
        @text-change="innerText=$event"
      />
    </el-form-item>
    <el-form-item>
      <el-col :span="12">
        <el-form-item label="期望价格">
          <el-input :disabled="!forcePrice" v-model="expectedPrice">
            <el-checkbox slot="prepend" v-model="forcePrice" label></el-checkbox>
            <el-checkbox
              v-if="realPlatform==='taobao'"
              slot="append"
              label="猫超凑0.01"
              v-model="mc_dot1"
            ></el-checkbox>
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="备注">
          <el-input type="textarea" v-model="memo"></el-input>
        </el-form-item>
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-col :span="8">
        <el-form-item label="日期">
          <date-picker v-model="datetime"></date-picker>
        </el-form-item>
      </el-col>
      <el-col :span="8" v-if="realPlatform==='taobao'">
        <el-form-item label="猫超凑单">
          <el-input v-model="price_coudan">
            <span slot="append">元</span>
          </el-input>
        </el-form-item>
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="doQiangdan">抢单</el-button>
      <el-button type="warning" @click="doQiangquan">抢券</el-button>
      <el-button @click="doAddCart" type="warning">加入购物车</el-button>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="tsx">
import { Component, Vue, Watch } from "vue-property-decorator";
import DatePicker from "./DatePicker.vue";
import AddressPicker from "./AddressPicker.vue";
import GoodsResolver from "./GoodsResolver.vue";
import { Platform } from "../handlers";
import {
  buyDirect,
  coudan,
  cartAdd,
  getQrcode,
  goodsList,
  resolveUrl,
  qiangquan as qiangquan_api,
} from "../api";
import { qiangquan } from "../msg/order";
import bus from "../bus";
import { sendMsg } from "../msg";
import { getDealedData, getDealedDataFromText } from "../msg/tools";
import storageMixin from "@/mixins/storage";

interface InfoItem {
  url: string;
  platform: Platform;
  quantity: number;
  skus?: number[];
  expectedPrice?: number;
  datetime?: string;
  mc_dot1?: boolean;
  price_coudan?: number;
  jianlou?: number;
  from_cart?: boolean;
  from_pc?: boolean;
  t?: string;
  skuId?: string;
}

type InfoItemNoUrl = Pick<
  InfoItem,
  | "platform"
  | "quantity"
  | "skus"
  | "expectedPrice"
  | "datetime"
  | "mc_dot1"
  | "price_coudan"
  | "jianlou"
  | "from_cart"
  | "from_pc"
  | "t"
>;

function getPlatform(text: string) {
  if (/\.jd\.com\//.test(text)) {
    return "jingdong";
  }
  return "taobao";
}

@Component({
  components: {
    DatePicker,
    AddressPicker,
    GoodsResolver,
  },
  mixins: [
    storageMixin({
      key: "text",
      skey: "goods-code",
      defaultValue: `账号体检中心
￥meVo1ve5Vi9￥`,
    }),
  ],
})
export default class Buy extends Vue {
  datetime = "";
  platform: "auto" | Platform = "auto";
  memo = "";
  expectedPrice = 0;
  forcePrice = false;
  mc_dot1 = false;
  price_coudan = 0;
  force_jianlou = true;
  jianlou = 30;
  from_cart = false;
  from_pc = false;
  no_relay = true;

  addressId = "";

  datas: any[] = [];
  metadata: any = {};
  innerText = "";

  async doAddCart() {
    // var data = await this.doToQiangquan(this.text);
    await Promise.all(
      this.datas.map((item) =>
        cartAdd(
          {
            ...item,
            jianlou: this.jianlou,
          },
          item.platform
        )
      )
    );
    this.$notify.success("已加入购物车");
  }

  async doQiangdan() {
    // var data = await this.doToQiangquan(this.text);
    this.$notify.success("执行直接购买");
    if (this.datas.length === 0) {
      throw new Error("无链接");
    }
    const datas = [...this.datas];
    const { platform } = this.metadata;
    if (!this.price_coudan && datas.length === 1) {
      buyDirect(
        {
          ...datas[0],
          expectedPrice: this.forcePrice
            ? +this.expectedPrice
            : this.metadata.expectedPrice,
          mc_dot1: this.mc_dot1,
          jianlou: this.force_jianlou ? this.jianlou : undefined,
          from_cart: this.from_cart,
          from_pc: this.from_pc,
          ignoreRepeat: true,
          no_relay: this.no_relay,
          other: {
            memo: this.memo,
          },
          addressId: this.addressId,
        },
        // @ts-ignore
        this.datetime || this.metadata.datetime,
        platform
      );
    } else {
      this.$notify.success("开始凑单");
      bus.$emit("unselect-all", platform);
      if (this.price_coudan) {
        let [{ url }] = await goodsList({
          platform,
          start_price: this.price_coudan,
        });
        datas.push({
          url,
          quantity: 1,
        });
      }
      coudan(this.datas, platform);
    }
  }

  prevUrl!: string;

  async doQiangquan(has_tip = true) {
    // var data = await getDealedDataFromText(this.text);
    const { urls, platform } = this.metadata;
    if (has_tip && this.prevUrl === urls[0]) {
      if (!(await this.$confirm("与上次链接相同，要继续操作吗？"))) {
        throw new Error("重复领取");
      }
    }
    this.prevUrl = urls[0];
    this.$notify.success("开始抢券");
    await qiangquan(urls, has_tip ? this.datetime : "", platform);
  }

  // async qiangquan_old(url: string, arg: InfoItemNoUrl, force = false) {
  //   this.prevUrl = url;
  //   this.$notify.success("开始抢券");
  //   var res = await qiangquan_api({ data: url }, arg.t!, arg.platform);
  //   if (res) {
  //     if (!res.success) {
  //       let msg;
  //       if (res.manual) {
  //         var qurl = await getQrcode(url);
  //         sendMsg("手动领取优惠券\n" + qurl);
  //         msg = (
  //           <div style="text-align:center">
  //             <p>手动扫描领取优惠券</p>
  //             <img src={qurl} />
  //             <el-input value={url} />
  //           </div>
  //         );
  //       } else {
  //         if (!force) {
  //           msg = "领券失败，要继续吗？";
  //         }
  //       }
  //       if (msg) {
  //         let b = await this.$confirm(msg, {
  //           title: "提示",
  //           closeOnClickModal: false,
  //         });
  //         if (!b) {
  //           throw new Error("领券失败");
  //         }
  //       }
  //     }
  //     url = res.url || url;
  //   }
  //   return url;
  // }

  // async doToQiangquan(text: string, datetime?: any) {
  //   var data = await getDealedDataFromText(this.text);
  //   var urls = await qiangquan(data.urls, datetime, data.platform);
  //   data.urls = urls
  //     .filter(Boolean)
  //     .map((item) => item.url)
  //     .filter(Boolean);
  //   return data;
  // }

  mounted() {}

  reset() {
    this.forcePrice = false;
    this.expectedPrice = 0;
    this.mc_dot1 = false;
    this.price_coudan = 0;
    this.force_jianlou = false;
    this.jianlou = 15;
    this.from_cart = false;
  }

  get realPlatform() {
    if (this.platform === "auto") {
      return getPlatform(this.innerText);
    }
    return this.platform;
  }
}
</script>

<style>
</style>

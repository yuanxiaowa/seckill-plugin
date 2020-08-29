<!--
 * @Author: oudingyin
 * @Date: 2019-07-15 08:54:29
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-07 11:39:48
 -->
<template>
  <el-form label-width="80px" size="small">
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
        <el-checkbox :value="!no_interaction" @input="no_interaction=!$event">互助</el-checkbox>
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
    <el-form-item>
      <el-col :span="10">
        <el-form-item label="文本">
          <el-input type="textarea" v-model="text" autosize></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-button @click="saveRecorder" @disabled="!text">保存</el-button>
        <el-button @click="show_recorder=true">记录</el-button>
        <text-recorder v-model="show_recorder" @data="text=$event" ref="recorder" />
      </el-col>
      <el-col :span="12">
        <el-form-item label="备注">
          <el-input type="textarea" v-model="memo"></el-input>
        </el-form-item>
      </el-col>
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
        <el-form-item label="规格">
          <el-input v-model="skus">
            <el-button small slot="append" @click="chooseSku">选择</el-button>
          </el-input>
          <sku-picker v-model="show_sku_picker" :url="goods_url" @change="onSkuChange"></sku-picker>
        </el-form-item>
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-col :span="8">
        <el-form-item label="数量">
          <el-input-number v-model.number="num"></el-input-number>
        </el-form-item>
      </el-col>
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
import TextRecorder from "./TextRecorder.vue";
import SkuPicker from "./SkuPicker.vue";
import AddressPicker from "./AddressPicker.vue";
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
import {
  resolveText,
  getDealedData,
  getDealedDataFromText,
} from "../msg/tools";
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
    TextRecorder,
    SkuPicker,
    AddressPicker,
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
  text = "";
  datetime = "";
  num = 1;
  platform: "auto" | Platform = "auto";
  skus = "";
  memo = "";
  expectedPrice = 0;
  forcePrice = false;
  mc_dot1 = false;
  price_coudan = 0;
  force_jianlou = true;
  jianlou = 30;
  from_cart = false;
  from_pc = false;
  no_interaction = false;

  show_recorder = false;
  skuId = "";
  addressId = "";

  saveRecorder() {
    (this.$refs.recorder as TextRecorder).addText(this.text);
    this.$notify.success("保存成功");
  }

  goods_url = "";
  show_sku_picker = false;
  async chooseSku() {
    var data = await this.doQiangquan(false);
    this.show_sku_picker = true;
    var [url] = data.urls;
    this.goods_url = url;
  }
  onSkuChange(skuId: string) {
    this.skuId = skuId;
    this.show_sku_picker = false;
  }
  @Watch("text")
  onTextChanged() {
    this.goods_url = "";
    this.skuId = "";
  }

  /* async execAction(
    fn: (url: string, item: InfoItemNoUrl) => any,
    text = this.text,
    item: InfoItemNoUrl = {
      platform: this.realPlatform,
      quantity: this.num,
      skus: this.getSkus(),
      expectedPrice: this.forcePrice ? this.expectedPrice : undefined,
      datetime: this.datetime,
      mc_dot1: this.mc_dot1,
      jianlou: this.force_jianlou ? Number(this.jianlou) : undefined,
      from_cart: this.from_cart,
      from_pc: this.from_pc,
      t: this.datetime
    }
  ) {
    var urls = await this.getUrls(text, item.platform);
    urls.forEach(url => {
      fn(url, item);
    });
  } */

  getSkus() {
    var skus = this.skus.trim();
    if (skus) {
      return skus.split(/,|\s+/).map(Number);
    }
  }

  async doAddCart() {
    var data = await this.doToQiangquan(this.text);
    await Promise.all(
      data.urls.map((url, i) =>
        cartAdd(
          {
            url,
            quantity: this.num > 1 ? Number(this.num) : data.quantities[i],
            skus: this.getSkus(),
            skuId: this.skuId,
            jianlou: this.jianlou,
          },
          data.platform
        )
      )
    );
    this.$notify.success("已加入购物车");
  }

  async doQiangdan() {
    var data = await this.doToQiangquan(this.text);
    this.$notify.success("执行直接购买");
    if (data.urls.length === 0) {
      throw new Error("无链接");
    }
    if (!this.price_coudan && data.urls.length === 1) {
      buyDirect(
        {
          url: data.urls[0],
          quantity: this.num === 1 ? data.quantities[0] : this.num,
          skus: this.getSkus(),
          expectedPrice: this.forcePrice
            ? +this.expectedPrice
            : data.expectedPrice,
          mc_dot1: this.mc_dot1,
          jianlou: this.force_jianlou ? this.jianlou : undefined,
          from_cart: this.from_cart,
          from_pc: this.from_pc,
          ignoreRepeat: true,
          no_interaction: this.no_interaction,
          other: {
            memo: this.memo,
          },
          skuId: this.skuId,
          addressId: this.addressId,
        },
        // @ts-ignore
        this.datetime || data.datetime,
        data.platform
      );
    } else {
      this.$notify.success("开始凑单");
      bus.$emit("unselect-all", data.platform);
      if (this.price_coudan) {
        let [{ url }] = await goodsList({
          platform: data.platform,
          start_price: this.price_coudan,
        });
        data.urls[data.urls.length] = url;
        data.quantities[data.urls.length] = 1;
      }
      coudan(data, data.platform);
    }
  }

  prevUrl!: string;

  async doQiangquan(has_tip = true) {
    var data = await getDealedDataFromText(this.text);
    if (has_tip && this.prevUrl === data.urls[0]) {
      if (!(await this.$confirm("与上次链接相同，要继续操作吗？"))) {
        throw new Error("重复领取");
      }
    }
    this.prevUrl = data.urls[0];
    this.$notify.success("开始抢券");
    var urls = await qiangquan(
      data.urls,
      has_tip ? this.datetime : "",
      data.platform
    );
    data.urls = urls
      .filter(Boolean)
      .map((item) => item.url)
      .filter(Boolean);
    return data;
  }

  async qiangquan_old(url: string, arg: InfoItemNoUrl, force = false) {
    this.prevUrl = url;
    this.$notify.success("开始抢券");
    var res = await qiangquan_api({ data: url }, arg.t!, arg.platform);
    if (res) {
      if (!res.success) {
        let msg;
        if (res.manual) {
          var qurl = await getQrcode(url);
          sendMsg("手动领取优惠券\n" + qurl);
          msg = (
            <div style="text-align:center">
              <p>手动扫描领取优惠券</p>
              <img src={qurl} />
              <el-input value={url} />
            </div>
          );
        } else {
          if (!force) {
            msg = "领券失败，要继续吗？";
          }
        }
        if (msg) {
          let b = await this.$confirm(msg, {
            title: "提示",
            closeOnClickModal: false,
          });
          if (!b) {
            throw new Error("领券失败");
          }
        }
      }
      url = res.url || url;
    }
    return url;
  }

  async doToQiangquan(text: string, datetime?: any) {
    var data = await getDealedDataFromText(this.text);
    var urls = await qiangquan(data.urls, datetime, data.platform);
    data.urls = urls
      .filter(Boolean)
      .map((item) => item.url)
      .filter(Boolean);
    return data;
  }

  mounted() {}

  reset() {
    this.num = 1;
    this.forcePrice = false;
    this.text = "";
    this.expectedPrice = 0;
    this.mc_dot1 = false;
    this.price_coudan = 0;
    this.force_jianlou = false;
    this.jianlou = 15;
    this.from_cart = false;
  }

  get realPlatform() {
    if (this.platform === "auto") {
      return getPlatform(this.text);
    }
    return this.platform;
  }
}
</script>

<style>
</style>

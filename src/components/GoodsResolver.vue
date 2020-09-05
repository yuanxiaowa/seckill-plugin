<!--
 * @Author: oudingyin
 * @Date: 2019-07-15 08:54:29
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-07 11:39:48
 -->
<template>
  <div>
    <el-form-item>
      <el-col :span="10">
        <el-form-item label="文本">
          <el-input type="textarea" v-model="text" @change="onTextChange" autosize></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-button
          @click="saveRecorder"
          @disabled="!text"
          icon="el-icon-collection"
          circle
          title="保存"
        ></el-button>
        <el-button @click="show_recorder=true" icon="el-icon-s-odrer" circle title="记录"></el-button>
        <text-recorder v-model="show_recorder" @data="text=$event" ref="recorder" />
      </el-col>
    </el-form-item>
    <div>
      <div v-for="item of datas" :key="item.url">
        <a target="_blank" :url="item.url">{{item.url}}</a>
        <el-button small slot="append" @click="item.show_sku_picker=true">选择</el-button>
        <sku-picker
          v-model="item.show_sku_picker"
          :url="item.url"
          @change="onSkuChange(item, $event)"
        ></sku-picker>
        <el-form-item label="数量">
          <el-input-number v-model.number="item.quantity"></el-input-number>
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script lang="tsx">
import { Component, Emit, Vue, Watch } from "vue-property-decorator";
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

const debounce = function <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) {
  let t: any = 0;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

@Component({
  components: {
    TextRecorder,
    SkuPicker,
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
  show_recorder = false;

  datas: {
    url: string;
    quantity: number;
    skuId?: string;
    show_sku_picker?: boolean;
  }[] = [];

  onTextChange = debounce(async (text: string) => {
    this.$emit("text-change");
    if (!text) {
      this.datas = [];
      return;
    }
    var data = await getDealedDataFromText(this.text);
    var urls = await qiangquan(data.urls, undefined, data.platform);
    this.datas = urls
      .filter(Boolean)
      .map((item) => item.url)
      .filter(Boolean)
      .map((url) => ({
        url,
        quantity: 1,
        show_sku_picker: false,
      }));
  }, 200);

  onSkuChange(item, { label, value }: { label: string; value: string }) {
    item.skuId = value;
    item.show_sku_picker = false;
  }

  saveRecorder() {
    (this.$refs.recorder as TextRecorder).addText(this.text);
    this.$notify.success("保存成功");
  }

  reset() {
    this.text = "";
  }
}
</script>
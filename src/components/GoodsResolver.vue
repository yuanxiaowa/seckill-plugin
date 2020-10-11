<!--
 * @Author: oudingyin
 * @Date: 2019-07-15 08:54:29
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-07 11:39:48
 -->
<template>
  <el-row :gutter="10">
    <el-col :span="11">
      <el-form-item>
        <el-form-item label="文本">
          <el-input type="textarea" v-model="text" @change="onTextChange" autosize></el-input>
        </el-form-item>
        <div style="text-align:center">
          <el-button
            icon="el-icon-refresh"
            :loading="loading"
            @click="resolve(text)"
            circle
            title="刷新"
          ></el-button>
          <el-button
            @click="saveRecorder"
            @disabled="!text"
            icon="el-icon-collection"
            circle
            title="保存"
          ></el-button>
          <el-button @click="show_recorder=true" icon="el-icon-s-operation" circle title="记录"></el-button>
          <text-recorder v-model="show_recorder" @data="text=$event" ref="recorder" />
        </div>
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <div class="goods-list">
        <div v-for="item of datas" :key="item.url" class="df">
          <div class="flex-1 text-ellipse">
            <a target="_blank" :href="item.url">{{item.url}}</a>
          </div>
          <div>
            <el-button small @click="item.show_sku_picker=true">选择</el-button>
            <sku-picker
              v-model="item.show_sku_picker"
              :url="item.url"
              @change="onSkuChange(item, $event)"
            ></sku-picker>
            <goods-item-coudan
              style="margin:0 1em"
              :item="item"
              :platform="item.platform"
              isLonely
            />
          </div>
          <el-input-number v-model.number="item.quantity"></el-input-number>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="tsx">
import { Component, Emit, Vue, Watch } from "vue-property-decorator";
import DatePicker from "./DatePicker.vue";
import TextRecorder from "./TextRecorder.vue";
import SkuPicker from "./SkuPicker.vue";
import AddressPicker from "./AddressPicker.vue";
import GoodsItemCoudan from "./GoodsItemCoudan.vue";
import { Platform } from "../handlers";
import {
  buyDirect,
  coudan,
  cartAdd,
  getQrcode,
  goodsList,
  resolveUrl,
} from "../api";
import { qiangquan } from "../msg/order";
import bus from "../bus";
import { sendMsg } from "../msg";
import { getFinalDatasFromText } from "../msg/tools";
import storageMixin from "@/mixins/storage";

const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let t: any = 0;
  return function (...args: Parameters<T>) {
    clearTimeout(t);
    t = setTimeout(() => {
      // @ts-ignore
      fn.apply(this, args);
    }, delay);
  };
};

@Component({
  components: {
    TextRecorder,
    SkuPicker,
    GoodsItemCoudan,
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

  created() {
    // @ts-ignore
    // this.onTextChange = debounce(this.onTextChange, 500);
  }

  datas: {
    url: string;
    quantity: number;
    skuId?: string;
    show_sku_picker?: boolean;
  }[] = [];

  loading = false;

  onTextChange(text: string) {
    this.$emit("text-change", text);
    if (!text) {
      this.datas = [];
      this.$emit("metadata", {});
      return;
    }
    this.resolve(text);
  }

  async resolve(text: string) {
    this.loading = true;
    try {
      var { metadata, datas } = await getFinalDatasFromText(text);
      if (datas) {
        this.datas = datas;
      }
      this.$emit("metadata", metadata);
    } catch (e) {}
    this.loading = false;
  }

  @Watch("datas", {
    deep: true,
  })
  onDatasChange(datas) {
    this.$emit(
      "datas",
      datas.map(({ url, quantity, skuId, platform }) => ({ url, quantity, skuId, platform }))
    );
  }

  onSkuChange(item, { label, value }: { label: string; value: string }) {
    item.skuId = value;
    item.show_sku_picker = false;
    this.onDatasChange(this.datas);
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
<style lang="scss" scoped>
.df {
  display: flex;
  justify-content: space-between;
}
.flex-1 {
  flex: 1;
}
.text-ellipse {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
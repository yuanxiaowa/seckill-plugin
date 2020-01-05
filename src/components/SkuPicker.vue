<template>
  <el-dialog :visible="value" @update:visible="$emit('input',$event)">
    <div>
      {{title}}
      <el-tag type="danger">￥{{price}}</el-tag>
      <span>{{quantity}}</span>
    </div>
    <el-cascader
      v-model="data"
      :options="options"
      filterable
      :props="{ expandTrigger: 'hover' }"
      @change="onChange"
    ></el-cascader>
    <el-button v-if="data.length>0" @click="onChange(data)">确定</el-button>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
import { goodsDetail } from "../api";

@Component({
  components: {}
})
export default class SkuPicker extends Vue {
  @Prop() url!: string;
  @Prop(Boolean) value!: boolean;

  title = "";
  data = [];
  quantity = 0;
  price = 0;

  options = [];

  @Watch("url")
  onUrlChange(url: string) {
    this.title = "";
    this.data = [];
    if (url) {
      this.fetchData();
    }
  }

  onChange(arr: string[]) {
    this.$emit("change", arr[arr.length - 1]);
  }

  async fetchData() {
    var { skus, title, quantity, price } = await goodsDetail(
      {
        url: this.url
      },
      "taobao"
    );
    this.title = title;
    this.quantity = quantity;
    this.price = price;
    this.options = (skus && skus.children) || [];
  }
}
</script>

<style lang="scss">
</style>
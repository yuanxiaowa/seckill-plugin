<template>
  <el-dialog :visible="value" @update:visible="setVisible">
    <div v-loading="loading">
      <div>
        {{title}}
        <el-tag type="danger">￥{{price}}</el-tag>
        <span style="margin:0 1em">库存: {{quantity}}</span>
        <el-button @click="fetchData" icon="el-icon-refresh" circle></el-button>
        <el-button v-if="options.length===0" @click="setVisible(false)" type="primary">确定</el-button>
      </div>
      <el-cascader
        v-if="options.length>0"
        v-model="data"
        :options="options"
        filterable
        :props="{ expandTrigger: 'hover' }"
        @change="onChange"
      ></el-cascader>
      <el-button v-if="data.length>0" @click="onChange(data)" type="primary">确定</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
import { getGoodsSkus } from "../api";

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

  loading = false;

  @Emit("input")
  setVisible(b: boolean) {}

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
    this.loading = true;
    var { skus, title, quantity, price } = await getGoodsSkus(
      {
        url: this.url
      },
      "taobao"
    );
    this.title = title;
    this.quantity = quantity;
    this.price = price;
    this.options = (skus && skus.children) || [];
    this.loading = false;
  }
}
</script>

<style lang="scss">
</style>
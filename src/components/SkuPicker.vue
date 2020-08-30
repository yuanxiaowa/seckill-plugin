<template>
  <span>
    <span @click="setVisible(true)">
      <slot />
    </span>
    <el-dialog :visible="visible" @update:visible="setVisible">
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
          ref="cas"
        ></el-cascader>
        <el-button v-if="data.length>0" @click="onChange(data)" type="primary">确定</el-button>
      </div>
    </el-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
import { getGoodsSkus } from "../api";

@Component({
  components: {},
})
export default class SkuPicker extends Vue {
  @Prop() url!: string;
  @Prop() value!: boolean;

  visible = false;

  title = "";
  data = [];
  quantity = 0;
  price = 0;

  options: any = [];

  loading = false;

  mounted() {
    if (typeof this.value === "boolean") {
      this.$watch("value", (b: boolean) => {
        this.visible = b;
      });
    }
  }

  setVisible(b: boolean) {
    if (typeof this.value === "boolean") {
      this.$emit("input", b);
    } else {
      this.visible = b;
    }
  }

  @Watch("url")
  onUrlChange(url: string) {
    this.title = "";
    this.data = [];
    if (url) {
      this.fetchData();
    }
  }

  @Watch("visible")
  onVisibleChange(b: boolean) {
    if (b && !this.data.length) {
      this.fetchData();
    }
  }

  onChange(arr: string[]) {
    const skuId = arr[arr.length - 1];
    const items = (this.$refs.cas as any).getCheckedNodes();
    this.$emit("change", {
      value: skuId,
      label: items[0].pathNodes.map((item) => item.label).join("-"),
    });
  }

  async fetchData() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    var { skus, title, quantity, price } = await getGoodsSkus(
      {
        url: this.url,
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
<template>
  <div>
    <el-table :data="value" style="width: 100%" max-height="400" default-expand-all row-key="id">
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-table :data="props.row.items" row-key="id">
            <el-table-column width="55">
              <template slot="header">
                <el-checkbox @change="$emit('select-vendor',props.row)" v-model="props.row.checked"></el-checkbox>
              </template>
              <template slot-scope="{row}">
                <el-checkbox @change="$emit('select-item',row)" v-model="row.checked"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="商品图片" width="100">
              <template slot-scope="{row}">
                <img :src="row.img" width="38" />
              </template>
            </el-table-column>
            <el-table-column label="商品名称" width="300">
              <template slot-scope="{row}">
                <a :href="row.url" target="_blank">{{row.title}}</a>
                <template v-if="row.skuName">
                  <sku-picker :url="row.url" @change="updateSku(row, $event)">
                    <span title="修改规格" style="margin:0 1em;cursor:pointer;">
                      <el-icon class="el-icon-edit"></el-icon>
                      [{{row.skuName}}]
                    </span>
                  </sku-picker>
                </template>
                <goods-item-coudan
                  style="margin:0 1em"
                  :item="row"
                  :platform="platform"
                  @refresh="$emit('refresh')"
                />
              </template>
            </el-table-column>
            <el-table-column label="单价" prop="price"></el-table-column>
            <el-table-column label="数量">
              <template slot-scope="{row}">
                <el-input-number
                  v-model="row.quantity"
                  @change="$emit('update-quantity',row)"
                  :min="1"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="{row}">
                <el-button
                  type="danger"
                  plain
                  @click="$emit('del-item',row,props.row)"
                  icon="el-icon-delete"
                  title="删除"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <!-- <el-table-column
        type="selection"
        width="55"
      >
      </el-table-column>-->
      <el-table-column prop="title">
        <template slot="header">
          <el-checkbox label="全选" v-model="checked" @change="$emit('select-all',checked)"></el-checkbox>
          <span style="margin-left:2em">店铺名称</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import GoodsItemCoudan from "./GoodsItemCoudan.vue";
import SkuPicker from "./SkuPicker.vue";

@Component({
  components: {
    GoodsItemCoudan,
    SkuPicker,
  },
})
export default class CartTable extends Vue {
  @Prop({
    default() {
      return [];
    },
  })
  value!: any[];
  @Prop() platform!: string;

  checked = false;
  @Watch("value")
  onValueChange(new_val, old_val) {
    this.checked = false;
  }

  updateSku(item, { label, value }: { label: string; value: string }) {
    item.skuId = value;
    item.skuName = label;
    this.$emit("update-sku", item);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

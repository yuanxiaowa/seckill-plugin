<template>
  <div>
    <el-button
      @click="pullData"
      size="small"
    >拉取</el-button>
    <el-button
      @click="qiangquan(multipleSelection)"
      :disabled="multipleSelection.length===0"
      size="small"
    >抢券</el-button>
    <el-checkbox v-model="is_new">即将开始的</el-checkbox>
    <el-table
      :data="filter_datas"
      style="width: 100%"
      max-height="500"
      @selection-change="multipleSelection=$event"
    >
      <el-table-column
        type="selection"
        width="55"
      ></el-table-column>
      <el-table-column
        prop="title"
        label="名称"
      ></el-table-column>
      <el-table-column
        label="抵扣"
        width="200"
      >
        <template slot-scope="{row}">
          {{row.quota}}-{{row.discount}}
        </template>
      </el-table-column>
      <el-table-column
        label="时间"
        width="180"
        prop="tStr"
      >

      </el-table-column>
      <el-table-column width="180">
        <template slot-scope="{row}">
          <el-button
            size="small"
            @click="qiangquan([row])"
          >抢券</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { invoke } from "@/api";

@Component({
  components: {}
})
export default class CouponCenter extends Vue {
  datas: any[] = [];
  is_new = true;
  multipleSelection = [];
  async pullData() {
    this.datas = await invoke("getCouponCenterItems");
  }
  qiangquan(items: any[]) {
    items.forEach(item => invoke("getCouponCenterCoupon", item));
  }
  filter_datas() {
    var now = Date.now();
    return this.datas.filter(item => item.t > now);
  }
}
</script>

<style lang="scss">
</style>
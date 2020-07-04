<template>
  <div>
    <el-button @click="pullData" size="small">拉取</el-button>
    <el-checkbox v-model="is_new">即将开始的</el-checkbox>
    <data-list-wrapper
      ref="tb"
      :fetcher="fetcher"
      :extraFilter="extraFilter"
      :filters="{keys:['title','discount']}"
      :columns="columns"
    >
      <template slot-scope="{row}" slot="actions">
        <el-button size="small" @click="qiangquan([row])">抢券</el-button>
      </template>
      <template slot-scope="{selections}" slot="selection">
        <el-button @click="qiangquan(selections)" :disabled="selections.length===0" size="small">抢券</el-button>
      </template>
    </data-list-wrapper>
  </div>
</template>

<script lang="tsx">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { invoke } from "@/api";
import DataListWrapper from "./DataListWrapper.vue";

@Component({
  components: { DataListWrapper }
})
export default class CouponCenter extends Vue {
  is_new = true;

  columns = [
    {
      prop: "title",
      label: "名称"
    },
    {
      prop: "discount",
      label: "折扣",
      render({ row }) {
        return `${row.quota}-${row.discount}`;
      }
    },
    {
      prop: "tStr",
      label: "时间"
    }
  ];

  async fetcher({ page }) {
    var items = await invoke("getCouponCenterItems");
    return {
      items,
      page,
      more: false
    };
  }

  pullData() {
    (this.$refs.tb as DataListWrapper).reload();
  }

  qiangquan(items: any[]) {
    items.forEach(item => invoke("getCouponCenterCoupon", item));
  }
  extraFilter(items) {
    if (!this.is_new) {
      return items;
    }
    var now = Date.now();
    return items.filter(item => item.t > now);
  }
}
</script>

<style lang="scss">
</style>
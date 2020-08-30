<!--
 * @Author: oudingyin
 * @Date: 2019-08-09 14:04:57
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-31 17:15:38
 -->
<template>
  <span>
    <el-dialog :visible.sync="visible">
      <el-select v-model="type" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button @click="search">搜索</el-button>
      <data-list-wrapper
        ref="dataList"
        :fetcher="getCoupons"
        :columns="columns"
        :filters="{keys:['title']}"
      >
        <template slot-scope="{row}" slot="actions">
          <el-button @click="chooseCoupon(row)">选择</el-button>
          <el-button
            v-if="row.canDelete"
            @click="deleteCoupon([row])"
            icon="el-icon-delete"
            title="删除"
            circle
          ></el-button>
        </template>
        <template slot-scope="{selections}" slot="selection">
          <el-button
            @click="deleteCoupon(selections)"
            icon="el-icon-delete"
            title="删除"
            circle
            :disabled="selections.length===0"
          ></el-button>
        </template>
      </data-list-wrapper>
    </el-dialog>
    <span @click="visible=true">
      <slot />
    </span>
  </span>
</template>

<script lang="tsx">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { getMyCoupons, deleteCoupon } from "../api";
import DataListWrapper from "./DataListWrapper.vue";

@Component({
  components: {
    DataListWrapper,
  },
})
export default class Coupons extends Vue {
  @Prop() platform!: string;
  coupons = [];

  visible = false;
  options = [
    {
      label: "店铺券",
      value: "0",
    },
    {
      label: "商品券",
      value: "1",
    },
    {
      label: "平台券",
      value: "2",
    },
  ];
  type = "0";

  columns = [
    {
      prop: "title",
      label: "标题",
      render: this.renderTitle,
    },
    {
      label: "折扣",
      prop: "discount",
      render: this.renderDisount,
      width: 100,
    },
    {
      label: "有效时间",
      prop: "startTime",
      width: 170,
      formatter(row) {
        return `${row.startTime}——${row.endTime}`;
      },
    },
  ];

  renderTitle({ row }) {
    return (
      <a href={row.url} target="_blank">
        {row.title}
      </a>
    );
  }

  renderDisount({ row }) {
    return (
      <span style="color:red;margin:1em">
        {row.quota}-{row.discount}
      </span>
    );
  }

  search() {
    (this.$refs.dataList as DataListWrapper).reload();
  }

  async getCoupons(params) {
    return getMyCoupons({
      ...params,
      platform: this.platform,
      type: this.type,
    });
  }

  chooseCoupon(item) {
    // this.form_data.coupon_shopid = item.shopId;
    // this.form_data.coupon_id = item.couponid;
    // this.form_data.couponbatch = item.batchid;
    var params = Object.assign({}, item.params);
    this.$emit("select", item);
    this.visible = false;
  }

  async deleteCoupon(items) {
    items.forEach(async (item) => {
      await deleteCoupon({
        platform: this.platform,
        ...item.params,
      });
      (this.$refs.dataList as DataListWrapper).remove(item);
    });
  }
}
</script>

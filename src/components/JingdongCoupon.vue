<template>
  <div>
    <el-button @click="getCouponList">优惠券列表</el-button>
    <el-button>领取京豆兑换优惠券</el-button>
    <ul>
      <li v-for="item of items" :key="item.batchId">
        满{{item.quota}}减{{item.discount}}
        <date-picker v-model="item.datetime"></date-picker>
        <el-button @click="getCoupon(item)">领取</el-button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { getPlusQuanpinList, getPlusQuanpin } from "../api";
import DatePicker from "./DatePicker.vue";
@Component({
  components: {
    DatePicker,
  },
})
export default class JingdongCoupon extends Vue {
  items = [];
  getCouponList() {
    getPlusQuanpinList().then((items) => {
      this.items = items.map((item) => {
        item.datetime = "";
        return item;
      });
      this.$notify.success("列表获取成功");
    });
  }

  async getCoupon(data) {
    getPlusQuanpin(data).then(({ resultCode }) => {
      if (resultCode === "1000") {
        this.$notify.success("领取成功");
      } else {
        this.$notify.error("领取失败");
      }
    });
  }
}
</script>

<style>
</style>

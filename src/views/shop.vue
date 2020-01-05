<!--
 * @Author: oudingyin
 * @Date: 2019-07-01 09:12:05
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 14:45:34
 -->
<template>
  <div>
    <el-collapse v-model="activeNames">
      <!-- <el-collapse-item title="状态" name="0">
        <status-comp />
      </el-collapse-item>-->
      <el-collapse-item title="领券下单" name="1">
        <buy></buy>
      </el-collapse-item>
      <el-collapse-item title="购物车" name="2">
        <cart></cart>
      </el-collapse-item>
      <el-collapse-item title="搜索" name="3">
        <search></search>
      </el-collapse-item>
      <el-collapse-item title="秒杀列表" name="4">
        <seckill-list></seckill-list>
      </el-collapse-item>
      <el-collapse-item title="京东优惠券" name="6">
        <jingdong-coupon></jingdong-coupon>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<route-meta>
{
  "title": "购物"
}
</route-meta>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CartTable from "../components/CartTable.vue";
import Buy from "../components/Buy.vue";
import Cart from "../components/Cart.vue";
import JingdongCoupon from "../components/JingdongCoupon.vue";
import StatusComp from "../components/StatusComp.vue";
import Search from "../components/Search.vue";
import SeckillList from "../components/SeckillList.vue";

@Component({
  components: {
    CartTable,
    Buy,
    Cart,
    StatusComp,
    JingdongCoupon,
    Search,
    SeckillList
  }
})
export default class HomePage extends Vue {
  activeNames = ["2"];
}
</script>

<style>
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>

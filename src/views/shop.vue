<!--
 * @Author: oudingyin
 * @Date: 2019-07-01 09:12:05
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 14:45:34
 -->
<template>
  <el-tabs type="border-card">
    <el-tab-pane label="领券下单">
      <buy></buy>
    </el-tab-pane>
    <el-tab-pane label="购物车">
      <cart></cart>
    </el-tab-pane>
    <el-tab-pane label="搜索">
      <search></search>
    </el-tab-pane>
    <el-tab-pane label="秒杀">
      <seckill-list></seckill-list>
    </el-tab-pane>
    <el-tab-pane label="京东">
      <el-tabs>
        <el-tab-pane label="领券中心">
          <coupon-center></coupon-center>
        </el-tab-pane>
        <el-tab-pane label="plus优惠券">
          <jingdong-coupon></jingdong-coupon>
        </el-tab-pane>
        <el-tab-pane label="京东百亿补贴">
          <jd-billion></jd-billion>
        </el-tab-pane>
      </el-tabs>
    </el-tab-pane>
    <el-tab-pane label="解析">
      <code-resolver></code-resolver>
    </el-tab-pane>
    <el-tab-pane label="凑单计算">
      <coudan-resolver></coudan-resolver>
    </el-tab-pane>
  </el-tabs>
</template>
<route-meta>
{
  "title": "购物"
}
</route-meta>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import bus from "../bus";
import Buy from "../components/Buy.vue";
import Cart from "../components/Cart.vue";
import Search from "../components/Search.vue";
import SeckillList from "../components/SeckillList.vue";
import JdBillion from "../components/JdBillion.vue";
import JingdongCoupon from "../components/JingdongCoupon.vue";
import CouponCenter from "../components/CouponCenter.vue";
import CodeResolver from "../components/CodeResolver.vue";
import CoudanResolver from "../components/CoudanResolver.vue";

@Component({
  components: {
    Buy,
    Cart,
    Search,
    SeckillList,
    JdBillion,
    JingdongCoupon,
    CouponCenter,
    CodeResolver,
    CoudanResolver
  }
})
export default class ShopView extends Vue {}
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

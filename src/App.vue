<!--
 * @Author: oudingyin
 * @Date: 2019-07-01 09:12:05
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-21 17:53:09
 -->
<template>
  <div class="page-component__scroll">
    <config />
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
    </el-tabs>
    <iframe ref="ifr" :key="id" :src="status_url" frameborder="0" style="opacity:0"></iframe>
    <el-backtop target=".page-component__scroll"></el-backtop>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import bus from "./bus";
import Config from "./components/Config.vue";
import Buy from "./components/Buy.vue";
import Cart from "./components/Cart.vue";
import Search from "./components/Search.vue";
import SeckillList from "./components/SeckillList.vue";
import JdBillion from "./components/JdBillion.vue";
import JingdongCoupon from "./components/JingdongCoupon.vue";
import CouponCenter from "./components/CouponCenter.vue";

const urls = [
  "https://home.jd.com/",
  "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
  "https://cart.taobao.com/cart.htm?spm=0.0.0.0.TUmZxr&from=mini&ad_id=&am_id=&cm_id=&pm_id=1501036000a02c5c3739"
];

@Component({
  components: {
    Config,
    Buy,
    Cart,
    Search,
    SeckillList,
    JdBillion,
    JingdongCoupon,
    CouponCenter
  }
})
export default class App extends Vue {
  status_url = "";
  id = 1;
  mounted() {
    this.jump();
    setInterval(this.jump, 1000 * 60 * 5);
  }

  async jump() {
    for (let i = 0; i < urls.length; i++) {
      this.id = Math.random();
      this.status_url = urls[i];
      await new Promise((resolve, reject) => setTimeout(resolve, 5000));
    }
    // this.status_url = `https://main.m.taobao.com/mytaobao/index.html?spm=a215s.${(7406091 *
    //   Math.random()) >>>
    //   0}.toolbar.i2`;
  }
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

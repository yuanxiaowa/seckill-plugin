<!--
 * @Author: oudingyin
 * @Date: 2019-07-01 09:12:05
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 16:58:22
 -->
<template>
  <div>
    <el-button
      v-for="item of items"
      :key="item.to"
      type="primary"
      @click="$router.push(item.to)"
    >{{item.title}}</el-button>
  </div>
</template>
<route-meta>
{
  "title": "首页"
}
</route-meta>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {}
})
export default class HomePage extends Vue {
  items = [
    {
      to: "/shop",
      title: "下单"
    },
    {
      to: "/tools",
      title: "工具"
    },
    {
      to: "/test-order",
      title: "订单测试"
    },
    {
      to: "/comment",
      title: "评论"
    },
    {
      to: "/calc-price",
      title: "价格计算"
    },
    {
      to: "/sixty-course",
      title: "天猫60s"
    },
    {
      to: "/eval",
      title: "代码执行"
    },
    {
      to: "/collection",
      title: "收藏"
    }
  ];
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

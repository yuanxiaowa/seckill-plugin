<!--
 * @Author: oudingyin
 * @Date: 2019-08-23 14:29:25
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-26 20:33:58
 -->
<template>
  <div>
    <el-radio-group v-model="platform">
      <el-radio label="taobao">淘宝</el-radio>
      <el-radio label="jingdong">京东</el-radio>
    </el-radio-group>
    <el-input v-model="path" />
    <el-button @click="testOrder">测试</el-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { testOrder } from "../api";

@Component({
  components: {}
})
export default class TestOrder extends Vue {
  path = "";
  platform = "taobao";
  testOrder() {
    testOrder({ file: this.path, platform: this.platform });
  }
}
</script>

<style lang="scss">
</style>
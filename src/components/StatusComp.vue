<!--
 * @Author: oudingyin
 * @Date: 2019-07-17 14:14:39
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-07-17 14:14:39
 -->
<template>
  <div>
    <el-radio-group v-model="platform">
      <el-radio label="taobao">淘宝</el-radio>
      <el-radio label="jingdong">京东</el-radio>
    </el-radio-group>
    <el-button @click="checkStatus" size="small">获取状态</el-button>
    <el-button @click="sysTime" size="small">同步时间</el-button>
  </div>
</template>

<script lang="tsx">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { sysTime } from "../api";
import { sendMsg } from "../msg";
import bus from "../bus";

@Component
export default class Status extends Vue {
  platform = "taobao";
  status_text = "";
  checkStatus() {
    bus.$emit("check-status");
  }
  sysTime() {
    sysTime(this.platform);
  }
}
</script>

<style>
</style>

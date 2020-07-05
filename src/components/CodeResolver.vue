<template>
  <el-form v-loading="loading">
    <el-form-item label="文本">
      <el-input type="textarea" v-model="text" autosize></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="resolve">解析</el-button>
    </el-form-item>
    <el-form-item label="结果">
      <el-input type="textarea" v-model="result" autosize></el-input>
    </el-form-item>
    <el-form-item label="二维码" v-if="result">
      <img width="250" :src="qrcode" alt />
      <a :href="result" target="_blank">打开</a>
    </el-form-item>
  </el-form>
</template>

<script>
import { Component, Prop, Vue } from "vue-property-decorator";
import { getDealedDataFromText } from "../msg/tools";

@Component
export default class CodeResolver extends Vue {
  text = "";
  result = "";
  loading = false;
  async resolve() {
    this.loading = true;
    let { urls } = await getDealedDataFromText(this.text);
    if (urls[0]) {
      this.result = urls[0];
      this.qrcode = await this.$getQrcodeUrl(urls[0]);
    }
    this.loading = false;
  }
}
</script>

<style>
</style>
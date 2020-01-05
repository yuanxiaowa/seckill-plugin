<!--
 * @Author: oudingyin
 * @Date: 2019-09-06 14:37:48
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 14:38:48
 -->
<template>
  <div>
    <div>
      <el-input v-model="filename"></el-input>
      <el-button @click="evalFile">执行文件</el-button>
    </div>
    <div>
      <el-input v-model="code" type="textarea"></el-input>
      <el-button @click="evalCode">运行代码</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component({
  components: {}
})
export default class EvalPage extends Vue {
  filename = "../taobao/index.js";
  code = "";
  evalFile() {
    // @ts-ignore
    evalFile(this.filename, true);
  }

  evalCode() {
    // @ts-ignore
    evalFunction(this.code);
  }
}
</script>

<style lang="scss">
</style>
<!--
 * @Author: oudingyin
 * @Date: 2019-08-23 14:33:11
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-23 16:27:20
 -->
<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="url解析" name="1">
        <el-form>
          <el-form-item label="链接">
            <el-input v-model="url_obj.text" type="textarea" :rows="5" />
          </el-form-item>
        </el-form>
        <div>{{url_obj.url}}</div>
        <!-- <el-input label="参数" v-model="url_obj.result" type="textarea" /> -->
        <clipboard :data="url_obj.result"></clipboard>
        <!-- <el-radio-group v-model="url_obj.type">
    <el-radio :label="1">备选项</el-radio>
    <el-radio :label="2">备选项</el-radio>
        </el-radio-group>-->
        <!-- <el-row>
        <el-col :span="12">
        </el-col>
        </el-row>-->
      </el-tab-pane>
      <!-- <el-tab-pane label="配置管理" name="2">配置管理</el-tab-pane>
      <el-tab-pane label="角色管理" name="3">角色管理</el-tab-pane>
      <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>-->
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";

@Component({
  components: {}
})
export default class Tools extends Vue {
  activeName = "1";
  url_obj = {
    text: "",
    url: "",
    result: {}
  };

  @Watch("url_obj.text")
  onUrlTextChange(text: string) {
    var url = new URL(text);
    this.url_obj.url = url.origin + url.pathname;
    var result = {};
    url.searchParams.forEach((item, key) => {
      result[key] = item;
    });
    this.url_obj.result = result;
  }
}
</script>

<style lang="scss">
</style>
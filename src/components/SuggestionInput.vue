<!--
 * @Author: oudingyin
 * @Date: 2019-09-02 10:54:19
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-02 11:26:39
 -->
<template>
  <el-autocomplete
    :value="value"
    @input="$emit('input',$event)"
    :fetch-suggestions="querySearch"
    placeholder="请输入内容"
    style="width: 100%"
  ></el-autocomplete>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";

@Component({
  components: {}
})
export default class ComponentName extends Vue {
  @Prop(String) value!: string;
  @Prop(String) id!: string;

  list: string[] = [];
  mounted() {
    var str = localStorage.getItem(this.id);
    if (str) {
      this.list = JSON.parse(str);
      this.$emit("input", this.list[this.list.length - 1]);
    }
  }

  querySearch(queryString: string, cb: Function) {
    cb(this.list);
  }

  @Watch("value")
  onChange(v: string) {
    if (this.list.includes(v)) {
      return;
    }
    this.list.push(v);
    localStorage.setItem(this.id, JSON.stringify(this.list));
  }
}
</script>

<style lang="scss">
</style>
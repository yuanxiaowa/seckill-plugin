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
import storageMixin from "@/mixins/storage";

@Component({
  components: {},
  mixins: [
    storageMixin({
      key: "list",
      skey() {
        // @ts-ignore
        return this.id;
      },
      defaultValue: "g_couponGroupId=12786776025",
      onInit() {
        // @ts-ignore
        this.$emit("input", this.list[this.list.length - 1]);
      }
    })
  ]
})
export default class ComponentName extends Vue {
  @Prop(String) value!: string;
  @Prop(String) id!: string;

  list: string[] = [];

  querySearch(queryString: string, cb: Function) {
    cb(this.list);
  }

  @Watch("value")
  onChange(v: string) {
    if (v || this.list.includes(v)) {
      return;
    }
    this.list.push(v);
  }
}
</script>

<style lang="scss">
</style>
<!--
 * @Author: oudingyin
 * @Date: 2019-08-23 15:06:37
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-23 15:24:42
 -->
<template>
  <div style="position:relative">
    <el-button class="__clip-btn" style="position:absolute;right:0">复制</el-button>
    <div v-html="html"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import Clipborad from "clipboard";

new Clipborad(".__clip-btn", {
  text(trigger) {
    console.log(trigger.nextElementSibling.innerText);
    return trigger.nextElementSibling.innerText;
  },
});

@Component({
  components: {},
})
export default class ComponentName extends Vue {
  @Prop() data!: any;

  get html() {
    return JSON.stringify(this.data, null, 2)
      .replace(/\n/g, "<br>")
      .replace(/\s/g, "&nbsp;");
  }
}
</script>

<style lang="scss">
</style>
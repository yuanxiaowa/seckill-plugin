<template>
  <el-dialog title="记录" :visible="value" @update:visible="cancel" width="30%">
    <ul>
      <li v-for="item of list" :key="item" @click="$emit('data', item)">{{item}}</li>
    </ul>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component({
  components: {}
})
export default class TextRecorder extends Vue {
  @Prop(Boolean) value!: boolean;
  list: string[] = [];
  mounted() {
    var text = localStorage.getItem("text-list");
    if (text) {
      this.list = JSON.parse(text);
    }
  }
  cancel() {
    this.$emit("input", false);
  }
  addText(text) {
    this.list.push(text);
    localStorage.setItem("text-list", JSON.stringify(this.list));
    this.cancel();
  }
}
</script>

<style lang="scss">
</style>
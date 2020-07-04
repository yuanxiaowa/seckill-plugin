<template>
  <el-dialog title="记录" :visible="value" @update:visible="cancel" width="30%">
    <ul>
      <li v-for="item of list" :key="item" @click="$emit('data', item);cancel();">{{item}}</li>
    </ul>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import storageMixin from "@/mixins/storage";

@Component({
  components: {},
  mixins: [
    storageMixin({
      key: "list",
      skey: "text-list",
      defaultValue: []
    })
  ]
})
export default class TextRecorder extends Vue {
  @Prop(Boolean) value!: boolean;
  list: string[] = [];
  cancel() {
    this.$emit("input", false);
  }
  addText(text) {
    if (!this.list.includes(text)) {
      this.list.push(text);
    }
    this.cancel();
  }
}
</script>

<style lang="scss">
</style>
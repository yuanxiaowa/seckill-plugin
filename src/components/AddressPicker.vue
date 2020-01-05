<template>
  <span>
    <el-dialog :visible.sync="visible">
      <el-select :value="value" @input="setValue($event)" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button v-if="options.length>0" @click="setValue(value)">确定</el-button>
    </el-dialog>
    <el-button type="primary" @click="visible=true">
      <slot>选择</slot>
    </el-button>
    {{selected_text}}
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
import { getAddresses } from "@/api";

@Component({
  components: {}
})
export default class AddressPicker extends Vue {
  @Prop() value!: string;
  visible = false;

  options: { label: string; value: string }[] = [];

  @Watch("visible")
  onVisibilityChange(b: boolean) {
    if (b) {
      getAddresses("taobao").then(addresses => {
        this.options = addresses.map(item => ({
          value: item.deliverId,
          label: item.fullAddress + item.addressDetail + item.fullName
        }));
      });
    }
  }

  @Emit("input")
  setValue(v: string) {
    this.visible = false;
  }

  get selected_text() {
    let item = this.options.find(item => item.value === this.value);
    if (item) {
      return item.label;
    }
  }
}
</script>

<style lang="scss">
</style>
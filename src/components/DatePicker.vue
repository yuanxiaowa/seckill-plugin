<template>
  <el-date-picker
    type="datetime"
    :value="value"
    @input="$emit('input',$event)"
    :picker-options="pickerOptions"
    format="yyyy-MM-dd HH:mm:ss"
  ></el-date-picker>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class DatePicker extends Vue {
  @Prop() value!: string;
  pickerOptions = {
    shortcuts: [
      {
        text: "下一个整点",
        onClick(picker) {
          var now = new Date();
          picker.$emit(
            "pick",
            new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              now.getHours() + 1
            )
          );
        }
      },
      {
        text: "现在",
        onClick(picker) {
          picker.$emit("pick", new Date());
        }
      },
      {
        text: "5秒后",
        onClick(picker) {
          picker.$emit("pick", new Date(Date.now() + 1000 * 5));
        }
      },
      {
        text: "15秒后",
        onClick(picker) {
          picker.$emit("pick", new Date(Date.now() + 1000 * 15));
        }
      },
      {
        text: "30秒后",
        onClick(picker) {
          picker.$emit("pick", new Date(Date.now() + 1000 * 30));
        }
      },
      {
        text: "1分后",
        onClick(picker) {
          picker.$emit("pick", new Date(Date.now() + 1000 * 60));
        }
      },
      {
        text: "明天0点",
        onClick(picker) {
          var now = new Date();
          picker.$emit(
            "pick",
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          );
        }
      }
    ]
  };
}
</script>

<style>
</style>

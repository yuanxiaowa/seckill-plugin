<template>
  <div>
    <el-button icon="el-icon-minus" type="text" @click="add(-5)"></el-button>
    <el-date-picker
      type="datetime"
      :value="value"
      @input="$emit('input',$event)"
      :picker-options="pickerOptions"
      format="yyyy-MM-dd HH:mm:ss"
    ></el-date-picker>
    <el-button icon="el-icon-plus" type="text" @click="add(5)"></el-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import moment from "moment";

@Component
export default class DatePicker extends Vue {
  @Prop() value!: string;
  pickerOptions = {
    shortcuts: [
      {
        text: "下一个整点",
        onClick(picker) {
          picker.$emit("pick", moment().startOf("hour").add("hour", 1));
        },
      },
      ...[0, 10, 20, 22].map((hour) => {
        return {
          text: `${hour}点`,
          onClick(picker) {
            const now = moment();
            const nowHour = now.get("hour");
            let m = now.startOf("date").add("hour", hour);
            if (nowHour > hour) {
              m.add("day", 1);
            }
            picker.$emit("pick", m);
          },
        };
      }),
      {
        text: "现在",
        onClick(picker) {
          picker.$emit("pick", moment());
        },
      },
      {
        text: "5秒后",
        onClick(picker) {
          picker.$emit("pick", moment().add("second", 5));
        },
      },
      {
        text: "15秒后",
        onClick(picker) {
          picker.$emit("pick", moment().add("second", 15));
        },
      },
      {
        text: "30秒后",
        onClick(picker) {
          picker.$emit("pick", moment().add("second", 30));
        },
      },
      {
        text: "1分后",
        onClick(picker) {
          picker.$emit("pick", moment().add("second", 60));
        },
      },
    ],
  };

  add(diff: number) {
    this.$emit(
      "input",
      moment(this.value || new Date())
        .add("second", diff)
        .format()
    );
  }
}
</script>

<style>
</style>

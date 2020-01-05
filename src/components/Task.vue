<template>
  <el-drawer :visible.sync="vv" size="50%" title="任务列表" v-loading="loading" direction="ltr">
    <el-card>
      <el-button style="padding: 3px 0" type="text" @click="getData">拉取</el-button>
      <el-row v-for="item in items" :key="item.id" style="margin-bottom:.5em">
        <el-col>
          {{item.time}}: {{item.text}}-{{item.platform}}{{item.name}}
          <el-button size="small" type="danger" @click="cancel(item.id)">取消</el-button>
        </el-col>
      </el-row>
    </el-card>
  </el-drawer>
</template>


<script lang="tsx">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { getTasks, cancelTask } from "../api";

@Component
export default class Task extends Vue {
  @Prop(Boolean) value!: boolean;

  items: any[] = [];
  loading = false;

  async getData() {
    this.loading = true;
    getTasks().then(data => {
      this.items = data;
      this.loading = false;
    });
  }

  cancel(id: string) {
    cancelTask(id).then(() => {
      var i = this.items.findIndex(item => item.id === id);
      this.items.splice(i, 1);
    });
  }

  set vv(v: boolean) {
    this.$emit("input", v);
  }

  get vv() {
    return this.value;
  }
}
</script>

<style>
</style>
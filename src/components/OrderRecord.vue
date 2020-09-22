<template>
  <el-drawer :visible.sync="vv" size="50%" title="下单记录" v-loading="loading" direction="ltr">
    <el-card>
      <el-button style="padding: 3px 0" type="text" @click="getData">拉取</el-button>
      <el-row v-for="item in items" :key="item.id" style="margin-bottom:.5em">
        <el-col>
          {{item.expectedPrice}}: {{item.title}}
          <el-button type="danger" @click="cancel(item.id)">取消</el-button>
          <el-button type="danger" @click="relay(item)">重下单</el-button>
        </el-col>
      </el-row>
    </el-card>
  </el-drawer>
</template>


<script lang="tsx">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { getOrderRecords, deleteOrderRecords, relayOrderRecords } from "../api";

@Component
export default class Task extends Vue {
  @Prop(Boolean) value!: boolean;

  items: any[] = [];
  loading = false;

  async getData() {
    this.loading = true;
    getOrderRecords().then((data) => {
      this.items = data;
      this.loading = false;
    });
  }

  cancel(id: number) {
    deleteOrderRecords({ ids: [id] }).then(() => {
      var i = this.items.findIndex((item) => item.id === id);
      this.items.splice(i, 1);
    });
  }

  relay(item: any) {
    relayOrderRecords({
      items: [item],
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
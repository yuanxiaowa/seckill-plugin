<template>
  <el-form @submit.native.prevent="pullData">
    <el-form-item>
      <el-col :span="12">
        <el-input v-model="url" placeholder="url">
          <el-button slot="append" native-type="submit">拉取</el-button>
        </el-input>
      </el-col>
      <el-col :span="8" :offset="4">
        <el-input placeholder="过滤" v-model="filter_text"></el-input>
      </el-col>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :disabled="multipleSelection.length===0"
        @click="qiangquan(multipleSelection)"
      >抢券</el-button>
    </el-form-item>
    <el-table
      :data="filtered_datas"
      style="width: 100%"
      max-height="500"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column width="180">
        <template slot-scope="{row}">
          <el-image :src="row.skuImage" style="width:50px;height:50px"></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="skuName" label="商品名">
        <template slot-scope="{row}">
          <a :href="row.url" target="_blank">{{row.skuName}}</a>
        </template>
      </el-table-column>
      <el-table-column prop="pDisCount" sortable label="价格" width="180">
        <template slot-scope="{row}">
          <span style="text-decoration:line-through">￥{{row.p}}</span>
          <b style="color:red;margin-left:.5em">￥{{row.pDisCount}}</b>
        </template>
      </el-table-column>
      <el-table-column prop="disCount" label="券" width="180" sortable></el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template slot-scope="{row}">
          <el-button type="text" @click="qiangquan([row])">抢券</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import { invoke } from "../api";

@Component({
  components: {},
})
export default class JdBillion extends Vue {
  url =
    "https://prodev.m.jd.com/mall/active/3Mn94iN9vG2g1zTLxKPzFmEVewTB/index.html";
  // "https://story.m.jd.com/babelDiy/Zeus/4CK7mjNViaAf8e1B8dshs98k3DBA/index.html?ad_od=1&_ts=1577808036889&utm_user=plusmember&cu=true&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=0846a8a272614f86aa3c99dbd442d77a";
  datas: any[] = [];
  multipleSelection: any[] = [];
  filter_text = "";

  qiangquan(items: any[]) {
    items.forEach((item) => {
      invoke("getJdMillion", item).then(({ data }) =>
        this.$notify({
          title: "提示",
          message: data,
        })
      );
    });
  }
  pullData() {
    invoke("getJdMillionList", {
      url: this.url,
    }).then((datas) => {
      this.datas = datas;
    });
  }

  handleSelectionChange(val) {
    this.multipleSelection = val;
  }

  get filtered_datas() {
    if (!this.filter_text) {
      return this.datas;
    }
    return this.datas.filter(
      (item) =>
        item.skuName.includes(this.filter_text) ||
        String(item.disCount) === this.filter_text ||
        String(item.pDisCount) === this.filter_text ||
        String(item.p) === this.filter_text
    );
  }
}
</script>

<style>
</style>

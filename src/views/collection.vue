<!--
 * @Author: oudingyin
 * @Date: 2019-09-06 14:50:35
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 17:12:26
 -->
<template>
  <div>
    <el-form>
      <el-form-item label="平台">
        <el-radio-group v-model="platform">
          <el-radio label="taobao">淘宝</el-radio>
          <el-radio label="jingdong">京东</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="类型">
        <el-radio-group v-model="type">
          <el-radio label="store">店铺</el-radio>
          <el-radio label="goods">商品</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button @click="onClick">获取</el-button>
      </el-form-item>
    </el-form>
    <el-button
      type="error"
      :disabled="multipleSelection.length===0"
      @click="del(multipleSelection)"
    >删除选中</el-button>
    <el-table
      ref="tb"
      :data="tableData"
      @selection-change="multipleSelection=$event"
    >
      <el-table-column
        type="selection"
        width="55"
      ></el-table-column>
      <el-table-column label="名称">
        <template slot-scope="{row}">
          <a
            :href="row.url"
            target="_blank"
          >{{row.title}}</a>
        </template>
      </el-table-column>
      <!-- <el-table-column width="120">
        <template slot-scope="{row}">
          <el-button>评价</el-button>
        </template>
      </el-table-column>-->
    </el-table>
    <div>
      <el-button
        :disabled="page<=1"
        @click="go(-1)"
      >上一页</el-button>
      <el-button
        v-if="more"
        @click="go(1)"
      >下一页</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { getCollection, delCollection } from "../api";

@Component({
  components: {}
})
export default class Collection extends Vue {
  platform = "taobao";
  type = "store";
  page = 1;
  tableData: any[] = [];
  more = false;
  multipleSelection: any[] = [];
  onClick() {
    this.page = 1;
    this.getList();
  }
  async del(items: any[]) {
    await delCollection(
      {
        type: this.type,
        items
      },
      this.platform
    );
    this.getList();
  }
  getList() {
    this.tableData = [];
    getCollection({
      platform: this.platform,
      type: this.type,
      page: this.page
    }).then(({ more, items }) => {
      this.tableData = items;
      this.more = more;
    });
  }

  go(d: number) {
    this.page += d;
    this.getList();
  }
}
</script>

<style lang="scss">
</style>
<!--
 * @Author: oudingyin
 * @Date: 2019-07-15 08:54:29
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-06 16:57:54
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
      <el-form-item>
        <el-button @click="onClick">获取</el-button>
        <el-button @click="comment" :disabled="multipleSelection.length===0" :loading="pending">评价选中</el-button>
      </el-form-item>
    </el-form>
    <el-table ref="tb" :data="tableData" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="商品名称">
        <template slot-scope="{row}">
          <div v-for="item of row.items" :key="item.id">
            <img :src="item.img" width="50" />
            <a :href="item.url" target="_blank">{{item.title}}</a>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column width="120">
        <template slot-scope="{row}">
          <el-button>评价</el-button>
        </template>
      </el-table-column>-->
    </el-table>
    <div>
      <el-button :disabled="page<=1" @click="go(-1)">上一页</el-button>
      <el-button v-if="more" @click="go(1)">下一页</el-button>
    </div>
  </div>
</template>
<route-meta>
{
  "title": "评论"
}
</route-meta>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { commentList, comment } from "../api";

@Component
export default class Comment extends Vue {
  @Prop() value!: any[];
  platform = "jingdong";
  tableData: any[] = [];
  multipleSelection: any[] = [];
  more = false;
  page = 1;
  pending = false;
  onClick() {
    this.page = 1;
    this.refresh();
  }
  async refresh() {
    var ret = await commentList(
      {
        page: this.page,
        type: 6
      },
      this.platform
    );
    this.tableData = ret.items;
    this.more = ret.more;
  }

  go(num: number) {
    this.page += num;
    this.refresh();
  }

  async comment() {
    this.pending = true;
    try {
      await comment(
        {
          orderIds: this.multipleSelection.map(item => item.id)
        },
        this.platform
      );
    } catch (e) {}
    this.refresh();
    this.pending = false;
  }

  onSelectionChange(val: any) {
    this.multipleSelection = val;
  }
}
</script>

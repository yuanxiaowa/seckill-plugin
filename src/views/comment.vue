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
        <el-button @click="reload">获取</el-button>
      </el-form-item>
    </el-form>
    <data-list-wrapper ref="tb" :fetcher="fetcher" :columns="columns">
      <template slot-scope="{row}" slot="actions">
        <el-button @click="comment([row])">评价</el-button>
      </template>
      <template slot-scope="{selections}" slot="selection">
        <el-button :disabled="selections.length===0" @click="comment(selections)">评价</el-button>
      </template>
    </data-list-wrapper>
  </div>
</template>
<route-meta>
{
  "title": "评论"
}
</route-meta>

<script lang="tsx">
import { Component, Prop, Vue } from "vue-property-decorator";
import { commentList, comment } from "../api";
import DataListWrapper from "@/components/DataListWrapper.vue";

@Component({
  components: {
    DataListWrapper
  }
})
export default class Comment extends Vue {
  @Prop() value!: any[];
  platform = "taobao";

  pending = false;

  columns = [
    {
      prop: "title",
      label: "商品名称",
      render: this.renderTitle
    }
  ];

  renderTitle({ row }) {
    return row.items.map(item => (
      <div key={item.id}>
        <img src={item.img} width="50" />
        <a href={item.url} target="_blank">
          {item.title}
        </a>
      </div>
    ));
  }

  fetcher({ page }) {
    return commentList(
      {
        page: page,
        type: 6
      },
      this.platform
    );
  }

  reload() {
    (this.$refs.tb as DataListWrapper).reload();
  }

  async comment(datas) {
    this.pending = true;
    try {
      await comment(
        {
          orderIds: datas.map(item => item.id)
        },
        this.platform
      );
    } catch (e) {}
    this.reload();
    this.pending = false;
  }
}
</script>

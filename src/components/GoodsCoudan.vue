<template>
  <span>
    <el-button type="text" icon="el-icon-sugar" title="查看活动" @click="showActivity"></el-button>

    <el-dialog :visible.sync="visible">
      <div v-loading="loading">
        <div v-for="promotion of promotions" :key="promotion.title">
          <span style="color:red;margin-right:1em">{{promotion.title}}</span>
          <el-button>凑单</el-button>
          <el-button>{{promotion.hasReceived?'继续':''}}领取</el-button>
        </div>
        <span v-if="promotions.length===0">暂无数据</span>
      </div>
    </el-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { getGoodsPromotions } from "@/api";

@Component
export default class GoodsCoudan extends Vue {
  @Prop() item: any;
  @Prop() platform!: string;
  visible = false;
  promotions: any[] = [];
  loading = false;
  async showActivity() {
    this.visible = true;
    if (this.promotions.length > 0) {
      return;
    }
    this.loading = true;
    try {
      this.promotions = await getGoodsPromotions({
        ...this.item,
        platform: this.platform,
      });
    } catch (e) {}
    this.loading = false;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

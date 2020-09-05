<template>
  <span>
    <span @click="showActivity">
      <el-icon class="el-icon-present" title="查看活动" style="color:red;cursor:pointer"></el-icon>
    </span>
    <el-dialog :visible.sync="visible">
      <div v-loading="loading">
        <div v-for="promotion of promotions" :key="promotion.title">
          <span style="color:red;margin-right:1em">{{promotion.title}}</span>
          <el-button @click="coudan(promotion)">凑单</el-button>
          <el-button
            :disabled="!promotion.enabled"
            @click="applyCoupon(promotion)"
          >{{promotion.btnText}}</el-button>
        </div>
        <span v-if="promotions.length===0">暂无数据</span>
        <el-button icon="el-icon-refresh" :loading="loading" @click="fetchDatas" circle title="刷新"></el-button>
      </div>
    </el-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  getGoodsPromotions,
  goodsList,
  cartAdd,
  applyCoupon,
  goodsInfo,
} from "@/api";

@Component
export default class GoodsItemCoudan extends Vue {
  @Prop() item: any;
  @Prop() platform!: string;
  @Prop(Boolean) isLonely!: boolean;
  visible = false;
  promotions: any[] = [];
  loading = false;
  actualItem: any = {};
  showActivity() {
    this.visible = true;
    if (this.promotions.length > 0) {
      return;
    }
    this.fetchDatas();
  }

  async fetchDatas() {
    this.loading = true;
    try {
      if (this.isLonely) {
        let item = await goodsInfo({
          ...this.item,
          platform: this.platform,
        });
        this.actualItem = {
          ...item,
          ...this.item,
        };
      } else {
        this.actualItem = this.item;
      }
      this.promotions = await getGoodsPromotions({
        ...this.actualItem,
        platform: this.platform,
      });
    } catch (e) {}
    this.loading = false;
  }

  async coudan({ quota, searchParams, seg }) {
    let start_price = 0;
    let now_price = this.actualItem.price * this.actualItem.quantity;
    if (seg) {
      let n = Math.ceil(now_price / quota);
      start_price = quota * n - now_price;
    } else {
      if (now_price < quota) {
        start_price = quota - now_price;
      } else {
        this.$notify.warning("已达到额度，无需凑单");
        return;
      }
    }
    var {
      items: [item],
    } = await goodsList({
      platform: this.platform,
      start_price,
      ...searchParams,
    });
    var promises: Promise<any>[] = [
      cartAdd(
        {
          url: item.url,
          quantity: 1,
        },
        this.platform
      ),
    ];
    if (this.isLonely) {
      promises.push(
        cartAdd(
          {
            quantity: 1,
            ...this.actualItem,
          },
          this.platform
        )
      );
    }
    await Promise.all(promises);
    this.$notify.success("凑单商品已加入购物车");
    this.visible = true;
    this.$emit("refresh");
  }

  async applyCoupon({ params, pointConsume }) {
    if (pointConsume > 0) {
      await this.$msgbox.confirm(`消耗${pointConsume}积分兑换？`);
    }
    await applyCoupon({
      ...params,
      platform: this.platform,
    });
    this.$notify.success("抢到了");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

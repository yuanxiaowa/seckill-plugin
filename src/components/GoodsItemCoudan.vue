<template>
  <span>
    <span @click="showActivity">
      <el-icon
        class="el-icon-present"
        title="查看活动"
        style="color: red; cursor: pointer"
      ></el-icon>
    </span>
    <el-dialog :visible.sync="visible">
      <div v-loading="loading">
        <div v-for="promotion of promotions" :key="promotion.title">
          <span style="color: red; margin-right: 1em">{{
            promotion.title
          }}</span>
          <el-input-number v-model="promotion.coudanPrice"></el-input-number>
          <el-button @click="coudan(promotion)">凑单</el-button>
          <el-input-number v-model="promotion.expectedPrice"></el-input-number>
          <el-button @click="coudan(promotion, true)">凑单买</el-button>
          <el-button
            :type="promotion.enabled ? 'success' : 'warning'"
            @click="applyCoupon(promotion)"
            >{{ promotion.btnText }}</el-button
          >
        </div>
        <span v-if="promotions.length === 0">暂无数据</span>
        <el-button
          icon="el-icon-refresh"
          :loading="loading"
          @click="fetchDatas"
          circle
          title="刷新"
        ></el-button>
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
  cartBuy,
} from "@/api";

async function getGoodsList(args, count = 1) {
  try {
    return await goodsList(args);
  } catch (error) {
    if (--count > 0) {
      return getGoodsList(args, count);
    }
    throw error;
  }
}

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
      var promotions = await getGoodsPromotions({
        ...this.actualItem,
        platform: this.platform,
      });
      this.promotions = promotions.map((item) => ({
        ...item,
        ...this.getPrice(item),
      }));
    } catch (e) {}
    this.loading = false;
  }

  getPrice({ quota, seg, discount }) {
    let start_price = 0;
    let now_price = this.actualItem.price * this.actualItem.quantity;
    if (seg) {
      let n = Math.ceil(now_price / quota);
      start_price = quota * n - now_price;
    } else {
      if (now_price < quota) {
        start_price = quota - now_price;
      }
    }
    const coudanPrice = ((start_price * 100) >> 0) / 100;
    const expectedPrice = quota - discount || 0;
    return {
      coudanPrice,
      expectedPrice,
    };
  }

  async coudan(
    { quota, searchParams, seg, coudanPrice, expectedPrice },
    directBuy = false
  ) {
    var { items } = await getGoodsList(
      {
        platform: this.platform,
        start_price: coudanPrice,
        ...searchParams,
      },
      5
    );
    var item = items[items.length - 1];
    items.reverse().forEach((newItem) => {
      if (newItem.price < item.price) {
        item = newItem;
      }
    });
    if (directBuy) {
      var { skuId, itemId } = await goodsInfo({
        url: item.url,
      });
      cartBuy({
        platform: this.platform,
        expectedPrice,
        jianlou: 30,
        no_relay: true,
        items: [
          {
            title: item.title,
            settlement: [skuId === "0" ? itemId : skuId, 1].join("_"),
          },
          {
            title: this.actualItem.title,
            settlement: [
              this.actualItem.skuId === "0"
                ? this.actualItem.itemId
                : this.actualItem.skuId,
              this.actualItem.quantity,
            ].join("_"),
          },
        ],
      });
    } else {
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
    }
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

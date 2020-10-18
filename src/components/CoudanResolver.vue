<template>
  <el-form ref="form" inline :model="form" label-width="100px">
    <el-form-item label="商品原价">
      <el-input-number
        v-model="form.price"
        :min="0"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="折扣">
      <el-input-number
        v-model="form.discount"
        :min="0"
        :max="10"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="优惠券金额">
      <el-input-number v-model="form.couponPrice" :min="0"></el-input-number>
    </el-form-item>
    <el-form-item label="满减">
      满
      <el-input-number v-model="form.quota" :min="0"></el-input-number>
      减
      <el-input-number v-model="form.amount" :min="0"></el-input-number>
    </el-form-item>
    <!-- <div>
      <el-form-item>
        <el-button :disabled="form.price === 0" @click="calc">计算</el-button>
      </el-form-item>
    </div> -->
    <div label="凑单">
      最终价格: <el-tag type="danger">{{ finalPrice }}</el-tag> 凑单:
      <el-tag>{{ coudanPrice }}</el-tag>
    </div>
  </el-form>
</template>

<script lang="tsx">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class CoudanResolver extends Vue {
  discountItems: number[] = [];

  coudanPrice = '0';
  finalPrice = '0';

  form = {
    price: 0,
    amount: 30,
    quota: 300,
    discount: 5,
    couponPrice: 0,
  };

  @Watch('form', {
    deep: true
  })
  calc() {
    const form = this.form;
    let price = (form.price * form.discount) / 10 - form.couponPrice;
    let coudanPrice = 0;
    if (form.quota > 0) {
      coudanPrice = form.quota - form.price;
      let tmpPrice = -1;
      while (true) {
        tmpPrice =
          price - (form.price / (coudanPrice + form.price)) * form.amount;
        if (tmpPrice < 0) {
          if (coudanPrice > 10000) {
            this.$msgbox.alert('无法凑单')
            return;
          }
          coudanPrice++;
        } else {
          break;
        }
      }
      price = tmpPrice;
    }
    this.finalPrice = price.toFixed(2);
    this.coudanPrice = coudanPrice.toFixed(2);
  }
}
</script>

<style>
</style>
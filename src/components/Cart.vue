<!--
 * @Author: oudingyin
 * @Date: 2019-07-15 08:54:29
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-31 15:25:15
 -->
<template>
  <div>
    <el-form size="small">
      <el-form-item>
        <el-col :span="8">
          <el-checkbox v-model="from_pc" style="margin-right:1em">pc</el-checkbox>
          <span>平台：</span>
          <el-radio-group v-model="platform">
            <el-radio label="taobao">淘宝</el-radio>
            <el-radio label="jingdong">京东</el-radio>
          </el-radio-group>
          <el-button style="margin-left:2em" type="primary" @click="pullCartData()">拉取</el-button>
        </el-col>
        <el-col :span="8">
          <el-form-item label="日期">
            <date-picker v-model="datetime"></date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-input v-model.number="jianlou">
            <span slot="prepend">捡漏</span>
          </el-input>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-col :span="8">
          <el-checkbox v-model="noinvalid">存在失效商品不提交</el-checkbox>
          <el-checkbox v-model="from_browser">浏览器提交</el-checkbox>
          <el-checkbox :value="!no_interaction" @input="no_interaction=!$event">互助</el-checkbox>
        </el-col>
        <el-col :span="8">
          <el-form-item>
            <el-input v-model="expectedPrice" :disabled="!forcePrice">
              <span slot="prepend">
                期望价格
                <el-checkbox v-model="forcePrice"></el-checkbox>
              </span>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="地址">
            <address-picker v-model="addressId"></address-picker>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" :disabled="checkedLength===0" @click="submit">提交订单</el-button>
      </el-form-item>
    </el-form>
    <cart-table
      :value="tableData"
      @select-item="selectItem"
      @select-vendor="selectVendor"
      @select-all="selectAll"
      @update-quantity="updateQuantity"
      @del-item="delItem"
    ></cart-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CartTable from "./CartTable.vue";
import DatePicker from "./DatePicker.vue";
import AddressPicker from "./AddressPicker.vue";
import { Platform } from "../handlers";
import {
  cartList,
  cartToggle,
  cartBuy,
  cartUpdateQuantity,
  cartDel,
  cartToggleAll
} from "../api";
import bus from "../bus";
@Component({
  components: {
    CartTable,
    DatePicker,
    AddressPicker
  }
})
export default class App extends Vue {
  platform: Platform = "taobao";
  datetime = "";
  tableData: any[] = [];
  other!: any;
  from_pc = false;
  noinvalid = false;
  expectedPrice = 0;
  forcePrice = false;
  from_browser = false;
  jianlou = 30;
  no_interaction = false;
  addressId = "";

  async pullCartData(data: any) {
    this.tableData = [];
    if (!data) {
      data = await cartList(this.platform, this.from_pc);
    }
    this.tableData = data.items;
    this.other = data.other;
  }

  async delItem(item, parent) {
    await cartDel(
      {
        items: [item],
        ...this.other
      },
      this.platform
    );
    if (parent.items.length === 1) {
      let i = this.tableData.indexOf(parent);
      this.tableData.splice(i, 1);
      return;
    }
    let i = parent.items.indexOf(item);
    parent.items.splice(i, 1);
  }

  async updateQuantity(item) {
    await cartUpdateQuantity(
      {
        items: [item],
        ...this.other
      },
      this.platform
    );
  }

  async updateChecked(items, checked) {
    if (this.platform === "taobao") {
      return;
    }
    await cartToggle(
      {
        items,
        ...this.other,
        checked
      },
      this.platform
    );
  }
  async selectItem(item: any) {
    return this.updateChecked([item], item.checked);
  }

  selectVendor({ items, checked }) {
    items.forEach(item => {
      item.checked = checked;
    });
    return this.updateChecked(items, checked);
  }
  selectAll(checked: boolean) {
    this.tableData.forEach(parent => {
      parent.checked = checked;
      parent.items.forEach(item => {
        item.checked = checked;
      });
    });
    bus.$emit("unselect-all", this.platform);
  }

  get checkedLength() {
    return this.tableData.reduce(
      (sum, item) =>
        sum +
        item.items.reduce(
          (state: number, item: any) => state + Number(item.checked),
          0
        ),
      0
    );
  }
  submit() {
    var items: any[] = [];
    if (this.platform === "taobao") {
      this.tableData.forEach(item => {
        item.items.forEach((subitem: any) => {
          if (subitem.checked) {
            items.push(subitem);
          }
        });
      });
    }
    var data: any = {
      items,
      from_pc: this.from_pc,
      from_browser: this.from_browser,
      noinvalid: this.noinvalid,
      jianlou: this.jianlou,
      no_interaction: this.no_interaction,
      addressId: this.addressId
    };
    if (this.forcePrice) {
      data.expectedPrice = +this.expectedPrice;
    }
    cartBuy(data, this.datetime, this.platform);
  }
}
</script>

<style>
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>

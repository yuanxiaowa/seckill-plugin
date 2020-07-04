<!--
 * @Author: oudingyin
 * @Date: 2019-08-21 17:44:34
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-13 16:21:02
 -->
<template>
  <div>
    <el-form size="small">
      <el-form-item>
        <el-checkbox v-model="from_pc">pc购买 &nbsp;</el-checkbox>
        <el-radio-group v-model="platform">
          <el-radio label="taobao">淘宝</el-radio>
          <el-radio label="jingdong">京东</el-radio>
        </el-radio-group>
        <el-button style="margin-left:2em" type="primary" @click="pullData()">拉取</el-button>
      </el-form-item>
      <el-form-item>
        <suggestion-input title="url" v-model="url" id="seckill-list" />
      </el-form-item>
    </el-form>
    <el-table :data="list" row-key="time">
      <el-table-column prop="time" width="200"></el-table-column>
      <el-table-column>
        <template slot-scope="{row}">
          <el-checkbox v-model="row.checked" @change="selectGroupAll(row,$event)">全选</el-checkbox>
          <el-button @click="seckill({items:row.items},true)" size="small">秒杀</el-button>
          <div v-for="item of row.items" :key="item.id">
            <el-checkbox v-model="item.checked"></el-checkbox>
            <a :href="item.url" target="_blank">{{item.title}}</a>
            <i style="text-decoration:">￥{{item.price}}</i>
            <el-tag type="danger" size="small">￥{{item.seckillPrice}}</el-tag>
            数量：{{item.quantity}}
            <el-button @click="seckill({items:[item]})" size="small">秒杀</el-button>
            <el-button @click="seckill({items:[item]},false,true)" size="small">捡漏</el-button>
            <el-button @click="addCart(item)" size="small">加入购物车</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import DatePicker from "./DatePicker.vue";
import SuggestionInput from "./SuggestionInput.vue";

import { getSeckillList, buyDirect, cartAdd, getUserName } from "../api";
import bus from "../bus";
import { sendMsg } from "../msg";

@Component({
  components: {
    DatePicker,
    SuggestionInput
  }
})
export default class SeckillList extends Vue {
  platform = "taobao";
  list = [];
  url = "";
  from_pc = false;
  no_interaction = true;

  pullData() {
    getSeckillList({
      platform: this.platform,
      url: this.url
    }).then(data => {
      data.forEach(group => {
        group.checked = false;
        group.items.sort((a, b) => b.price - a.price);
        group.items.forEach(item => {
          item.checked = true;
        });
      });
      this.list = data;
    });
  }
  seckill({ items, qq }, isChecked = false, is_now = false) {
    var jianlou = is_now ? 61 - new Date().getMinutes() : 1;
    return Promise.all(
      items.map(item => {
        if (isChecked) {
          if (!item.checked) {
            return;
          }
        }
        return buyDirect(
          {
            url: item.url,
            quantity: 1,
            expectedPrice: +item.seckillPrice,
            forcePrice: true,
            jianlou,
            from_pc: this.from_pc,
            other: {},
            _comment: item.title,
            qq,
            no_interaction: this.no_interaction
          },
          is_now ? "" : item.time,
          this.platform
        );
      })
    );
  }

  selectGroupAll(item, checked) {
    item.items.forEach(item => {
      item.checked = checked;
    });
  }

  addCart(item) {
    cartAdd(
      {
        url: item.url,
        quantity: 1
      },
      this.platform
    );
  }

  mounted() {
    bus.$on("seckill", async (data?: { port: number; qq: number }) => {
      var username = await getUserName("taobao");
      getSeckillList({
        platform: this.platform,
        url: this.url
      })
        .then(([{ items, time }]) => {
          var t = new Date(time).getTime();
          items = items.sort((a, b) => b.price - a.price);
          this.seckill({
            items: items.slice(0, 3),
            qq: data && data.qq
          }).then(
            () => {
              sendMsg(`(${username})` + time + "开始秒杀", data && data.qq);
            },
            e => {
              sendMsg(`(${username})` + "秒杀出错", data && data.qq);
            }
          );
        })
        .catch(e => {
          sendMsg(`(${username})` + e.message, data && data.qq);
        });
    });
  }
  beforeDestroy() {
    bus.$off("seckill");
  }
}
</script>

<style>
</style>
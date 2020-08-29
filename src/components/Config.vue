<template>
  <el-form size="small">
    <el-form-item>
      <el-button @click="drawer=true">配置</el-button>
      <el-button @click="show_task=true">任务列表</el-button>
    </el-form-item>
    <el-drawer title="配置" :visible.sync="drawer" direction="ltr">
      <el-divider></el-divider>
      <el-form-item>
        <el-tag>{{username}}</el-tag>
        <el-button icon="el-icon-refresh-right" circle @click="refreshUserName"></el-button>
        <account-info></account-info>
      </el-form-item>
      <el-form-item label="端口号" v-if="config.is_main">
        <el-input-number v-model="port" @change="onPortChange" :min="80" :max="35000"></el-input-number>
      </el-form-item>
      <el-form-item>
        <status-comp />
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item label="自动提交订单">
        <el-checkbox v-model="config.isSubmitOrder" @input="setConfig"></el-checkbox>
      </el-form-item>
      <el-form-item label="监视重载">
        <el-checkbox v-model="config.resubmit" @input="setConfig"></el-checkbox>
      </el-form-item>
      <el-form-item label="延迟">
        <el-input-number v-model="config.delay_all" @input="setConfig"></el-input-number>
      </el-form-item>
      <el-form-item label="下单间隔">
        <el-input-number v-model="config.interval_submit" @input="setConfig"></el-input-number>
      </el-form-item>
      <el-form-item label="下单延时">
        <el-input-number v-model="config.delay_submit" @input="setConfig"></el-input-number>
      </el-form-item>
      <el-form-item label="主账号">
        <el-checkbox v-model="config.is_main" @input="setConfig"></el-checkbox>
      </el-form-item>
      <el-form-item label="QQ">
        <el-input v-model="config.qq" @input="setConfig"></el-input>
      </el-form-item>
      <el-form-item label="接收消息">
        <el-checkbox v-model="config.accept_messages" @input="setConfig"></el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button @click="pullConfig">拉取配置</el-button>
        <el-button style="margin-left:2em" @click="logout">退出</el-button>
      </el-form-item>
    </el-drawer>

    <task v-model="show_task"></task>
  </el-form>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { getConfig, setConfig, logout, getUserName } from "../api";
import bus from "../bus";
import Task from "./Task.vue";
import StatusComp from "./StatusComp.vue";
import AccountInfo from "./AccountInfo.vue";
import { init } from "@/msg";

@Component({
  components: {
    Task,
    StatusComp,
    AccountInfo,
  },
})
export default class Config extends Vue {
  config: any = {};
  username = "";
  mounted() {
    this.pullConfig();
    this.refreshUserName();
  }

  refreshUserName() {
    getUserName("taobao").then((username) => {
      this.username = username;
    });
  }

  pullConfig() {
    getConfig().then((c) => {
      /* if (c.is_main) {
      } */
      init(c);
      this.config = c;
    });
  }

  logout() {
    logout("taobao");
  }

  setConfig() {
    setConfig(this.config);
  }

  drawer = false;
  port = Number(localStorage.getItem("server-port")) || 7001;
  onPortChange() {
    bus.$emit("change-port", this.port);
  }
  show_task = false;
}
</script>

<style>
</style>

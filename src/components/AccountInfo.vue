<template>
  <div>
    <el-button @click="centerDialogVisible=true">配置账户</el-button>
    <el-dialog title="账号信息" :visible.sync="centerDialogVisible" width="30%" center :modal="false">
      <el-tabs v-model="activeName">
        <el-tab-pane label="淘宝" name="tb">
          <el-form :model="form.taobao" label-width="80px">
            <el-form-item label="用户名">
              <el-input v-model="form.taobao.username"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="form.taobao.password" show-password></el-input>
            </el-form-item>
            <el-form-item label="支付密码">
              <el-input v-model="form.taobao.paypass" show-password></el-input>
            </el-form-item>
            <!-- <el-form-item>
              <el-button type="primary" @click="onSubmit">确定</el-button>
            </el-form-item>-->
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="京东" name="jd">
          <el-form :model="form.jingdong" label-width="80px">
            <el-form-item label="用户名">
              <el-input v-model="form.jingdong.username"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="form.jingdong.password" show-password></el-input>
            </el-form-item>
            <el-form-item label="支付密码">
              <el-input v-model="form.jingdong.paypass" show-password></el-input>
            </el-form-item>
            <!-- <el-form-item>
              <el-button type="primary" @click="onSubmit">确定</el-button>
            </el-form-item>-->
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
      </span>-->
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
import { getAccounts, setAccounts } from "@/api";

@Component({
  components: {}
})
export default class AccountInfo extends Vue {
  centerDialogVisible = false;
  activeName = "tb";
  form = {
    taobao: {
      username: "",
      password: "",
      paypass: ""
    },
    jingdong: {
      username: "",
      password: "",
      paypass: ""
    }
  };

  async created() {
    this.form = await getAccounts();
    console.log(this.form);
    this.$nextTick(() => {
      this.$watch("form", setAccounts, {
        deep: true
      });
    });
  }
}
</script>

<style lang="scss">
</style>
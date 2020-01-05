<!--
 * @Author: oudingyin
 * @Date: 2019-08-21 16:38:25
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-23 18:00:57
 -->
<script lang="tsx">
import { Component, Vue, Prop } from "vue-property-decorator";
import DatePicker from "./DatePicker.vue";

@Component({
  components: {
    DatePicker
  }
})
export default class Form extends Vue {
  @Prop() value!: any[];
  @Prop() schema!: any;
  @Prop() layout!: any[];
  @Prop({
    type: String,
    default: "确定"
  })
  btnText!: string;
  @Prop() submitHandler!: Function;

  datas: any[] = [];
  formData = {};
  created() {
    var schema = this.schema;
    var properties = schema.properties;
    var required = schema.required || [];
    var layout = this.layout || Object.keys(properties);
    var formData = this.formData;
    function formatKeys(items: any[]) {
      return items.map(item => {
        if (typeof item === "string") {
          item = {
            key: item
          };
        } else if (item.items) {
          item.items = formatKeys(item.items);
        }
        item.required =
          "required" in item ? item.required : required.includes(item.key);
        var s_item = properties[item.key];
        Vue.set(formData, item.key, s_item.default);
        formData[item.key] = s_item.default;
        item.title = item.title || s_item.title;
        item.description = item.description || s_item.description;
        item.format = item.format || s_item.format;
        if (s_item.enum) {
          s_item.enum = s_item.enum.map(item =>
            typeof item === "string" ? { key: item, value: item } : item
          );
        }
        if (!item.ui) {
          if (s_item.type === "number") {
            s_item.ui === "input";
          } else if (s_item.type === "date") {
            s_item.ui === "date-picker";
          } else if (s_item.enum) {
            s_item.ui === "select";
          } else {
            s_item.ui === "input";
          }
        }
        return item;
      });
    }
    this.datas = formatKeys(layout);
  }

  async onSubmit() {
    this.$emit("submit", this.formData);
  }

  getControl(item) {
    if (item.ui === "radio") {
      return <el-radio />;
    }
  }

  getControls(items: any[], inner = false) {
    if (inner) {
      return items.map(item => (
        <el-col span={24 / items.length}>
          <el-form-item label={item.title}>
            {this.getControl(item)}
          </el-form-item>
        </el-col>
      ));
    }
    return items.map(item => (
      <el-form-item label={item.title}>{this.getControl(item)}</el-form-item>
    ));
  }

  render() {
    return (
      <el-form onSubmit={this.onSubmit}>
        {this.getControls(this.datas)}
        <el-button>{this.btnText}</el-button>
      </el-form>
    );
  }
}
</script>

<style>
</style>
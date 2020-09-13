<!--
 * @Author: oudingyin
 * @Date: 2019-08-09 14:04:57
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-31 17:15:38
 -->

<script lang="tsx">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import { getMyCoupons } from "../api";

@Component({})
export default class DataListWrapper extends Vue {
  @Prop() columns!: any[];
  @Prop() actions!: { text: string; test?(props: any): boolean }[];
  @Prop() fetcher!: ({
    page: number,
  }) => Promise<{
    items: any[];
    more: boolean;
    page: number;
  }>;
  @Prop({
    default: "id",
  })
  rowKey!: string;
  @Prop({
    default() {
      return {};
    },
  })
  filters!: {
    default: string;
    keys: string[];
  };
  @Prop({
    default() {
      return {};
    },
  })
  excludeFilters!: {
    default: string;
    keys: string[];
  };

  @Prop() extraFilter!: (items: any[]) => any[];
  @Prop({
    default: 400,
  })
  maxHeight!: number;

  page = 1;
  more = true;
  is_attach = false;
  items: any[] = [];
  loading = false;
  hasLoaded = false;
  isLoadingAll = false;

  multipleSelection: any[] = [];

  created() {
    if (this.filters.default) {
      this.filter_kw = this.filters.default;
    }
    if (this.excludeFilters.default) {
      this.filter_not_kw = this.excludeFilters.default;
    }
  }

  async search() {
    this.loading = true;
    try {
      var { items, more } = await this.fetcher({
        page: this.page,
      });
      if (this.is_attach && this.page !== 1) {
        this.items = this.items.concat(items);
      } else {
        this.items = items;
      }
      this.more = more;
      this.hasLoaded = true;
    } catch (e) {}
    this.loading = false;
  }

  reload() {
    this.page = 1;
    return this.search();
  }

  async loadAll() {
    if (!this.more) {
      return;
    }
    if (this.hasLoaded) {
      this.page++;
    }
    this.isLoadingAll = true;
    while (true) {
      await this.search();
      if (!this.more) {
        this.isLoadingAll = false;
        return;
      }
      if (!this.isLoadingAll) {
        return;
      }
      this.page++;
    }
  }

  remove(item: any) {
    var i = this.items.indexOf(item);
    this.items.splice(i, 1);
  }

  go(i: number) {
    this.page += i;
    this.search();
  }

  handleSelectionChange(val: any[]) {
    this.multipleSelection = val;
  }
  filter_kw = "";
  filter_not_kw = "";

  get filteredItems() {
    let items = this.items;
    if (this.filters.keys) {
      if (this.filter_kw) {
        const filter_kws = this.filter_kw
          .trim()
          .split(/\s+|\|/)
          .filter(Boolean)
          .map((item) => item.toLowerCase());
        if (filter_kws.length > 0) {
          items = items.filter((item) =>
            filter_kws.some((kw) =>
              this.filters.keys.some((key) =>
                item[key].toString().toLowerCase().includes(kw)
              )
            )
          );
        }
      }
    }
    if (this.excludeFilters.keys) {
      if (this.filter_not_kw) {
        const filter_not_kws = this.filter_not_kw
          .trim()
          .split(/\s+|\|/)
          .filter(Boolean)
          .map((item) => item.toLowerCase());
        if (filter_not_kws.length > 0) {
          items = items.filter(
            (item) =>
              !filter_not_kws.some((kw) =>
                this.excludeFilters.keys.some((key) =>
                  item[key].toString().toLowerCase().includes(kw)
                )
              )
          );
        }
      }
    }
    if (this.extraFilter) {
      return this.extraFilter(items);
    }
    return items;
  }

  renderColumn({
    render,
    prop,
    label,
    sortable,
    children,
    show,
    color,
    ...restProps
  }) {
    if (show && !show()) {
      return;
    }
    const otherProps: any = {};
    if (color) {
      otherProps.domProps = {
        style: `color:${color}`,
      };
    }
    if (render) {
      otherProps.scopedSlots = {
        default: render,
      };
    }
    if (sortable === undefined && prop) {
      sortable = true;
    }
    return (
      <el-table-column
        key={prop}
        prop={prop}
        label={label}
        sortable={sortable}
        {...{
          props: {
            ...restProps,
          },
          ...otherProps,
        }}
      >
        {children && children.map(this.renderColumn)}
      </el-table-column>
    );
  }

  renderTable() {
    return (
      <el-table
        ref="tb"
        data={this.filteredItems}
        tooltip-effect="dark"
        v-loading={this.loading}
        max-height={this.maxHeight}
        row-key="url"
        stripe
        {...{
          on: {
            "selection-change": this.handleSelectionChange,
          },

          style: "width: 100%",
        }}
      >
        <el-table-column type="selection" width="55"></el-table-column>
        {this.columns.map(this.renderColumn)}
        <el-table-column />
        <el-table-column
          fixed="right"
          label="操作"
          width={150}
          align="right"
          {...{
            scopedSlots: {
              default: this.$scopedSlots.actions,
            },
          }}
        ></el-table-column>
      </el-table>
    );
  }
  render() {
    return (
      <div>
        <el-row gutter={15}>
          {this.filters.keys && (
            <el-col span={12}>
              <el-input
                value={this.filter_kw}
                placeholder="包含关键字"
                onInput={(v) => (this.filter_kw = v)}
              ></el-input>
            </el-col>
          )}
          {this.excludeFilters.keys && (
            <el-col span={12}>
              <el-input
                value={this.filter_not_kw}
                placeholder="不包含关键字"
                onInput={(v) => (this.filter_not_kw = v)}
              ></el-input>
            </el-col>
          )}
        </el-row>
        {this.renderTable()}
        <el-row type="flex">
          <el-col span={12}>
            {this.$scopedSlots.selection &&
              this.$scopedSlots.selection({
                selections: this.multipleSelection,
              })}
          </el-col>
          <el-col span={12} style="text-align:right">
            <span style="margin-right:1em">
              选中{this.multipleSelection.length}条, 当前:
              {this.filteredItems.length}条, 共{this.items.length}条
            </span>
            <el-checkbox
              value={this.is_attach}
              onInput={(v) => {
                this.is_attach = v;
              }}
            >
              数据附加
            </el-checkbox>
            {!this.is_attach && (
              <el-button disabled={this.page <= 1} onClick={() => this.go(-1)}>
                上一页
              </el-button>
            )}
            {this.more && (
              <el-button disabled={!this.more} onClick={() => this.go(1)}>
                下一页
              </el-button>
            )}
            {this.is_attach &&
              (this.isLoadingAll ? (
                <el-button
                  onClick={() => {
                    this.isLoadingAll = false;
                  }}
                >
                  停止
                </el-button>
              ) : (
                <el-button onClick={this.loadAll}>加载全部</el-button>
              ))}
          </el-col>
        </el-row>
      </div>
    );
  }
}
</script>

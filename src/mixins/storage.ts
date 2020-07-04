import Vue from "vue";
import { ThisTypedComponentOptionsWithArrayProps } from "vue/types/options";
export default function storageMixin<T = string>({
  key,
  skey = key,
  defaultValue,
  parser = JSON,
  onInit,
}: {
  /** 键名 */
  key: string;
  /** 存储的参数名 */
  skey?: string | (() => string);
  defaultValue?: T;
  parser?: {
    parse(v: string): T;
    stringify(data: T): string;
  };
  onInit?(v: T): void;
}) {
  var mixin: ThisTypedComponentOptionsWithArrayProps<
    Vue,
    any,
    any,
    any,
    any
  > = {
    created() {
      var _skey = typeof skey === "string" ? skey : skey.call(this);
      var v: any = localStorage.getItem(_skey);
      if (v) {
        try {
          v = parser.parse(v);
          setTimeout(() => {
            if (onInit) {
              onInit.call(this, v);
            }
          });
        } catch (error) {
          v = defaultValue;
        }
      } else {
        v = defaultValue;
      }
      this[key] = v;
      this.$watch(
        key,
        (value) => {
          var _skey = typeof skey === "string" ? skey : skey.call(this);
          localStorage.setItem(_skey, parser.stringify(value));
        },
        {
          deep: true,
        }
      );
    },
  };
  return mixin;
}

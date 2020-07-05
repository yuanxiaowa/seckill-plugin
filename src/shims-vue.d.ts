import Vue from "vue";

declare module "*.vue" {
  export default Vue;
}

declare module "vue/types/vue" {
  // 3. 声明为 Vue 补充的东西
  interface Vue {
    $getQrcodeUrl(src: string): Promise<string>;
    $showQrcode(src: string, title?: string): void;
  }
}

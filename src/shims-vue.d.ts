import Vue from "vue";

declare module "*.vue" {
  export default Vue;
}

declare global {
  function evalFile(filename: string, reload?: boolean): Promise<any>;
  function evalFunction(code: string): Promise<any>;
}

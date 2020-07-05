import "@types/chrome";

declare global {
  function evalFile(filename: string, reload?: boolean): Promise<any>;
  function evalFunction(code: string): Promise<any>;
}

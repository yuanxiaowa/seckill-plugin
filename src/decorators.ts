/*
 * @Author: oudingyin
 * @Date: 2019-08-22 10:11:33
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-22 11:50:48
 */
export function storage(key: string) {
  return (target: any, name: string) => {
    var value = localStorage.getItem(key);
    Object.defineProperty(target, name, {
      value,
      set(v: any) {
        // value = v;
        localStorage.setItem(key, v);
      }
    });
  };
}

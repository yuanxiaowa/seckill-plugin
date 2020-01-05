import { delay } from "./tool";

export function createScheduler(t = 1500) {
  var handlers: (() => any)[] = [];
  var pending = false;
  async function start() {
    if (pending === true) {
      return;
    }
    pending = true;
    while (handlers.length > 0) {
      try {
        await handlers.shift()!();
      } catch (e) {}
      await delay(t);
    }
    pending = false;
  }
  return function(handler: () => any) {
    var p = new Promise(resolve => {
      handlers.push(() => handler().then(resolve));
    });
    start();
    return p;
  };
}

import moment from "moment";

export function getJsonpData<T = any>(body: string): T {
  let text = /[\w$]+\(([\s\S]*)\)(;|$)/.exec(body.trim())![1];
  return eval(`(${text})`);
}

export function delay(t = 1000) {
  return new Promise<void>(resolve => setTimeout(resolve, t));
}

export function daily(f: Function) {
  f();
  setTimeout(
    () => daily(f),
    moment("23:59:59", "HH:mm:ss").valueOf() + 1000 - Date.now()
  );
}

export function period({ handler, title, t = 1000 }) {
  if (title) {
    console.log(new Date(), title);
  }
  handler();
  setTimeout(() => period({ handler, title, t }), t);
}

export function mermorize(handler: () => any, delay = 1000) {
  var prev_t = 0;
  var prev_p;
  return () => {
    if (prev_p) {
      if (Date.now() - prev_t < delay) {
        return prev_p;
      }
    }
    prev_t = Date.now();
    prev_p = handler();
    return prev_p;
  };
}

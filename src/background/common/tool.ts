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

export function period(f: Function, title: string, t = 1000) {
  if (title) {
    console.log(new Date(), title);
  }
  f();
  setTimeout(() => period(f, title, t), t);
}

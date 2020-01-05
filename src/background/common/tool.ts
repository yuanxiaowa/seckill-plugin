export function getJsonpData<T = any>(body: string): T {
  let text = /[\w$]+\(([\s\S]*)\)(;|$)/.exec(body.trim())![1];
  return eval(`(${text})`);
}

export function delay(t = 1000) {
  return new Promise<void>(resolve => setTimeout(resolve, t));
}

import moment from "moment";

export function getJsonpData<T = any>(body: string): T {
  let text = /[\w$]+\(([\s\S]*)\)(;|$)/.exec(body.trim())![1];
  return eval(`(${text})`);
}

export function delay(t = 1000) {
  return new Promise<void>((resolve) => setTimeout(resolve, t));
}

export function daily(f: Function) {
  f();
  setTimeout(
    () => daily(f),
    moment("23:59:59", "HH:mm:ss").valueOf() + 1000 - Date.now()
  );
}

export async function period({ handler, title, t = 1000 }) {
  if (title) {
    console.log(moment().format(moment.HTML5_FMT.TIME), title);
  }
  await handler();
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

export async function excuteTasks(tasks) {
  tasks.forEach(async (task) => {
    if (task.nextTime) {
      let f = async () => {
        await task.doTask();
        let date = await task.nextTime();
        if (date) {
          setTimeout(f, date - Date.now());
        }
      };
      if (task.forever) {
        f();
      } else {
        daily(f);
      }
    } else if (task.test) {
      daily(async () => {
        if (await task.test()) {
          await task.doTask();
        }
      });
    } else if (task.list) {
      let handler = async () => {
        var items = await task.list();
        for (let item of items) {
          try {
            await task.doTask(item);
          } catch (error) {
            console.log(error);
          }
          if (task.delay) {
            await delay(task.delay);
          }
        }
      };
      if (task.period) {
        period({
          handler,
          t: task.period,
          title: task.title,
        });
      } else {
        daily(handler);
      }
    } else if (task.period) {
      if (typeof task.period === "number") {
        let handler = () => task.doTask();
        period({
          handler,
          t: task.period,
          title: task.title,
        });
      } else if (task.period) {
        daily(async function f() {
          var times: number[][] = [];
          if (Array.isArray(task.period)) {
            times = task.period;
          } else if (typeof task.period === "function") {
            times = await task.period();
          }
          for (let [start, end] of times) {
            if (Date.now() < start) {
              await delay(start - Date.now());
            }
            if (Date.now() < end) {
              task.doTask();
            }
          }
        });
      }
    }
  });
}

export function formatUrl(url: string) {
  if (!/^\w+:\/\//.test(url)) {
    return "https:" + url;
  }
  return url;
}

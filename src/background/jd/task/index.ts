import { daily, period, delay } from "@/background/common/tool";
import { signInJr, getSignAwardJR, jr_tasks } from "./jr";
import { signInJd, jd_tasks } from "./jd";
import { nianshou_tasks } from "./nianshou";
import { jinguo_tasks } from "./jinguo";
import { joy_tasks } from "./joy";
import { farm_tasks } from "./farm";

async function signIn() {
  await Promise.all([signInJr(), signInJd()]);
  await getSignAwardJR();
}

async function excuteTasks(tasks) {
  tasks.forEach(async task => {
    if (task.test) {
      daily(async () => {
        if (await task.test()) {
          await task.doTask();
        }
      });
    } else if (task.list) {
      daily(async () => {
        for (let item of await task.list()) {
          try {
            await task.doTask(item);
          } catch (error) {
            console.log(error);
          }
          if (task.delay) {
            await delay(task.delay);
          }
        }
      });
    } else if (task.period) {
      if (typeof task.period === "number") {
        (function f() {
          task.doTask();
          setTimeout(f, task.period);
        })();
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

daily(signIn);
excuteTasks(jr_tasks);
excuteTasks(jd_tasks);
excuteTasks(joy_tasks);
excuteTasks(nianshou_tasks);
excuteTasks(jinguo_tasks);
excuteTasks(farm_tasks);

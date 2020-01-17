import { daily, period, delay } from "@/background/common/tool";
import { jr_tasks } from "./jr";
import { jd_tasks } from "./jd";
import { nianshou_tasks } from "./nianshou";
import { jinguo_tasks } from "./jinguo";
import { joy_tasks } from "./joy";
import { farm_tasks } from "./farm";
import { nutrient_tasks } from "./nutrient";
import { pig_tasks } from "./pig";

async function excuteTasks(tasks) {
  tasks.forEach(async task => {
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
      };
      if (task.period) {
        period({
          handler,
          t: task.period,
          title: task.title
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
          title: task.title
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

excuteTasks(jr_tasks);
excuteTasks(jd_tasks);
excuteTasks(joy_tasks);
excuteTasks(nianshou_tasks);
excuteTasks(jinguo_tasks);
excuteTasks(farm_tasks);
excuteTasks(nutrient_tasks);
excuteTasks(pig_tasks);

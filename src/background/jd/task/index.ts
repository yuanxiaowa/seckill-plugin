import { daily, period, delay } from "@/background/common/tool";
import { signInJr, getSignAwardJR, jr_tasks } from "./jr";
import { signInJd, signInJdCoupon } from "./jd";
import { doNianshouTasks } from "./nianshou";
import { harvestJinguo, doHarvest, doJinguo } from "./jinguo";

async function signIn() {
  await Promise.all([signInJr(), signInJd()]);
  await getSignAwardJR();
}

async function excuteTasks(tasks) {
  tasks.forEach(async task => {
    try {
      if (task.test) {
        if (await task.test()) {
          await task.doTask();
        }
      } else if (task.list) {
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
      }
    } catch (error) {
      console.log(error);
    }
  });
}

function dailyTask() {
  signIn();
  doNianshouTasks();
  doJinguo();
  signInJdCoupon();
  excuteTasks(jr_tasks);
}
daily(dailyTask);
period(doHarvest, "收获金果", 20 * 60 * 1000);

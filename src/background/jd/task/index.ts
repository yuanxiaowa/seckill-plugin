import { daily, period } from "@/background/common/tool";
import { signInJr, getSignAwardJR } from "./jr";
import { signInJd } from "./jd";
import { doNianshouTasks } from "./nianshou";
import { harvestJinguo } from "./jinguo";

async function signIn() {
  await Promise.all([signInJr(), signInJd()]);
  await getSignAwardJR();
}

function dailyTask() {
  signIn();
  doNianshouTasks();
}

daily(dailyTask);
period(harvestJinguo, "收获金果", 10 * 60 * 1000);

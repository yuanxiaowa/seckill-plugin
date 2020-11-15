import { excuteTasks } from "@/background/common/tool";
import { jr_tasks } from "./jr";
import { jd_tasks } from "./jd";
// import { nianshou_tasks } from "./nianshou";
import { jinguo_tasks } from "./jinguo";
import { joy_tasks } from "./joy";
import { farm_tasks } from "./farm";
import { nutrient_tasks } from "./nutrient";
import { pig_tasks } from "./pig";

let running = false;

export function runJdTasks() {
  if (running) {
    return;
  }
  running = true;
  excuteTasks(jr_tasks);
  excuteTasks(jd_tasks);
  excuteTasks(joy_tasks);
  // excuteTasks(nianshou_tasks);
  excuteTasks(jinguo_tasks);
  excuteTasks(farm_tasks);
  excuteTasks(nutrient_tasks);
  excuteTasks(pig_tasks);
}

import moment from "moment";
import { getDelayTime } from "./time";
import { delay } from "./tool";

interface TaskItem {
  id: number;
  name: string;
  platform: string;
  comment: string;
  url?: string;
  time?: number | string;
  timer?: any;
  cancel: (msg?: string) => void;
  handler?: () => Promise<any>;
  interval?: {
    handler: () => any;
    t: number;
  };
}

class Spinner {
  start() {}
  stop(b: boolean) {}
  setSpinnerTitle(msg: string) {}
}

export class TaskManager {
  private tasks: TaskItem[] = [];
  private id = 0;
  private spinner = new Spinner();

  private titles: string[] = [];
  private title_index = 0;
  private title_timer: any = 0;
  switchSpinTitle() {
    if (this.titles.length === 0) {
      return;
    }
    this.spinner.setSpinnerTitle(
      `${moment().format(moment.HTML5_FMT.TIME_SECONDS)} ${
        this.titles[this.title_index++]
      }`
    );
    this.title_index %= this.titles.length;
    this.title_timer = setTimeout(() => this.switchSpinTitle(), 500);
  }
  registerTask(
    data: Pick<
      TaskItem,
      "name" | "platform" | "comment" | "url" | "handler" | "time" | "interval"
    >,
    t: number,
    finish_msg = "任务已完成"
  ) {
    var id = this.id++;
    var p = <
      Promise<any> & {
        id: number;
      }
    >new Promise((resolve, reject) => {
      var toTime = moment(data.time);
      var time = toTime.valueOf();
      var status = "pending";
      var rejectHandler: any;
      var title = [data.platform, data.name, data.comment].join("-");
      var taskData = {
        id,
        name: data.name,
        platform: data.platform,
        comment: data.comment,
        url: data.url,
        cancel: rejectHandler,
        time: toTime.format(),
        timer: <any>0,
      };
      if (!data.handler) {
        rejectHandler = (msg: string) => {
          if (taskData.timer) {
            clearTimeout(taskData.timer);
          }
          this.removeTask(id);
          reject(new Error(msg));
        };
        if (data.url) {
          if (this.tasks.find((task) => task.url === data.url)) {
            return rejectHandler(
              "\n 已存在该任务 " + JSON.stringify(data.comment, null, 2)
            );
          }
        }
        (async () => {
          var dt = await getDelayTime(time, data.platform);
          taskData.timer = setTimeout(() => {
            this.removeTask(id);
            resolve();
          }, toTime.diff(moment()) - dt + (data.platform === "taobao" ? 5000 : 0));
        })();
      } else {
        let update = (b: number) => {
          if (b === 1) {
            this.titles.push(title);
            if (this.titles.length === 1) {
              this.title_timer = this.switchSpinTitle();
              this.spinner.start();
            }
          } else {
            let i = this.titles.indexOf(title);
            this.titles.splice(i, 1);
            if (this.titles.length === 0) {
              this.spinner.stop(true);
              clearTimeout(this.title_timer);
            }
          }
        };
        rejectHandler = (
          msg = `\n${moment().format(
            moment.HTML5_FMT.TIME_SECONDS
          )} 取消任务 ${title}`
        ) => {
          status = "reject";
          update(-1);
          this.removeTask(id);
          var e = new Error(msg);
          // @ts-ignore
          e.skip = true;
          reject(e);
        };
        update(1);
        let f = async () => {
          try {
            if (status === "reject") {
              return;
            }
            let r = await data.handler!();
            if (r) {
              update(-1);
              this.removeTask(id);
              console.log(
                `\n${moment().format(
                  moment.HTML5_FMT.TIME_SECONDS
                )} ${title} ${finish_msg}`
              );
              return resolve();
            }
            if (data.time) {
              if (Date.now() < time) {
                if (t) {
                  await delay(t);
                }
              } else {
                return rejectHandler(
                  `\n${moment().format(
                    moment.HTML5_FMT.TIME_SECONDS
                  )} ${title} 超时了`
                );
              }
            }
            f();
          } catch (e) {
            if (e.name === "RequestError") {
              f();
              return;
            }
            console.error(e);
            rejectHandler(
              `\n${moment().format(
                moment.HTML5_FMT.TIME_SECONDS
              )} ${title} 任务已取消`
            );
          }
        };
        console.log(
          `\n${moment().format(
            moment.HTML5_FMT.TIME_SECONDS
          )} 开始任务 ${title}`
        );
        f();
        if (data.interval) {
          taskData.timer = setTimeout(function f() {
            data.interval!.handler();
            setTimeout(f, data.interval!.t);
          }, data.interval.t);
        }
      }
      taskData.cancel = rejectHandler;
      this.tasks.push(taskData);
    });
    p.id = id;
    return p;
  }
  cancelTask(id: number) {
    var i = this.tasks.findIndex((item) => item.id === id);
    if (i > -1) {
      let { timer, cancel } = this.tasks[i];
      cancel("手动取消任务 " + this.tasks[i].comment);
      if (timer) {
        clearTimeout(timer);
      }
      // this.tasks.splice(i, 1);
    }
  }
  removeTask(id: number) {
    var i = this.tasks.findIndex((item) => item.id === id);
    if (i > -1) {
      this.tasks.splice(i, 1);
    }
  }

  setTitle(id: number, title: string) {
    var item = this.tasks.find((item) => item.id === id);
    if (item) {
      item.comment = title;
    }
  }

  get items() {
    return this.tasks.map(({ id, name, platform, comment, url, time }) => ({
      id,
      name,
      platform,
      text: comment,
      url,
      time,
    }));
  }
}

export const taskManager = new TaskManager();

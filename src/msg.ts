/*
 * @Author: oudingyin
 * @Date: 2019-07-16 14:02:05
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-09-17 08:58:16
 */
import bus from "./bus";
import { groups, qq_users, super_user } from "./config";
import { sendPrivateMsg, sendGroupMsg } from "./api";
import { resolveText } from "./tools";
import "./order";

// http://doc.cleverqq.cn/479462
// https://cqhttp.cc/docs/4.10/#/Post?id=%E4%B8%8A%E6%8A%A5%E6%95%B0%E6%8D%AE%E6%A0%BC%E5%BC%8F

export function init(config: any) {
  if (!config.accept_messages) {
    return;
  }
  var ws = new WebSocket("ws://localhost:6700/event/");
  ws.onmessage = e => {
    var { message_type, raw_message, group_id, user_id } = JSON.parse(e.data);
    var text = raw_message; // .replace(/\[CQ:[^\]]+/g, "").trim();
    if (message_type === "group") {
      if (config.is_main && groups.includes(group_id)) {
        if (handler(raw_message)) {
          console.log(text);
          // sendMsg("你好呀，" + text);
          /* if (
          /(\d+)点|锁单|先锁|0\.\d|速度|红包|抽奖|试试|手慢无|好价|神价/.test(
            text
          )
        ) {
          sendGroupMsg(text);
        } */
          sendGroupMsg(text);
        }
      }
    } else if (message_type === "private") {
      if (user_id === super_user || qq_users[user_id]) {
        let data =
          user_id === super_user
            ? undefined
            : {
                qq: user_id,
                port: qq_users[user_id]
              };
        if (raw_message === "cs" || raw_message === "检查状态") {
          return bus.$emit("check-status", data);
        }
        if (raw_message === "任务列表" || raw_message === "rwlb") {
          return bus.$emit("tasks", data);
        }
        if (raw_message === "秒杀" || raw_message === "ms") {
          return bus.$emit("seckill", data);
        }
        if (raw_message === "取消任务列表" || raw_message === "qxrwlb") {
          return bus.$emit("tasks-kill", data);
        }
        if (user_id !== super_user) {
          return;
        }
        if (/^切换(\d)$/.test(raw_message)) {
          bus.$emit("switch-port", Number(RegExp.$1) + 7000);
          return;
        }
        if (raw_message.includes("同步时间")) {
          return bus.$emit("sys-time", raw_message);
        }
        let datetime: string | undefined | Date;
        if (/(\d+)点/.test(text)) {
          /* let h = +RegExp.$1;
      let now = new Date();
      let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h);
      if (h === 0 || now.getHours() > h) {
        date.setDate(date.getDate() + 1);
      }
      datetime = date.toString(); */
          datetime = RegExp.$1;
        } else if (text.includes("现在") || text.includes("捡漏")) {
          datetime = new Date();
        }
        handler(raw_message, datetime);
      }
    }
  };
}

const r_taobao = /(?<!\w)\w{11}(?!\w)/g;
const r_url = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
const r_symbol = /[&%【】,，，\s￥(（¢)）\-~!/$​：。€]/g;
const r_image_file = /\[CQ:image,?file=[^\]]+\]/g;

function getTidyText(text: string) {
  return text
    .replace(r_taobao, "")
    .replace(r_image_file, "")
    .replace(/.*复制.*/g, "")
    .replace(/.*点击链接.*/, "")
    .replace(/【.*?】|[.*?]/g, "")
    .replace(r_url, "")
    .replace(r_symbol, "")
    .replace(
      /群有反馈|领取|速度|无门槛|京东|红包|先?领券|防身|不减则无|领了|可用|首单|红包|虹包|分享|大额|福利|中心|练手速?|预计|商品券|抽奖|试试|无视页面|预告|券|速度|限量|元/g,
      ""
    )
    .trim();
}

class Recorder {
  max = 20;
  items: string[] = [];
  add(str: string) {
    if (this.items.length >= this.max) {
      this.items.shift();
    }
    this.items.push(getTidyText(str));
  }
  has(str: string) {
    var text = getTidyText(str);
    return this.items.includes(text);
  }
}

var recorder = new Recorder();
// @ts-ignore
window.recorder = recorder;
// @ts-ignore
window.handler = handler;

function handler(text: string, datetime?: string | Date) {
  if (
    text.includes("【苏宁】") ||
    text.includes("【盒马】" || text.includes("美团"))
  ) {
    return;
  }
  text = text
    .replace(/\s+/, " ")
    .replace(/&amp;/g, "&")
    .replace(r_image_file, "")
    .replace(/💰/g, "元")
    .trim();
  if (recorder.has(text)) {
    return;
  }
  recorder.add(text);
  var data = resolveText(text, datetime);
  if (data && data.action) {
    if (data.action === "notice") {
      return true;
    }
    if (!data.datetime && data.action === "coudan" && /\d点/.test(text)) {
      return true;
    }
    data.from_pc = text.includes("电脑");
    bus.$emit(data.action, data);
    return (
      data.action === "coudan" ||
      /前\d/.test(text) ||
      /淘礼金|福利|漏洞|限量|话费|手速|手慢无|抽奖/.test(text)
    );
    // return true;
  }
}

export function sendMsg(msg: string, qq = super_user) {
  sendPrivateMsg(msg, qq);
}

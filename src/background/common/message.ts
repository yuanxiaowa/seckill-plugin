import { sendPrivateMsg } from "@/api_common";
import { config } from "./setting";

export function sendQQMsg(msg: string, qq = config.qq) {
  sendPrivateMsg(msg, qq);
}
export function notify(title: string) {
  chrome.notifications.create(Math.random() + "", {
    type: "basic",
    title,
    iconUrl: "favicon.ico",
    message: "",
  });
}

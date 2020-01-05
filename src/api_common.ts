import axios from "axios";

export function sendGroupMsg(message: string, group_id = 124866249) {
  return axios.get("http://localhost:5700/send_group_msg", {
    params: {
      group_id,
      message
    }
  });
}

export function sendPrivateMsg(message: string, user_id: number) {
  return axios.get("http://localhost:5700/send_private_msg", {
    params: {
      user_id,
      message
    }
  });
}

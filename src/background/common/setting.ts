import { clone } from "ramda";

export const UA = {
  wap:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
  pc:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36"
};

export const config = {
  isSubmitOrder: true,
  interval_submit: 0,
  delay_submit: 1200,
  delay_all: 40,
  qq: 870092104,
  is_main: false,
  accept_messages: true,
  keywords: []
};

export function get_config() {
  return clone(config);
}

export function set_config(_conf) {
  Object.assign(config, clone(_conf));
  localStorage.setItem("config", JSON.stringify(config));
}

export const accounts = {
  jingdong: {
    username: "",
    password: "",
    paypass: ""
  },
  taobao: {
    username: "",
    password: "",
    paypass: ""
  }
};

export function get_accounts() {
  return clone(accounts);
}

export function set_accounts(_conf) {
  Object.assign(accounts, clone(_conf));
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

export const DT = {
  taobao: 0,
  jingdong: 0
};

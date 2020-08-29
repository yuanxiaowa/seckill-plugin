import { request } from "../common/request";

async function requestData(params: {
  url: string;
  data?: any;
  method?: "get" | "post";
}) {
  var { data, errno, errmsg } = await request(
    // @ts-ignore
    Object.assign(params, {
      dataType: "form",
      headers: {
        _cookie:
          "BAIDUCUID=C6A33CF8ACBE7B3792BCE48CC99C755B2A789FABCFMFHPGLIID; BDUSS=JXTmdGRWZvRE9XT3JOLXFmbHRrWmhOaHZkRW9iSFNrUUlRSFU5dEdIOTdrNWhkSVFBQUFBJCQAAAAAAAAAAAEAAAAuNYEKeXVhbnhpYW93YQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHsGcV17BnFdTD; H_OAP_SIDS=10006002; BAIDUID=AE99098C6BACDC522EE1BE1A386AFB64:FG=1",
      },
    })
  );
  if (errno !== 0) {
    throw new Error(errmsg);
  }
  return data;
}

export const card_tasks = [
  {
    title: "领卡",
    async list() {
      var { userInfo } = await requestData({
        url:
          "https://activity.baidu.com/activity/card/index?shareToken=&idfrom=jhy&a=JTdCJTIyY2hhbm5lbF9pZCUyMiUzQSUyMjEwOTlhJTIyJTJDJTIybW9kZWwlMjIlM0ElMjJpUGhvbmUlMjA3JTIwcGx1cyUyMCUzQ2lQaG9uZTklMkMyJTNFJTIyJTJDJTIyYnJhbmQlMjIlM0ElMjJpUGhvbmUlMjIlMkMlMjJvc192ZXJzaW9uJTIyJTNBJTIyMTMuMyUyMiU3RA%3D%3D&issmart=1&appid=17769955&zid=fzFC1YgNVo1yDEwSl2G1BCly3vUzNn91wlPNHvv_uY4mbwZ_DizQFwIJN6NpE0L5omekoINwFOkBLxIzETIIyog&smartversion=1.0.3&version=11.18.0.16&sdkVersion=3.140.13&t=1579245993&source=baiduboxapp&platform=1&thirdZid=",
      });
      return [...userInfo.drawNum];
    },
    async doTask() {
      await requestData({
        url: "https://activity.baidu.com/activity/card/draw",
        data: {
          a:
            "JTdCJTIyY2hhbm5lbF9pZCUyMiUzQSUyMjEwOTlhJTIyJTJDJTIybW9kZWwlMjIlM0ElMjJpUGhvbmUlMjA3JTIwcGx1cyUyMCUzQ2lQaG9uZTklMkMyJTNFJTIyJTJDJTIyYnJhbmQlMjIlM0ElMjJpUGhvbmUlMjIlMkMlMjJvc192ZXJzaW9uJTIyJTNBJTIyMTMuMyUyMiU3RA==",
          issmart: "1",
          appid: "17769955",
          zid:
            "fzFC1YgNVo1yDEwSl2G1BCly3vUzNn91wlPNHvv_uY4mbwZ_DizQFwIJN6NpE0L5omekoINwFOkBLxIzETIIyog",
          smartversion: "1.0.3",
          version: "11.18.0.16",
          sdkVersion: "3.140.13",
          t: "1579245965",
          source: "baiduboxapp",
          platform: "1",
          sign: "dc8f9f8ace44c9a5cf061c9d8ac256ec",
          thirdZid: "",
        },
        method: "post",
      });
    },
  },
  {
    title: "任务",
    async list() {
      var { taskList } = await requestData({
        url:
          "https://activity.baidu.com/activity/card/TaskList?al=1,0,0,0,1,0,1,1,0,0,0&pv=9&a=JTdCJTIyY2hhbm5lbF9pZCUyMiUzQSUyMjEwOTlhJTIyJTJDJTIybW9kZWwlMjIlM0ElMjJpUGhvbmUlMjA3JTIwcGx1cyUyMCUzQ2lQaG9uZTklMkMyJTNFJTIyJTJDJTIyYnJhbmQlMjIlM0ElMjJpUGhvbmUlMjIlMkMlMjJvc192ZXJzaW9uJTIyJTNBJTIyMTMuMyUyMiU3RA%3D%3D&issmart=1&appid=17769955&zid=fzFC1YgNVo1yDEwSl2G1BCly3vUzNn91wlPNHvv_uY4mbwZ_DizQFwIJN6NpE0L5omekoINwFOkBLxIzETIIyog&smartversion=1.0.3&version=11.18.0.16&sdkVersion=3.140.13&t=1579246014&source=baiduboxapp&platform=1",
      });
      return taskList
        .filter((task) => task.status === 0)
        .map((item) => {
          var handler;
          if (item.taskId === "612") {
            handler = () =>
              request.post(
                "http://swan-api.iqiyi.com/swan/baidutask/finish212_t?token=e0ed66dcbfa1570ad0c25fb9fd87404d61a8e7ef0504fe79333affa2d5"
              );
          }
          return Object.assign(item, {
            handler,
          });
        });
    },
    async doTask({ taskId, handler }) {
      await requestData({
        url: "https://activity.baidu.com/activity/card/TaskRegister",
        data: {
          taskId,
          a:
            "JTdCJTIyY2hhbm5lbF9pZCUyMiUzQSUyMjEwOTlhJTIyJTJDJTIybW9kZWwlMjIlM0ElMjJpUGhvbmUlMjA3JTIwcGx1cyUyMCUzQ2lQaG9uZTklMkMyJTNFJTIyJTJDJTIyYnJhbmQlMjIlM0ElMjJpUGhvbmUlMjIlMkMlMjJvc192ZXJzaW9uJTIyJTNBJTIyMTMuMyUyMiU3RA==",
          issmart: "1",
          appid: "17769955",
          zid:
            "fzFC1YgNVo1yDEwSl2G1BCly3vUzNn91wlPNHvv_uY4mbwZ_DizQFwIJN6NpE0L5omekoINwFOkBLxIzETIIyog",
          smartversion: "1.0.3",
          version: "11.18.0.16",
          sdkVersion: "3.140.13",
          t: "1579249805",
          source: "baiduboxapp",
          platform: "1",
          thirdZid: "",
        },
        method: "post",
      });
      if (handler) {
        await handler();
      }
    },
  },
];

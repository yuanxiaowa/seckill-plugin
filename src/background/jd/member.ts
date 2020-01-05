import { request, isRedirectedUrl } from "../common/request";

export async function isLoginMobile() {
  var { retcode } = await request.jsonp(
    `https://wq.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&_=${Date.now()}&sceneval=2&g_login_type=1&callback=GetJDUserInfoUnion&g_ty=ls`,
    {
      referer: "https://home.m.jd.com/myJd/newhome.action"
    }
  );
  return retcode === 0;
}

export function loginMobile() {
  window.open(
    "https://plogin.m.jd.com/cgi-bin/m/qqlogin?appid=300&returnurl=https%3A%2F%2Fwqlogin1.jd.com%2Fpassport%2FLoginRedirect%3Fstate%3D814378955%26returnurl%3D%252F%252Fhome.m.jd.com%252FmyJd%252Fnewhome.action%253Fsceneval%253D2%2526ufc%253D%2526&source=wq_passport&risk_jd[eid]=TNNEVY6UM2645G3OEU4WPA5OIB7A4MZSUPXMQVREJQ2P5IZKD5RUIEF7AXO6RA5W5SMDN3LPMAPSKAOKQWLD4ADVGU&risk_jd[fp]=dba9c5bd2179493db69f975d63bb78e5"
  );
}

export async function isLoginPc() {
  return !(await isRedirectedUrl("https://home.jd.com/"));
}

export function loginPc() {
  window.open(
    "https://qq.jd.com/new/qq/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F"
  );
}

var mobile_logined = false;
export function checkStatusMobile() {
  isLoginMobile().then(b => {
    console.log("m", b);
    if (!b) {
      loginMobile();
    }
  });
}
var pc_logined = false;
export function checkStatusPc() {
  isLoginPc().then(b => {
    console.log("p", b);
    if (!b) {
      loginPc();
    }
  });
}

export function checkStatus() {
  checkStatusPc();
  checkStatusMobile();
}

export async function getMyCoupons() {
  var text = await request.get(
    "https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=3&wxadd=1&_=1566400385806&sceneval=2&g_login_type=1&callback=queryjdcouponcb3&g_ty=ls",
    {
      referer:
        "https://wqs.jd.com/my/coupon/index.shtml?ptag=7155.1.18&sceneval=2"
    }
  );
  var text2 = /\(([\s\S]*)\);/.exec(text)![1];
  var {
    coupon: { useable }
  } = JSON.parse(text2);
  return useable.map(item =>
    Object.assign(
      {
        title: item.couponTitle,
        params: {
          couponbatch: item.batchid,
          ptag: "37070.3.11",
          coupon_shopid: item.shopId
        }
      },
      item
    )
  );
}

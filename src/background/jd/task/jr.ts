import { requestJr } from "./tools";

var other = {
  riskDeviceParam: JSON.stringify({
    deviceType: "iPhone 7 Plus (A1661/A1785/A1786)",
    traceIp: "",
    macAddress: "02:00:00:00:00:00",
    imei: "7B4C588C-8371-4F85-B91D-F015D8C88E90",
    os: "iOS",
    osVersion: "13.3",
    fp: "03b9a11b84573b6cc2b42eacf8bd9c8f",
    ip: "172.16.91.146",
    eid:
      "XPYRQKYPRDZOXAAHSFNAICGWZ2SZUFGXSHY7A76H3BFL7PEZE5EZD6NCYGADCBSQKA4M7LFAXP7QX444SEC7PTRO3Q",
    appId: "com.jd.jinrong",
    openUUID: "9d6039ba9a88469d7733658d45e3dae4df03af46",
    uuid: "",
    clientVersion: "5.3.20",
    resolution: "736*414",
    channelInfo: "appstore",
    networkType: "WIFI",
    startNo: 212,
    openid: "",
    token: "",
    sid: "",
    terminalType: "02",
    longtitude: "",
    latitude: "",
    securityData: "",
    jscContent: "",
    fnHttpHead: "",
    receiveRequestTime: "",
    port: "",
    appType: 1,
    optType: "",
    idfv: "",
    wifiSSID: "",
    wifiMacAddress: "",
    cellIpAddress: "",
    wifiIpAddress: "",
    sdkToken:
      "R5TSGES7F5NKSQZLSGAUJEPWO4DX5CHEAFEVBVFIBPB5JEQY74KYOSGHEMIHFSX255OCZWUQGABVO"
  })
};

export async function signInJr() {
  var {
    resultData: { resBusiMsg, resBusiCode }
  } = await requestJr(
    `https://ms.jr.jd.com/gw/generic/gry/h5/m/signIn`,
    Object.assign(
      {
        channelSource: "JRAPP"
      },
      other
    )
  );
  if (!(resBusiCode === 0 || resBusiCode === 15)) {
    throw new Error(resBusiMsg);
  }
}

export function getSignAwardJR() {
  return requestJr(
    `https://nu.jr.jd.com/gw/generic/jrm/h5/m/process`,
    Object.assign(
      {
        actCode: "FBBFEC496C",
        type: 4
      },
      other
    )
  );
}

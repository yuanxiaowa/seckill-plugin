import { delay } from "./common/tool";

export async function getWindow() {
  return new Promise<chrome.windows.Window>(resolve => {
    chrome.windows.create(
      {
        left: -300,
        top: 1000,
        width: 300,
        height: 100,
        type: "popup"
      },
      window => {
        window!.alwaysOnTop = false;
        resolve(window);
      }
    );
  });
}

export async function getTab(): Promise<chrome.tabs.Tab> {
  let win = await getWindow();
  return new Promise(resolve => {
    chrome.tabs.create(
      {
        windowId: win.id,
        active: false
      },
      resolve
    );
  });
}

export function destroyTab(tabId: number) {
  chrome.tabs.remove(tabId);
}

export async function excutePageAction<T = any>(
  url: string,
  {
    code
  }: {
    code: string;
  }
) {
  var tab = await getTab();
  var tabId = tab.id!;
  return new Promise<T>(resolve => {
    var listener = async (
      details: chrome.webNavigation.WebNavigationCallbackDetails
    ) => {
      chrome.webNavigation.onCompleted.removeListener(listener);
      await delay(800);
      chrome.tabs.executeScript(
        tabId,
        {
          code
        },
        ([data]) => {
          resolve(data);
          setTimeout(() => {
            chrome.tabs.remove(tabId);
          }, 1000);
        }
      );
    };
    chrome.webNavigation.onCompleted.addListener(listener);
    // chrome.webRequest.onCompleted.removeListener()
    chrome.tabs.update({
      url: url
    });
  });
}

export async function excuteRequestAction<T = any>(
  url: string,
  {
    code,
    test,
    urls,
    autoclose = true
  }: {
    code: string;
    test: (url: string) => boolean;
    urls: string[];
    autoclose?: boolean;
  }
) {
  var tab = await getTab();
  var tabId = tab.id!;
  return new Promise<T>(resolve => {
    var listener = async (
      details: chrome.webRequest.WebResponseCacheDetails
    ) => {
      if (test(details.url)) {
        chrome.webRequest.onCompleted.removeListener(listener);
        await delay(800);
        chrome.tabs.executeScript(
          tabId,
          {
            code
          },
          ([data]) => {
            resolve(data);
            if (autoclose) {
              setTimeout(() => {
                chrome.tabs.remove(tabId);
              }, 1000);
            }
          }
        );
      }
    };
    chrome.webRequest.onCompleted.addListener(listener, {
      urls,
      tabId
    });
    // chrome.webRequest.onCompleted.removeListener()
    chrome.tabs.update({
      url: url
    });
  });
}

export class ChromePage {
  tabId: number;
  constructor(public tab: chrome.tabs.Tab) {
    this.tabId = tab.id!;
  }
  goto(url: string) {
    return new Promise<void>(resolve => {
      var listener = async (
        details: chrome.webNavigation.WebNavigationCallbackDetails
      ) => {
        chrome.webNavigation.onCompleted.removeListener(listener);
        resolve();
      };
      chrome.webNavigation.onCompleted.addListener(listener);
      // chrome.webRequest.onCompleted.removeListener()
      chrome.tabs.update({
        url
      });
    });
  }
  evaluate(fn: string | Function, ...args: any[]) {
    var args_str = args.map(arg => JSON.stringify(arg)).join(",");
    var code = typeof fn !== "string" ? `(${fn.toString()})(${args_str})` : fn;
    return new Promise(resolve => {
      chrome.tabs.executeScript(
        this.tabId,
        {
          code
        },
        resolve
      );
    });
  }
  waitForResponse(filter: (url: string) => boolean) {
    return new Promise(resolve => {
      var listener = async (
        details: chrome.webRequest.WebResponseCacheDetails
      ) => {
        if (filter(details.url)) {
          resolve();
          chrome.webRequest.onCompleted.removeListener(listener);
        }
      };
      chrome.webRequest.onCompleted.addListener(listener, {
        urls: ["*://*/*"],
        tabId: this.tabId
      });
    });
  }
  waitForResponseBody(filter: (url: string) => boolean) {
    return new Promise(resolve => {
      chrome.debugger.attach(
        {
          tabId: this.tabId
        },
        "1.0",
        () => {
          chrome.debugger.sendCommand(
            {
              //first enable the Network
              tabId: this.tabId
            },
            "Network.enable"
          );
          chrome.debugger.onEvent.addListener(
            (debuggee, message, params: any) => {
              if (message === "Network.responseReceived") {
                if (!filter(params.response.url)) {
                  return;
                }
                chrome.debugger.sendCommand(
                  {
                    tabId: this.tabId
                  },
                  "Network.getResponseBody",
                  {
                    requestId: params.requestId
                  },
                  ({ base64Encoded, body }: any) => {
                    resolve(body);
                    chrome.debugger.detach(debuggee);
                  }
                );
              }
            }
          );
        }
      );

      // var listener = async (
      //   details: chrome.webRequest.WebResponseCacheDetails
      // ) => {
      //   if (filter(details.url)) {
      //     resolve();
      //     chrome.webRequest.onCompleted.removeListener(listener);
      //   }
      // };
      // chrome.webRequest.onCompleted.addListener(listener, {
      //   urls: ["*://*/*"],
      //   tabId: this.tabId
      // });
    });
  }
  waitForNavigation() {
    return new Promise<void>(resolve => {
      var listener = async (
        details: chrome.webNavigation.WebNavigationCallbackDetails
      ) => {
        chrome.webNavigation.onCompleted.removeListener(listener);
        resolve();
      };
      chrome.webNavigation.onCompleted.addListener(listener);
    });
  }
  close() {
    chrome.tabs.remove(this.tabId);
  }
}

export async function newPage() {
  var tab = await getTab();
  return new ChromePage(tab);
}

/* newPage().then(async page => {
  await page.goto("https://www.baidu.com");
  page.waitForResponseBody(url => url.startsWith("https://dss3.bdstatic.com/"));
}); */

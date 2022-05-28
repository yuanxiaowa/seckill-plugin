import { EventEmitter } from "events";
import { delay } from "./common/tool";

type EventMap = {
  requestCompleted: [chrome.webRequest.WebResponseCacheDetails];
  navigationCompleted: [
    chrome.webNavigation.WebNavigationFramedCallbackDetails
  ];
  navigationRepaced: [chrome.webNavigation.WebNavigationFramedCallbackDetails];
  DOMContentLoaded: [chrome.webNavigation.WebNavigationFramedCallbackDetails];
  request: [any];
};

type EmitType = <T extends keyof EventMap>(
  name: T,
  ...args: EventMap[T]
) => boolean;
type ListenerType<RetType = void> = <T extends keyof EventMap>(
  name: T,
  listener: (...args: EventMap[T]) => void
) => RetType;

export class ChromePage {
  private pending = true;

  private bus = new EventEmitter();

  constructor(
    public tab: chrome.tabs.Tab,
    public win?: chrome.windows.Window,
    public is_default = false,
    public autoclose = true
  ) {
    this.init();
  }

  init() {
    chrome.webRequest.onCompleted.addListener(
      (details) => {
        if (details.tabId !== this.tab.id) {
          return;
        }
        this.emit("requestCompleted", details);
      },
      {
        urls: ["*://*/*"],
        tabId: this.tab.id,
      }
    );
    chrome.webNavigation.onCompleted.addListener((details) => {
      if (details.tabId !== this.tab.id) {
        return;
      }
      this.emit("navigationCompleted", details);
    });
    chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
      if (details.tabId !== this.tab.id) {
        return;
      }
      this.emit("DOMContentLoaded", details);
    });
  }
  t = 0;
  setRequestInterception(arg0: boolean) {
    throw new Error("Method not implemented.");
  }
  waitForSelector(selector: string) {
    return this.evaluate((selector) => {
      return new Promise<void>((resolve) => {
        function check() {
          if (document.querySelector<HTMLElement>(selector)) {
            resolve();
          }
          setTimeout(check, 60);
        }
        check();
      });
    }, selector);
  }
  click(selector: string) {
    return this.evaluate((selector) => {
      document.querySelector<HTMLElement>(selector)!.click();
    }, selector);
  }
  reload() {
    return new Promise<void>((resolve) =>
      chrome.tabs.reload(this.tab.id!, {}, resolve)
    );
  }
  resetTimer() {
    clearTimeout(this.t);
    if (this.autoclose) {
      // @ts-ignore
      this.t = setTimeout(() => {
        this.close();
      }, 1000 * 60 * 10);
    }
  }
  set url(url: string) {
    chrome.tabs.update(this.id, {
      url,
    });
    this.resetTimer();
  }
  get id() {
    return this.tab.id!;
  }

  emit = this.bus.emit.bind(this.bus) as EmitType;

  on = ((name, listener) => {
    this.bus.on(name, listener as any);
    return () => {
      this.bus.off(name, listener as any);
    };
  }) as ListenerType<() => void>;

  once = ((name, listener) => {
    this.bus.once(name, listener as any);
    return () => {
      this.bus.off(name, listener as any);
    };
  }) as ListenerType<() => void>;

  off = this.bus.off.bind(this.bus) as ListenerType;

  goto(url: string) {
    this.url = url;
    return this.waitForNavigation();
  }

  evaluate<T extends any[] = []>(
    fn: string | ((...args: T) => any),
    ...args: T
  ) {
    var args_str = args.map((arg) => JSON.stringify(arg)).join(",");
    var code = typeof fn !== "string" ? `(${fn.toString()})(${args_str})` : fn;
    return this.executeScript(code, true);
  }

  waitForResponse(filter: (url: string, method: string) => boolean) {
    return new Promise<void>((resolve) => {
      const destroyFn = this.on("requestCompleted", (details) => {
        if (details.tabId === this.id && filter(details.url, details.method)) {
          destroyFn();
          resolve();
        }
      });
    });
  }
  waitForNavigation() {
    return new Promise<chrome.webNavigation.WebNavigationFramedCallbackDetails>(
      (resolve) => {
        const destroyFn = this.on("navigationCompleted", (details) => {
          if (details.tabId === this.id && details.frameId === 0) {
            destroyFn();
            resolve(details);
          }
        });
      }
    );
  }
  waitForResponseBody(filter: (url: string) => boolean) {
    return new Promise((resolve) => {
      chrome.debugger.attach(
        {
          tabId: this.id,
        },
        "1.0",
        () => {
          chrome.debugger.sendCommand(
            {
              //first enable the Network
              tabId: this.id,
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
                    tabId: this.id,
                  },
                  "Network.getResponseBody",
                  {
                    requestId: params.requestId,
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

  executeScript(code: string, shared = false) {
    return new Promise<any>((resolve) => {
      if (shared) {
        code = `const _script = document.createElement('script');
        _script.textContent=\`${code.replace(/(`|\\|\$\{)/g, '\\$1')}\`;
        document.body.appendChild(_script);
        console.log(_script);
        `
      }
      chrome.tabs.executeScript(
        this.id,
        {
          code,
          runAt: "document_end",
        },
        ([data]) => {
          resolve(data);
        }
      );
    });
  }
  close() {
    clearTimeout(this.t);
    if (this.is_default) {
      this.pending = false;
      this.autoclose = true;
      return;
    }
    return new Promise((resolve) => chrome.tabs.remove(this.id, resolve));
  }

  private static default_page?: ChromePage;
  private static events_inited = false;
  private static initEvents() {
    if (ChromePage.events_inited) {
      return;
    }
    ChromePage.events_inited = true;
    chrome.tabs.onRemoved.addListener((tabId) => {
      if (ChromePage.default_page) {
        if (tabId === ChromePage.default_page.id) {
          ChromePage.default_page.close();
          ChromePage.default_page = undefined;
        }
      }
    });
  }
  static async create(url?: string) {
    ChromePage.initEvents();
    if (ChromePage.default_page) {
      if (!ChromePage.default_page.pending) {
        ChromePage.default_page.pending = true;
        if (url) {
          await ChromePage.default_page.goto(url);
        }
        return ChromePage.default_page;
      }
    } else {
      let tab = await ChromePage.createTab(url);
      let page = new ChromePage(tab, undefined, true);
      ChromePage.default_page = page;
      return page;
    }
    // let win = await ChromePage.createWindow();
    let tab = await ChromePage.createTab(url /* , win.id */);
    return new ChromePage(tab /* , win */);
  }
  static createTab(url?: string, windowId?: number) {
    return new Promise<chrome.tabs.Tab>((resolve) => {
      chrome.tabs.create(
        {
          windowId,
          active: false,
          url,
        },
        resolve
      );
    });
  }
  static createWindow() {
    return new Promise<chrome.windows.Window>((resolve) => {
      chrome.windows.create(
        {
          left: -300,
          top: 1000,
          width: 300,
          height: 100,
          type: "popup",
        },
        (window) => {
          window!.alwaysOnTop = false;
          resolve(window!);
        }
      );
    });
  }
}

export async function excutePageAction<T = any>(
  url: string,
  {
    code,
    autoclose = true,
    close_delay = 1000,
    run_delay = 0,
  }: {
    code: string;
    autoclose?: boolean;
    close_delay?: number;
    run_delay?: number;
  }
) {
  var page = await ChromePage.create(url);
  await delay(800 + run_delay);
  var data = await page.executeScript(code);
  if (autoclose) {
    setTimeout(() => {
      page.close();
    }, close_delay);
  }
  return data;
}

export async function excuteRequestAction<T = any>(
  url: string,
  {
    code,
    test,
    urls,
    autoclose = true,
  }: {
    code: string | Function;
    test: (url: string) => boolean;
    urls: string[];
    autoclose?: boolean;
  }
) {
  var page = await ChromePage.create();
  var getted = false;
  const injectCode =
    typeof code === "function" ? `(${code.toString()})()` : code;
  return new Promise<T>((resolve) => {
    const destroyFn = page.on(
      "requestCompleted",
      async (details: chrome.webRequest.WebResponseCacheDetails) => {
        if (test(details.url)) {
          if (getted) {
            return;
          }
          getted = true;
          destroyFn();
          await delay(800);
          let data = page.executeScript(injectCode);
          resolve(data);
          if (autoclose) {
            setTimeout(() => {
              page.close();
            }, 3000);
          }
        }
      }
    );
    page.url = url;
  });
}

export function newPage(url?: string) {
  return ChromePage.create(url);
}

// @ts-ignore
window.newPage = newPage;

/* newPage().then(async page => {
  await page.goto("https://www.baidu.com");
  page.waitForResponseBody(url => url.startsWith("https://dss3.bdstatic.com/"));
}); */

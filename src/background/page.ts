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
      window => resolve(window)
    );
  });
}

export async function getTab(): Promise<chrome.tabs.Tab> {
  let win = await getWindow();
  return new Promise(resolve => {
    chrome.tabs.create(
      {
        windowId: win.id
        // active: false
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

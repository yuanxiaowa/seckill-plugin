import initCollina from "./collina";

!(function () {
  "use strict";
  var e,
    r,
    c,
    n,
    a,
    s,
    headElement = document.getElementsByTagName("head")[0];
  !window.AWSC &&
    ((c = (function () {
      if (document.currentScript) return document.currentScript;
      var e = null,
        r = document.getElementsByTagName("script"),
        c = null;
      try {
        throw Error();
      } catch (s) {
        var n,
          a = (/.*at [^\(]*\((.*):.+:.+\)$/gi.exec(s.stack) || [!1])[1];
        for (n in r)
          if ((c = r[n]).src == a || "interactive" == c.readyState)
            return (e = r[n]), r[n];
      }
      return e;
    })()),
    (n = c && c.src ? c.src.match(/https\:\/\/([^&]+).alicdn/) : [, "g"]),
    (s = ""),
    -1 === ["laz-g-cdn", "aeis", "assets"].indexOf((a = n && n[1])) &&
      (a = "g"),
    (s = "https://" + a + ".alicdn.com/"),
    "assets" === a && (s += "g/"),
    (e = s + "AWSC/AWSC/awsc.js"),
    ((r = document.createElement("script")).src = e),
    headElement.appendChild(r));
})();
export function initBaxiaCommon(window, document, _location) {
  window.baxiaCommon = (function (n) {
    "use strict";
    var o = function (n, o, e) {
      (void 0 === o && (o = 1),
      void 0 === e && (e = 1),
      0 >= e || Math.random() < e) &&
        (function (n, i) {
          var a = [];
          for (var o in n) a.push(o + "=" + encodeURIComponent(n[o]));
          new Image().src = i + a.join("&");
        })(
          {
            code: o,
            msg: n + "",
            pid: "baxia-fast",
            page: _location.href.split(/[#?]/)[0],
            query: _location.search.substr(1),
            hash: _location.hash,
            referrer: document.referrer,
            title: document.title,
            ua: navigator.userAgent,
          },
          "//gm.mmstat.com/fsp.1.1?"
        );
    };
    var e = document,
      t = window,
      r = function (n, i) {
        var a = t.__baxia__ || {};
        return n ? a[n] || i : a;
      },
      s = function (n, i) {
        (t.__baxia__ = t.__baxia__ || {}), (t.__baxia__[n] = i);
      },
      m = "1",
      d = Math.random(),
      c = ["/sd/baxia/1.1.7/baxiaCommon.js"];
    c.push("/sd/baxia/1.1.7/baxiaToken.js"),
      window.AWSC || c.push("/AWSC/AWSC/awsc.js");
    var f = _location.href || "";
    f &&
      -1 >= f.indexOf("passport.alibabacloud.com/mini_login.htm") &&
      ((m = "1"),
      (m =
        (function (n, i, a) {
          void 0 === a && (a = "&");
          var o = RegExp(i + "=([^" + a + "]+)").exec(n);
          return o && o[1] ? o[1] : null;
        })(document.cookie, "_bxjs_gray_", ";") || m),
      (c = ["/sd/baxia/1.1.13/baxiaCommon.js"]),
      window.AWSC || c.push("/AWSC/AWSC/awsc.js")),
      f &&
        (f.indexOf("ipassport.ele.me/mini_login.htm") > 0 ||
          f.indexOf("ipassport.damai.cn/mini_login.htm") > 0 ||
          f.indexOf("rupassport.cainiao.com/mini_login.htm") > 0) &&
        (c = ["/sd/baxia/1.1.20/baxiaCommon.js"]),
      (f.indexOf("auction/buy_now.jhtml") > -1 ||
        f.indexOf("order/confirm_order.htm") > -1) &&
        ((c = ["/sd/baxia/1.1.20/baxiaCommon.js"]), (m = "0.3"));
    var u =
      f.indexOf("/member/reg/fast/union_reg.htm") > -1 ||
      f.indexOf("/alimeeting/web/webvc/videomeeting-web") > -1 ||
      f.indexOf("/member/reg/fast/fast_reg.htm") > -1;
    return (
      u && (c = ["/sd/baxia/2.0.5/baxiaCommon.js"]),
      "placeholder" in document.createElement("input") &&
        parseFloat(m) > d &&
        (function (n, i, a) {
          if (!n) return i();
          var t = e.getElementsByTagName("script")[0],
            r = e.createElement("script");
          if (
            ((r.async = !0),
            (r.src = n),
            n.indexOf("alicdn") > -1 && (r.crossOrigin = !0),
            (r.onerror = function (i) {
              o(
                "function:loadJS. msg:" +
                  n +
                  "load error。props：" +
                  JSON.stringify(a)
              ),
                (r.onerror = null);
            }),
            i)
          ) {
            var s = !1;
            r.onload = r.onreadystatechange = function () {
              s ||
                (r.readyState && !/loaded|complete/.test(r.readyState)) ||
                ((r.onload = r.onreadystatechange = null), (s = !0), i());
            };
          }
          t.parentNode.insertBefore(r, t);
        })("https://g.alicdn.com/??" + c.join(","), function () {
          if (window.baxiaCommon) {
            if (u && !r("options")) return;
            window.baxiaCommon.init(r("options"));
          }
        }),
      (n.init = function (n) {
        s("options", n), o("init", 11);
      }),
      (n.initNC = function (n) {
        (n.type = "token"), s("options", n), o("init", 11);
      }),
      n
    );
  })({});
}

export function initAWSC(window, document, _location) {
  var r = 1e4,
    g_moduleConfig = {
      uabModule: {
        grey: ["AWSC/uab/1.137.1/collina.js"],
        stable: ["AWSC/uab/1.137.1/collina.js"],
        greyBr: ["AWSC-br/uab/1.137.1/collina.js"],
        stableBr: ["AWSC-br/uab/1.137.1/collina.js"],
        ratio: 10000,
        greyConfig: {},
        stableConfig: {},
      },
      nsModule: {
        grey: ["js/nc/60.js"],
        stable: ["js/nc/60.js"],
        ratio: 1e4,
        greyConfig: {},
        stableConfig: {},
      },
      umidPCModule: {
        grey: ["AWSC/WebUMID/1.85.0/um.js"],
        stable: ["AWSC/WebUMID/1.85.0/um.js"],
        greyBr: ["AWSC-br/WebUMID/1.85.0/um.js"],
        stableBr: ["AWSC-br/WebUMID/1.85.0/um.js"],
        ratio: 10000,
        greyConfig: {},
        stableConfig: {},
      },
      etModule: {
        grey: ["AWSC/et/1.62.0/et_f.js", "AWSC/et/1.62.1/et_n.js"],
        stable: ["AWSC/et/1.62.0/et_f.js", "AWSC/et/1.62.1/et_n.js"],
        greyBr: ["AWSC-br/et/1.62.0/et_f.js", "AWSC-br/et/1.62.1/et_n.js"],
        stableBr: ["AWSC-br/et/1.62.0/et_f.js", "AWSC-br/et/1.62.1/et_n.js"],
        ratio: 10000,
        greyConfig: {
          whitelist: [
            "login.taobao.com/member/login.jhtml",
            "passport.alibaba.com/mini_login.htm",
            "login.taobao.com/member/loginByIm.do",
            "login.taobao.com/member/login_by_safe.htm",
            "login.taobao.com/member/vst.htm",
            "login.taobao.com/member/facebookLogin.do",
            "login.m.taobao.com/login.htm",
            "login.m.taobao.com/sendMsg.do",
            "login.m.taobao.com/msg_login.htm",
            "login.m.taobao.com/login_oversea.htm",
            "login.m.taobao.com/login_oversea_phone.htm",
            "login.m.taobao.com/newlogin/login.do",
            "login.m.taobao.com/newlogin/account/check.do",
            "login.m.taobao.com/newlogin/sms/send.do",
            "login.m.taobao.com/newlogin/sms/login.do",
            "buy.taobao.com/auction/buy_now.jhtml",
            "buy.taobao.com/auction/order/confirm_order.html",
            "buy.tmall.com/order/confirm_order.html",
            "buyertrade.taobao.com/trade/itemlist/list_bought_items.htm",
            "member1.taobao.com/member/fresh/account_security.htm",
            "member1.taobao.com/member/fresh/account_management.htm",
            "member1.taobao.com/member/fresh/weibo_bind_management.htm",
            "member1.taobao.com/member/fresh/deliver_address.htm",
            "h5.m.taobao.com/mlapp/olist.html",
            "h5.m.taobao.com/mlapp/odetail.html",
            "main.m.taobao.com/olist/index.html",
            "main.m.taobao.com/odetail/index.html",
            "h5.m.taobao.com/app/hongbao/www/detail/index.html",
            "market.m.taobao.com/app/dinamic/h5-tb-olist/index.html",
            "market.m.taobao.com/app/dinamic/h5-tb-odetail/index.html",
            "market.m.taobao.com/app/mtb/evaluation-list/pages/index2",
            "h5.m.taobao.com/qn/mobile/delivery.html",
            "h5.m.taobao.com/mlapp/odetail.html",
            "main.m.taobao.com/order/index.html",
            "buy.m.tmall.com/order/confirmOrderWap.htm",
            "h5.m.taobao.com/cart/order.html",
            "h5.m.tmall.hk/cart/order.html",
          ],
        },
        stableConfig: {
          whitelist: [
            "login.taobao.com/member/login.jhtml",
            "passport.alibaba.com/mini_login.htm",
            "login.taobao.com/member/loginByIm.do",
            "login.taobao.com/member/login_by_safe.htm",
            "login.taobao.com/member/vst.htm",
            "login.taobao.com/member/facebookLogin.do",
            "login.m.taobao.com/login.htm",
            "login.m.taobao.com/sendMsg.do",
            "login.m.taobao.com/msg_login.htm",
            "login.m.taobao.com/login_oversea.htm",
            "login.m.taobao.com/login_oversea_phone.htm",
            "login.m.taobao.com/newlogin/login.do",
            "login.m.taobao.com/newlogin/account/check.do",
            "login.m.taobao.com/newlogin/sms/send.do",
            "login.m.taobao.com/newlogin/sms/login.do",
            "buy.taobao.com/auction/buy_now.jhtml",
            "buy.taobao.com/auction/order/confirm_order.html",
            "buy.tmall.com/order/confirm_order.html",
            "buyertrade.taobao.com/trade/itemlist/list_bought_items.htm",
            "member1.taobao.com/member/fresh/account_security.htm",
            "member1.taobao.com/member/fresh/account_management.htm",
            "member1.taobao.com/member/fresh/weibo_bind_management.htm",
            "member1.taobao.com/member/fresh/deliver_address.htm",
            "h5.m.taobao.com/mlapp/olist.html",
            "h5.m.taobao.com/mlapp/odetail.html",
            "main.m.taobao.com/olist/index.html",
            "main.m.taobao.com/odetail/index.html",
            "h5.m.taobao.com/app/hongbao/www/detail/index.html",
            "market.m.taobao.com/app/dinamic/h5-tb-olist/index.html",
            "market.m.taobao.com/app/dinamic/h5-tb-odetail/index.html",
            "market.m.taobao.com/app/mtb/evaluation-list/pages/index2",
            "h5.m.taobao.com/qn/mobile/delivery.html",
            "h5.m.taobao.com/mlapp/odetail.html",
            "main.m.taobao.com/order/index.html",
            "buy.m.tmall.com/order/confirmOrderWap.htm",
            "h5.m.taobao.com/cart/order.html",
            "h5.m.tmall.hk/cart/order.html",
          ],
        },
      },
      ncModule: {
        grey: ["AWSC/nc/1.67.0/nc.js"],
        stable: ["AWSC/nc/1.66.0/nc.js"],
        ratio: 1,
        greyConfig: {},
        stableConfig: {},
      },
    },
    s = [
      {
        name: "umidPCModule",
        features: ["umpc", "um", "umh5"],
        depends: [],
        sync: !1,
      },
      {
        name: "uabModule",
        features: ["uab"],
        depends: [],
        sync: !1,
      },
      {
        name: "nsModule",
        features: ["ns"],
        depends: [],
        sync: !1,
      },
      {
        name: "etModule",
        features: ["et"],
        depends: [],
        sync: !1,
      },
      {
        name: "ncModule",
        features: ["nc", "nvc", "ic"],
        depends: ["uab", "um"],
        sync: !1,
      },
    ],
    c = navigator.userAgent,
    b = c.match(/Chrome\/(\d*)/);
  b && (b = +b[1]);
  var p = c.match(/Edge\/([\d]*)/),
    h = c.match(/Safari\/([\d]*)/),
    A = c.match(/Firefox\/([\d]*)/),
    v = c.match(/MSIE|Trident/);
  function y() {
    var t = "function%20javaEnabled%28%29%20%7B%20%5Bnative%20code%5D%20%7D";
    return "WebkitAppearance" in document.documentElement.style &&
      escape(navigator.javaEnabled.toString()) === t
      ? !0
      : !1;
  }
  function S(a, s) {
    var c = "AWSC_SPECIFY_" + a.toUpperCase() + "_ADDRESSES";
    if (window[c]) return window[c];
    var S = {
      normalAddresses: [],
      brAddresses: [],
    };
    for (var j in g_moduleConfig)
      if (g_moduleConfig.hasOwnProperty(j) && j === a) {
        var moduleConfig = g_moduleConfig[j],
          W = Math.ceil(Math.random() * r) <= moduleConfig.ratio;
        (S.normalAddresses = W
          ? moduleConfig.grey.slice()
          : moduleConfig.stable.slice()),
          moduleConfig.stableBr &&
            moduleConfig.greyBr &&
            (S.brAddresses = W
              ? moduleConfig.greyBr.slice()
              : moduleConfig.stableBr.slice()),
          "etModule" === a &&
            (p
              ? (S.normalAddresses.pop(), S.brAddresses.pop())
              : b
              ? (S.normalAddresses.pop(), S.brAddresses.pop())
              : h || A || v
              ? (S.normalAddresses.shift(), S.brAddresses.shift())
              : y()
              ? (S.normalAddresses.pop(), S.brAddresses.pop())
              : (S.normalAddresses.shift(), S.brAddresses.shift()));
        for (var w = 0; w < S.normalAddresses.length; w++) {
          var k = s ? "https://" + s + "/" : I;
          "https://assets.alicdn.com/" === k && (k += "g/"),
            (S.normalAddresses[w] = k + S.normalAddresses[w]),
            S.brAddresses[w] && (S.brAddresses[w] = k + S.brAddresses[w]);
        }
        return S;
      }
  }
  var j = [],
    W = "loading",
    w = "loaded",
    k = "timeout",
    M = "unexpected",
    T = "no such feature",
    B = new RegExp(
      "^([\\w\\d+.-]+:)?(?://(?:([^/?#@]*)@)?([\\w\\d\\-\\u0100-\\uffff.+%]*|\\[[^\\]]+\\])(?::([0-9]+))?)?([^?#]+)?(\\?[^#]*)?(#.*)?$"
    ),
    I = E(x());
  function E(t) {
    var a = "https://g.alicdn.com/";
    if (!t) return a;
    if (/aliexpress/.test(_location.href)) return "https://aeis.alicdn.com/";
    var r = B.exec(t);
    return r ? "https://" + r[3] + (r[4] ? ":" + r[4] : "") + "/" : a;
  }
  function x() {
    for (
      var t = document.getElementsByTagName("script"), i = 0;
      i < t.length;
      i++
    ) {
      var a = t[i],
        r = a.hasAttribute ? a.src : a.getAttribute("src", 4);
      if (/\/awsc\.js/.test(r)) return r;
    }
  }
  function D(t) {
    for (var a = void 0, r = 0; r < s.length; r++) {
      for (var c = s[r], b = 0; b < c.features.length; b++)
        if (c.features[b] === t) {
          a = c;
          break;
        }
      if (a) break;
    }
    return a;
  }
  function U(t) {
    for (var i = 0; i < j.length; i++) {
      var item = j[i];
      if (item.name === t) return item;
    }
  }
  function O(t) {
    for (var a = void 0, r = 0; r < s.length; r++) {
      var c = s[r];
      if (c.name === t) {
        a = c;
        break;
      }
      if (a) break;
    }
    return a;
  }
  function F(t, r, s) {
    if (s)
      for (var c = 0; c < t.normalAddresses.length; c++) {
        var b = t.normalAddresses[c];
        document.write("<script src=" + b + "></script>");
      }
    else {
      function p(t, s, c) {
        for (var b = 0; b < t.length; b++) {
          var p = t[b],
            h = document.createElement("script");
          (h.async = !1),
            (h.src = p),
            (h.id = r),
            (h.onerror = s || function () {}),
            (h.onload = c || function () {});
          var m = document.getElementsByTagName("script")[0];
          m && m.parentNode
            ? m.parentNode.insertBefore(h, m)
            : ((m = document.body || document.head), m && m.appendChild(h));
        }
      }
      p(t.normalAddresses);
    }
  }
  function R(a, r, s) {
    var c =
        "https://acjs.aliyun.com/error?v=" +
        a +
        "&e=" +
        encodeURIComponent(r) +
        "&stack=" +
        encodeURIComponent(s),
      b = new Image(),
      p = "_awsc_img_" + Math.floor(1e6 * Math.random());
    (window[p] = b),
      (b.onload = b.onerror = function () {
        try {
          delete window[p];
        } catch (e) {
          window[p] = null;
        }
      }),
      (b.src = c);
  }
  function Y(t, a) {
    Math.random() < 1e-4 &&
      R(
        "awsc_state",
        "feature=" +
          t.name +
          "&state=" +
          t.state +
          "&href=" +
          encodeURIComponent(_location.href)
      );
    for (var r = void 0; (r = t.callbacks.shift()); )
      try {
        if ("function" == typeof r) r(t.state, t.exportObj);
        else if ("object" == typeof r) {
          var s = t.exportObj;
          s && "function" == typeof s.init && s.init(r);
        }
      } catch (e) {
        if (a) throw e;
        R(t.name, e.message, e.stack);
      }
  }
  function N(t, a, r, s) {
    var c = D(t);
    if (!c) return "function" == typeof a && a(T), void 0;
    var b = r && r.cdn,
      p = r && r.sync,
      h = (r && r.timeout) || 5e3;
    if (0 !== c.depends.length)
      for (var A = 0; A < c.depends.length; A++) {
        var v = c.depends[A];
        r && (delete r.sync, delete r.timeout, delete r.cdn),
          useFacotry(v, void 0, r);
      }
    var y = s || {};
    (y.module = c),
      (y.name = t),
      (y.state = W),
      (y.callbacks = y.callbacks || []),
      (y.options = r),
      a && y.callbacks.push(a),
      (y.timeoutTimer = setTimeout(function () {
        (y.state = k), Y(y, r && r.throwExceptionInCallback);
      }, h)),
      s || j.push(y);
    var w = c.sync;
    p && (w = p);
    var M = S(c.name, b);
    F(M, "AWSC_" + c.name, w);
  }
  function useFacotry(t, a, r) {
    var s = U(t);
    if (s)
      if (s.state === k) N(t, a, r, s);
      else if (s.state === w) {
        if ("function" == typeof a) a(s.state, s.exportObj);
        else if ("object" == typeof a) {
          var c = s.exportObj;
          c && "function" == typeof c.init && c.init(a);
        }
      } else s.state === W ? a && s.callbacks.push(a) : void 0;
    else N(t, a, r);
  }
  function L(t, a, r) {
    var s = !1;
    try {
      var c = O(t);
      c || void 0, (c.moduleLoadStatus = w);
      for (var b = void 0, p = 0; p < j.length; p++) {
        var h = j[p];
        h.module === c &&
          h.name === a &&
          ((s = h.options && h.options.throwExceptionInCallback),
          (b = h),
          clearTimeout(b.timeoutTimer),
          delete b.timeoutTimer,
          (b.exportObj = r),
          h.state === W || h.state === k ? ((b.state = w), Y(b, s)) : void 0);
      }
      b ||
        ((b = {}),
        (b.module = c),
        (b.name = a),
        (b.state = w),
        (b.exportObj = r),
        (b.callbacks = []),
        j.push(b));
    } catch (e) {
      if (s) throw e;
      R("awsc_error", e.message, e.stack);
    }
  }
  function $(window) {
    (window.AWSCFY = function () {}),
      (window.AWSC.configFY = function (t, r, s, c) {
        return a(t, r, s, c);
      }),
      (window.AWSC.configFYSync = function (t, r) {
        return a(null, t, r);
      });
    function a(a, r, s, c) {
      var b = _location.protocol + "//" + _location.host + _location.pathname,
        p = new window.AWSCFY();
      window._umopt_npfp = 0;
      var h = !1;
      (p.umidToken =
        "defaultToken1_um_not_loaded@@" + b + "@@" + new Date().getTime()),
        window.AWSC.use("um", function (t, a) {
          "loaded" === t
            ? ((p.umidToken =
                "defaultToken3_init_callback_not_called@@" +
                b +
                "@@" +
                new Date().getTime()),
              a.init(r, function (t, a) {
                "success" === t
                  ? (p.umidToken = a.tn)
                  : (p.umidToken =
                      "defaultToken4_init_failed with " +
                      t +
                      "@@" +
                      b +
                      "@@" +
                      new Date().getTime()),
                  (h = !0),
                  y();
              }))
            : ((p.umidToken =
                "defaultToken2_load_failed with " +
                t +
                "@@" +
                b +
                "@@" +
                new Date().getTime()),
              (h = !0),
              y());
        });
      var A = !1;
      if (
        ((p.getUA = function () {
          return (
            "defaultUA1_uab_not_loaded@@" + b + "@@" + new Date().getTime()
          );
        }),
        window.AWSC.use("uab", function (t, a) {
          (A = !0),
            "loaded" === t
              ? ((p.uabModule = a),
                (p.uabConfig = s),
                (p.getUA = function () {
                  return this.uabModule.getUA(this.uabConfig);
                }))
              : (p.getUA = function () {
                  return (
                    "defaultUA2_load_failed with " +
                    t +
                    "@@" +
                    b +
                    "@@" +
                    new Date().getTime()
                  );
                }),
            y();
        }),
        null != a)
      )
        var v = window.setTimeout(
          function () {
            y(!0);
          },
          c ? c : 2e3
        );
      function y(r) {
        null != a && ((A && h) || r) && (a(p), window.clearTimeout(v));
      }
      return null == a ? p : void 0;
    }
  }
  function q(window) {
    var moduleConfig = g_moduleConfig.etModule,
      a = Math.ceil(Math.random() * r) <= moduleConfig.ratio,
      s = a
        ? moduleConfig.greyConfig.whitelist
        : moduleConfig.stableConfig.whitelist,
      c = new RegExp(("^" + s.join("$|^") + "$").replace(/\*/g, ".*"));
    c.test(_location.host + _location.pathname) &&
      ((window.etrprtrt = 0.01), window.AWSC.use("et"));
  }
  function z(window) {
    (window.AWSC = {}),
      (window.AWSC.use = useFacotry),
      (window.AWSCInner = {}),
      (window.AWSCInner.register = L),
      $(window),
      q(window);
    return window.AWSC;
  }
  return z(window);
}

export default function init(url) {
  const urlObj = new URL(url);
  initCollina(window, document, urlObj);
  initBaxiaCommon(window, document, urlObj);
  const AWSC = initAWSC(window, document, urlObj);
  return new Promise((resolve) => {
    AWSC.configFY(
      data => {
        resolve(data)
      },
      {
        appName: "tbtrade",
      },
      {},
      1
    );
  });
}

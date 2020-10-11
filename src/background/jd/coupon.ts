import { CouponHandler } from "@/structs/coupon";
import { startsWith, test } from "ramda";
import {
  getFloorCoupons,
  getJingfen,
  getGoodsCoupons,
  getQuanpinCoupon,
  getCouponZeus,
  getShopCoupons,
  getCouponSingle,
  obtainGoodsCoupon,
  getActivityCoupons,
  getFanliCoupon,
} from "./coupon-handlers";
import { excutePageAction } from "../page";

const delayHandler = (f: Function) => (...args: any[]) => () => f(...args);

export const handlers: CouponHandler[] = [
  {
    // https://wq.jd.com/webportal/event/25842?cu=true&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=4b1871b719e94013a1e77bb69fee767e&scpos=#st=460
    // https://wq.jd.com/webportal/event/25842?cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=c39350c2555145809ef3f4c05465cdf0&scpos=#st=376
    test: startsWith("https://wq.jd.com/webportal/event/"),
    api: delayHandler(getFloorCoupons),
  },
  {
    test: startsWith("https://coupon.m.jd.com/center/getCouponCenter.action"),
    page: delayHandler(async (url) => {
      await excutePageAction(url, {
        code: `Array.from(
          document.querySelectorAll<HTMLDivElement>(".coupon_btn")
        ).forEach(ele => ele.click());`,
      });
    }),
  },
  {
    test: startsWith("https://jingfen.jd.com/item.html"),
    api: delayHandler(getJingfen),
  },
  {
    test: test(
      /^https?:\/\/(item\.m\.jd.com\/product\/|item\.jd\.com\/\d+\.html|item\.m\.jd\.com\/ware\/view\.action)/
    ),
    api(url) {
      return () => getGoodsCoupons(/\d+/.exec(url)![0]);
    },
  },
  {
    // https://wqs.jd.com/event/promote/mobile8/index.shtml?ptag=17036.106.1&ad_od=4&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=e653d855fd454bfe86b29fa2bf38fdb2&scpos=#st=592
    test: startsWith("https://wqs.jd.com/event/promote"),
    api: delayHandler(getFloorCoupons),
  },
  {
    // https://pro.m.jd.com/mall/active/2fJDHSrZhhDcNKg9ahyKkbny5r4X/index.html?jd_pop=29588686-c925-471d-b9f2-49696e154408&abt=0&jd_pop=be4dd5ce-8a22-4e00-a791-b00f4c114ab6&abt=0&cu=true&cu=true&cu=true&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_2011246109_&utm_term=d1dc38952a544e00879cf4a4f4b871b6
    test: test(/^https:\/\/pro(dev)?(\.m)?\.jd\.com\/(mall|wq)\/active/),
    api: delayHandler(getActivityCoupons),
  },
  {
    test: startsWith("https://h5.m.jd.com/dev/"),
    api: delayHandler(getQuanpinCoupon),
  },
  {
    test: startsWith("https://h5.m.jd.com/babelDiy/Zeus"),
    api: delayHandler(getCouponZeus),
  },
  {
    test: startsWith("https://shop.m.jd.com/?"),
    api: delayHandler(async (url: string) => {
      var { urls, coupons } = await getShopCoupons(url);
      try {
        await Promise.all(
          urls
            .map(getCouponSingle)
            .concat(<any[]>coupons.map(obtainGoodsCoupon))
        );
        return {
          success: true,
        };
      } catch (e) {
        return e;
      }
    }),
  },
  {
    test: startsWith("https://coupon.m.jd.com/coupons/show.action"),
    api: delayHandler(getCouponSingle),
  },
  {
    test: startsWith("https://ifanli.m.jd.com/rebate/couponMiddle.html"),
    api: delayHandler(getFanliCoupon),
  },
];

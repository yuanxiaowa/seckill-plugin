import { CouponArg, CouponResult } from "./coupon";
import {
  CartListResult,
  CartAddArg,
  CartDelArg,
  CartUpdateArg,
  CartToggleArg,
} from "./cart";
import { Config } from "./base";
import {
  CoudanArg,
  ArgBuyDirect,
  ArgCartBuy,
} from "@/background/taobao/structs";
import { CommentItem } from "./comment";

export interface BaseHandler {
  setConfig(args: Config): Promise<void>;
  getConfig(): Promise<Config>;
  resolveUrl(args: { url: string }): Promise<string>;
  qiangquan(args: CouponArg): Promise<CouponResult | undefined>;
  buy(args: ArgBuyDirect): Promise<any>;
  cartBuy(arg: ArgCartBuy): Promise<any>;
  coudan(arg: CoudanArg): Promise<any>;
  getGoodsInfo(args: { url: string });
}

export interface Handler1 {
  setConfig(config: Config): Promise<void>;
  getConfig(): Promise<Config>;
  resolveUrl(url: string, platform: string): Promise<string>;
  qiangquan(
    arg: CouponArg,
    platform: string
  ): Promise<CouponResult | undefined>;
  buy(
    arg: ArgBuyDirect,
    platform: string,
    t?: string
  ): Promise<string | undefined>;
  cartBuy(
    arg: ArgCartBuy,
    platform: string,
    t?: string
  ): Promise<string | undefined>;
  cartList(platform: string): Promise<CartListResult>;
  cartAdd(arg: CartAddArg, platform: string): Promise<string | undefined>;
  cartDel(arg: CartDelArg, platform: string): Promise<string | undefined>;
  cartUpdate(arg: CartUpdateArg, platform: string): Promise<string | undefined>;
  cartToggle(arg: CartToggleArg, platform: string): Promise<string | undefined>;
  coudan(arg: CoudanArg, platform: string): Promise<string | undefined>;
  getAddresses(platform: string): Promise<AddressItem[]>;
  commentList(arg: any, platform: string): Promise<CommentItem[]>;
}

type AddExtra<T, ExtraType> = T extends (args: infer T2) => infer T3
  ? T2 extends {}
    ? (args: T2 & ExtraType) => T3
    : T
  : T;

export type Handler = {
  [key in keyof BaseHandler]: AddExtra<
    BaseHandler[key],
    {
      from_pc?: boolean;
    }
  >;
};

export type HandlerWithPlatform = {
  [key in keyof Handler]: AddExtra<
    Handler[key],
    {
      platform: "taobao" | "jingdong";
    }
  >;
};

export type HandlerWithAll = {
  [key in keyof HandlerWithPlatform]: key extends
    | "buy"
    | "cartBuy"
    | "qiangquan"
    ? AddExtra<
        HandlerWithPlatform[key],
        {
          t?: string;
        }
      >
    : HandlerWithPlatform[key];
};

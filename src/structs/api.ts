import { CouponArg, CouponResult } from "./coupon";
import {
  CartListResult,
  CartAddArg,
  CartDelArg,
  CartUpdateArg,
  CartToggleArg
} from "./cart";
import { Config } from "./base";
import {
  CoudanArg,
  ArgBuyDirect,
  ArgCartBuy
} from "@/background/taobao/structs";
import { CommentItem } from "./comment";

export interface Handler {
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

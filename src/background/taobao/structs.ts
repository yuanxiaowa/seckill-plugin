import Vue from "vue";

/*
 * @Author: oudingyin
 * @Date: 2019-07-22 08:53:50
 * @LastEditors: oudingy1in
 * @LastEditTime: 2019-08-16 10:34:23
 */
export interface ArgBuyDirect {
  url: string;
  quantity: number;
  other: any;
  expectedPrice?: number;
  skuId?: string;
  jianlou?: number;
  from_cart?: boolean;
  from_pc?: boolean;
  diejia?: number;
  ignoreRepeat?: boolean;
  no_interaction?: boolean;
  addressId?: string;
}

export interface ArgOrder<T> {
  data: T;
  other: Record<string, string>;
  expectedPrice?: number;
  noinvalid?: boolean;
  seckill?: boolean;
  jianlou?: number;
  title: string;
  qq?: string;
  bus?: Vue;
  no_interaction?: boolean;
  addressId?: string;
  referer?: string;
  autopay?: boolean;
  is_pc?: boolean;
}

export interface ArgCartBuy {
  items: any[];
  jianlou?: number;
  expectedPrice?: number;
  no_interaction?: boolean;
  addressId?: string;
  other: any;
}

export type ArgSearch = {
  name: string;
  page: number;
  keyword: string;
  start_price?: string;
  coupon_tag_id?: string;
  searchType?: "juhuasuan" | "shop" | "normal";
} & Record<string, any>;

export type CoudanArg = {
  quantities: number[];
  urls: string[];
  expectedPrice: number;
  addressId?: string;
  other: any;
};

import {
  buyDirectFromMobile,
  cartBuyFromMobile,
  coudanFromMobile,
} from "./mobile";
import { Handler } from "@/structs/api";
import { cartBuyFromPc, buyDirectFromPc } from "./pc";
import { ifElse, propEq } from "ramda";

export const buyDirect: Handler["buy"] = ifElse(
  propEq("from_pc", true),
  buyDirectFromPc,
  buyDirectFromMobile
);

export const coudan: Handler["coudan"] = function(args) {
  return coudanFromMobile(args);
};

export const cartBuy: Handler["cartBuy"] = ifElse(
  propEq("from_pc", true),
  cartBuyFromPc,
  cartBuyFromMobile
);

export function logFile(a: any, b?: any, c?: any) {}

import {
  buyDirectFromMobile,
  cartBuyFromMobile,
  coudanFromMobile,
} from "./mobile";
import { Handler } from "@/structs/api";
import { cartBuyFromPc, buyDirectFromPc } from "./pc";
import { ifElse, propIs } from "ramda";

export const buyDirect: Handler["buy"] = ifElse(
  propIs(true, "from_pc"),
  buyDirectFromPc,
  buyDirectFromMobile
);

export const coudan: Handler["coudan"] = function(args) {
  return coudanFromMobile(args);
};

export const cartBuy: Handler["cartBuy"] = ifElse(
  propIs(true, "from_pc"),
  cartBuyFromPc,
  cartBuyFromMobile
);

import {
  buyDirectFromMobile,
  cartBuyFromMobile,
  coudanFromMobile,
  deleteOrderRecordsFromMobile,
  getOrderRecordsFromMobile,
  relayOrderRecordsFromMobile,
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

export async function getOrderRecords(args) {
  return getOrderRecordsFromMobile();
}

export async function deleteOrderRecords(args) {
  return deleteOrderRecordsFromMobile(args);
}

export async function relayOrderRecords(args) {
  return relayOrderRecordsFromMobile(args);
}

export function logFile(a: any, b?: any, c?: any) {}

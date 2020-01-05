export interface CartItem {
  id: string;
}

export interface CartListResult {
  items: CartItem[];
}

export interface CartAddArg {
  url: string;
  quantity: number;
  skuId?: string;
}

export interface CartDelArg {
  items: { id: string }[];
}

export interface CartUpdateArg {
  items: { id: string; quantity: number }[];
}

export interface CartToggleArg {
  checked: boolean;
  items: string[];
}

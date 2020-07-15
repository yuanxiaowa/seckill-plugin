export interface CouponResult {
  success: boolean;
  url?: string;
  msg?: string;
  manual?: boolean;
}

export interface CouponArg {
  data: string;
}

export interface CouponHandler {
  test(url: string): boolean;
  api?(url: string): Promise<(() => Promise<CouponResult>) | CouponResult>;
  page?(url: string): Promise<(() => Promise<CouponResult>) | CouponResult>;
}

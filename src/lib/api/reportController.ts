import axios, { AxiosResponse } from "axios";
import { API_BASE_URL } from "@/config";

// --------------------------------------
// 📌 FULL TYPE STRUCTURE (Inside Controller)
// --------------------------------------

export interface RecentOrder {
  order_code: string;
  final_amount: string;
  status: string;
  order_date: string;
  payment_method: string;
}

export interface OrderSummary {
  total_orders: number;
  completed_orders: number;
  total_spent: number;
  recent_orders: RecentOrder[];
}

export interface Wallet {
  balance: number | string;
}

export interface SchemeDetails {
  scheme_id: number;
  monthly_amount: string;
  total_paid: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface Schemes {
  total_schemes: number;
  total_paid: number;
  details: SchemeDetails[];
}

export interface GoldPlanDetail {
  invested_amount: string;
  gold_grams: string;
  gold_rate: string;
  created_at: string;
}

export interface GoldPlans {
  total_invested: number;
  total_gold_grams: number;
  details: GoldPlanDetail[];
}

export interface GoldWallet {
  total_gold_grams: number | string;
  total_invested_amount: number | string;
  current_gold_rate: number | string;
}

export interface CustomOrder {
  category_id: number;
  metal: string;
  purity: string;
  weight: string;
  status: string;
  description: string;
  note: string;
  created_at: string;
}

export interface CustomOrders {
  total_custom_orders: number;
  details: CustomOrder[];
}

export interface CustomerReport {
  user_id: number;
  user_code: string | null;
  name: string;
  email: string;
  mobile: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;

  order_summary: OrderSummary;
  wallet: Wallet;
  schemes: Schemes;
  gold_plans: GoldPlans;
  gold_wallet: GoldWallet;
  custom_orders: CustomOrders;
}

export interface CustomerReportResponse {
  success: boolean;
  message: string;
  data: CustomerReport[];
}

// --------------------------------------
// 📌 API FUNCTION (Direct Base URL)
// --------------------------------------

export const getCustomerReport = async (
    token: string,
    filters?: { name?: string; email?: string; mobile?: string; user_code?: string }
  ): Promise<AxiosResponse<CustomerReportResponse>> => {
    const query = filters
      ? Object.entries(filters)
          .filter(([_, value]) => value && value.trim() !== "")
          .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
          .join("&")
      : "";
  
    const url = `${API_BASE_URL}/admin/reports/customer${query ? `?${query}` : ""}`;
  
    return axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  

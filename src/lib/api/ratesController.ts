import { API_BASE_URL } from "@/config";

export type MetalPriceData = {
  timestamp: number;
  metal: string;
  currency: string;
  exchange?: string;
  symbol?: string;
  prev_close_price?: number;
  open_price?: number;
  low_price?: number;
  high_price?: number;
  open_time?: number;
  price?: number;
  ch?: number;
  chp?: number;
  ask?: number;
  bid?: number;
  price_gram_24k?: number;
  price_gram_22k?: number;
  price_gram_21k?: number;
  price_gram_20k?: number;
  price_gram_18k?: number;
  price_gram_16k?: number;
  price_gram_14k?: number;
  price_gram_10k?: number;
};

export type MetalItem = {
  metal: string;
  symbol?: string;
  price_data: MetalPriceData;
};

export type MetalSummary = {
  metal: string;
  unit: string;
  [key: string]: number | string;
};

export type MetalsSummary = {
  Gold?: MetalSummary;
  Silver?: MetalSummary & { price?: number };
  [key: string]: MetalSummary | undefined;
};

export type GoldPriceResponse = {
  status?: boolean;
  message?: string;
  data?: MetalItem[];
  summary?: MetalsSummary;
};

export type GoldPriceResult = {
  items: MetalItem[];
  summary: MetalsSummary;
};

export async function adminGetGoldPrice(
  token: string
): Promise<GoldPriceResult> {
  const res = await fetch(`${API_BASE_URL}/admin/gold-price`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let message = "Failed to fetch metal rates";
    try {
      const json = (await res.json()) as GoldPriceResponse;
      message = json?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const json = (await res.json()) as GoldPriceResponse;
  return {
    items: json?.data || [],
    summary: json?.summary || ({} as MetalsSummary),
  };
}

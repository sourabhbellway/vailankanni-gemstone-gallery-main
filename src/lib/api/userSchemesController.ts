import axios from "axios";
import { API_BASE_URL } from "@/config";

export type UserScheme = {
  id: number;
  name: string; // maps from `scheme`
  timeline: string;
  minAmount: number; // maps from `min_amount`
  status: number; // 0/1
  isPopular: number; // 0/1
  points: string[];
  attachments: string[]; // relative paths
};

function parsePoints(points: unknown): string[] {
  if (Array.isArray(points)) return points.filter((p) => typeof p === "string") as string[];
  if (typeof points === "string") {
    try {
      const parsed = JSON.parse(points);
      return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string") : [points];
    } catch {
      return [points];
    }
  }
  return [];
}

function normalize(item: any): UserScheme {
  return {
    id: Number(item?.id),
    name: String(item?.scheme ?? item?.name ?? ""),
    timeline: String(item?.timeline ?? ""),
    minAmount: Number(item?.min_amount ?? item?.minAmount ?? 0),
    status: Number(item?.status ?? 0),
    isPopular: Number(item?.is_popular ?? item?.isPopular ?? 0),
    points: parsePoints(item?.points),
    attachments: Array.isArray(item?.attachments) ? (item.attachments as string[]) : [],
  };
}

export async function getUserSchemes(): Promise<{ success: boolean; message: string; data: UserScheme[] }>
{
  const res = await axios.get(`${API_BASE_URL}/admin/scheme`);
  const success = Boolean(res.data?.sucess ?? res.data?.success);
  const message = String(res.data?.massage ?? res.data?.message ?? "");
  const list = Array.isArray(res.data?.data) ? res.data.data.map(normalize) : [];
  return { success, message, data: list };
}


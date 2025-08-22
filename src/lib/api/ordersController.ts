import { API_BASE_URL } from "@/config";
import axios from "axios";

export const getOrders = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/admin/order/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
};
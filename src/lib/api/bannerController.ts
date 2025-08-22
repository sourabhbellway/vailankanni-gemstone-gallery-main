import axios from "axios";
import { API_BASE_URL } from "@/config";

// Types for banner API
export interface BannerPayload {
  image: string;
  title: string;
  description: string;
  position: string;
  status: boolean;
}

export interface Banner extends BannerPayload {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export const getBanners = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/banners`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    throw error;
  }
};

export const createBanner = async (token: string, banner: BannerPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/banners`, banner, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error;
  }
};

export const updateBanner = async (
  token: string,
  id: string | number,
  banner: BannerPayload
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/banners/${id}`,
      banner,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};

export const deleteBanner = async (token: string, id: string | number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/banners/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw error;
  }
};

export const getBannerById = async (token: string, id: string | number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/banners/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching banner by id:", error);
    throw error;
  }
};

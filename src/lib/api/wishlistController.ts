import axios from "axios";
import { API_BASE_URL } from "@/config";

interface AddToWishlistData {
  product_id: number;
}

interface RemoveFromWishlistData {
  wishlist_id: number;
}

export const addToWishlist = async (data: AddToWishlistData, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/wishlist/add`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getWishlistItems = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromWishlist = async (data: RemoveFromWishlistData, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/wishlist/remove`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

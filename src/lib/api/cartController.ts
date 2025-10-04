import axios from "axios";
import { API_BASE_URL } from "@/config";

interface AddToCartData {
  product_id: number;
  quantity: number;
}

interface UpdateQuantityData {
  cart_id: number;
  quantity: number;
}

interface RemoveFromCartData {
  cart_id: number;
}

export const addToCart = async (data: AddToCartData, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart/add`,
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

export const getCartItems = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCartQuantity = async (data: UpdateQuantityData, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart/update-quantity`,
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

export const removeFromCart = async (data: RemoveFromCartData, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart/remove`,
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

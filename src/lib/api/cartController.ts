import axios from "axios";
import { API_BASE_URL } from "@/config";

// Dispatch a lightweight global event so UI (e.g., Header) can refresh cart count
const emitCartUpdated = () => {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart:updated"));
    }
  } catch {
    // no-op: best-effort event
  }
};

interface AddToCartData {
  product_id: number;
  quantity: number;
  size?: string | number;
}

interface UpdateQuantityData {
  item_id: number;
  quantity: number;
}

interface RemoveFromCartData {
  item_id: number;
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
    // Notify listeners that the cart has changed
    if (response?.data) emitCartUpdated();
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
    if (response?.data) emitCartUpdated();
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
    if (response?.data) emitCartUpdated();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCouponsList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/public/coupons`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const applyCoupon = async (cartId: number, couponCode: string, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/apply/coupon`,
      { cart_id: cartId, coupon_code: couponCode },
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

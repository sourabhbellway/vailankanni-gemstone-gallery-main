import { API_BASE_URL } from "@/config";
import axios from "axios";
export const getCategories = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/admin/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const createCategory = async (
  token: string,
  payload: { name: string }
) => {
  const response = await axios.post(
    `${API_BASE_URL}/admin/categories`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

export const getCategoryById = async (token: string, id: number) => {
  const response = await axios.get(`${API_BASE_URL}/admin/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const updateCategory = async (
  token: string,
  id: number,
  payload: { name: string }
) => {
  const response = await axios.put(
    `${API_BASE_URL}/admin/categories/${id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

export const deleteCategory = async (token: string, id: number) => {
  const response = await axios.delete(
    `${API_BASE_URL}/admin/categories/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

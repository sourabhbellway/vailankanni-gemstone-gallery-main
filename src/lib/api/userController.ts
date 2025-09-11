import axios from "axios";
import { API_BASE_URL } from "@/config";

interface UserData {
  name: string;
  email: string;
  mobile: string;
}

export const registerUser = async (userData: UserData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/register`,
      userData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

interface RegisterOtpVerificationBody {
  mobile: string;
  otp: string;
}

export const verifyRegisterOtp = async (
  payload: RegisterOtpVerificationBody
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/register-verify-otp`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

interface LoginInitiateBody {
  name: string;
  mobile: string;
}

export const loginInitiate = async (payload: LoginInitiateBody) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/login`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

interface LoginOtpVerificationBody {
  user_id: number;
  otp: string;
}

export const verifyLoginOtp = async (payload: LoginOtpVerificationBody) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/verify-otp`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/getProfile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
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

import axios from "axios";
import { API_BASE_URL } from "@/config";

export const saveDeviceToken = async (fcmToken: string, userToken: string) => {
  return axios.post(
    `${API_BASE_URL}/device-token`,
    { token: fcmToken, platform: "web" },
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
};

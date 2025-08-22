// During development, we go through the Vite proxy to avoid CORS
export const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "/api"
    : "https://vailankanni-backend.cybenkotechnologies.in/api";

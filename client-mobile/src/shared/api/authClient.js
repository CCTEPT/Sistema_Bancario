import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import { getStoredToken, setStoredToken } from "./httpClient";
import API_CONFIG from "../config/apiConfig";

const axiosAuth = axios.create({
  baseURL: ENDPOINTS.AUTH_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT, // 30s desde config
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosRegister = axios.create({
  baseURL: ENDPOINTS.AUTH_URL,
  timeout: API_CONFIG.LONG_REQUEST_TIMEOUT, // 60s para uploads
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Request interceptor to add token
axiosAuth.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const toFormData = (data) => {
  // If already a FormData (e.g., created in a screen), detect by presence of append()
  if (data && typeof data.append === "function") {
    return data;
  }

  const formData = new FormData();

  const mapping = (key) => {
    // Map common client keys to backend PascalCase expected keys
    const map = {
      name: "Name",
      surname: "Surname",
      username: "Username",
      email: "Email",
      password: "Password",
      phone: "Phone",
      role: "RoleName",
      roleName: "RoleName",
    };
    return map[key] || key;
  };

  Object.entries(data || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(mapping(key), value);
    }
  });

  return formData;
};

// Response interceptor to clear invalid token on 401
axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      await setStoredToken(null);
    }
    return Promise.reject(error);
  },
);

const MANAGEABLE_ROLES = ["ADMIN_ROLE", "EMPLOYEE_ROLE", "USER_ROLE"];

// Auth functions
export const login = async (data) => {
  const response = await axiosAuth.post("/Auth/login", data);
  return response.data;
};

export const createUser = async (data) => {
  // Accept either an object or a FormData instance created by the screen
  const payload = toFormData(data);

  const response = await axiosAuth.post("/Auth/register", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const register = createUser;

export const verifyEmail = async (token) => {
  const response = await axiosAuth.post("/Auth/verify-email", { token });
  return response.data;
};

export const forgotPassword = async (email) => {
  // backend expects PascalCase 'Email'
  const payload =
    typeof email === "string"
      ? { Email: email }
      : { Email: email?.email || email?.Email };
  const response = await axiosAuth.post("/Auth/forgot-password", payload);
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axiosAuth.post("/Auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};

export const getAllUsers = async () => {
  const results = await Promise.allSettled(
    MANAGEABLE_ROLES.map((roleName) =>
      axiosAuth.get(`/User/by-role/${roleName}`),
    ),
  );

  const fulfilled = results.filter((result) => result.status === "fulfilled");
  if (fulfilled.length === 0) {
    const firstError = results.find(
      (result) => result.status === "rejected",
    )?.reason;
    throw firstError;
  }

  const users = fulfilled.flatMap((result) => {
    const data = result.value.data;
    return Array.isArray(data) ? data : data?.users || [];
  });

  return { users };
};

export const getProfile = async () => {
  const { data } = await axiosAuth.get("/Auth/profile");
  return data;
};

export const updateUserRole = async (userId, roleName) => {
  const { data } = await axiosAuth.patch(`/User/${userId}/role`, { roleName });
  return data;
};

export const updateUserStatus = async (userId, status) => {
  const { data } = await axiosAuth.patch(`/User/${userId}/status`, { status });
  return data;
};

export const getUserRoles = async (userId) => {
  const { data } = await axiosAuth.get(`/User/${userId}/roles`);
  return { users: data };
};

export const getUsersByRole = async (roleName) => {
  const { data } = await axiosAuth.get(`/User/by-role/${roleName}`);
  return { users: data };
};

export const getUserProfile = async () => {
  const { data } = await axiosAuth.get("/Auth/profile");
  return data;
};

export const updateProfile = async (formData) => {
  const response = await axiosAuth.patch("/Auth/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export { axiosAuth, axiosRegister };

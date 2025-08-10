import axios from "axios";
import type { User } from "./types";
const API_URL = "http://localhost:8000/api";

export const login = async (user: User) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: user.email,
      password: user.password,
    });
    localStorage.setItem("insta_token", response.data.access_token);
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
};

export const checkLogin = async () => {
  const token = localStorage.getItem("insta_token");
  if (!token) {
    return {
      success: false,
      error: "No token found",
    };
  }
  try {
    const response = await axios.get(`${API_URL}/auth/check-login`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return {
      success: true,
      user: response.data as {
        logged_in: boolean;
        email: string;
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
};

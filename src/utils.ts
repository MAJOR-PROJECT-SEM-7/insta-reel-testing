import axios from "axios";
import type {
  APIResponse,
  CreateTestEntry,
  OneTestDetailedEntry,
  OneTestEntry,
  User,
} from "./types";
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

export const checkAuthenticity = async (
  insta_reel: string
): Promise<{
  success: boolean;
  data?: APIResponse;
  error?: string;
}> => {
  try {
    const response = await axios.post(`${API_URL}/checkAuthenticity`, {
      url: insta_reel,
      log: "True",
    });
    return {
      success: true,
      data: response.data as APIResponse,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
};

export const createTestEntry = async (
  entry: CreateTestEntry
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const token = localStorage.getItem("insta_token");
    await axios.post(
      `${API_URL}/entries/create`,
      {
        insta_reel_id: entry.insta_reel_id,
        feedback: entry.feedback,
        worthy: entry.worthy,
        response: entry.response,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Unknown error",
    };
  }
};

export const getTestEntries = async (): Promise<{
  success: boolean;
  data?: OneTestEntry[];
  error?: string;
}> => {
  try {
    const response = await axios.get(`${API_URL}/entries/get`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("insta_token")}`,
      },
    });
    return {
      success: true,
      data: response.data.entries as OneTestEntry[],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
};

export const getTestEntry = async (
  test_id: string
): Promise<{
  success: boolean;
  data?: OneTestDetailedEntry;
  error?: string;
}> => {
  try {
    const response = await axios.get(`${API_URL}/entries/get/${test_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("insta_token")}`,
      },
    });
    return {
      success: true,
      data: response.data as OneTestDetailedEntry,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response.data.message,
    };
  }
};

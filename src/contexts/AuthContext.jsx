import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const markFreshLogin = () => {
    try {
      sessionStorage.setItem("vital_fresh_login", "1");
    } catch {}
  };

  // Fetch current profile on mount or token change
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/auth-api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Refresh access token using refresh token
  const refreshAuthTokens = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      logout();
      throw new Error("No refresh token found");
    }

    const response = await fetch("/auth-api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!response.ok) {
      logout();
      throw new Error("Failed to refresh tokens");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.token;
  };

  // Standard email/password login
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch("/auth-api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.errors?.message || data?.message || "Đăng nhập thất bại");
      }

      localStorage.setItem("token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      setUser(data.user);
      markFreshLogin();
      // Notify app that a fresh login just happened
      try {
        window.dispatchEvent(new Event("auth-just-logged-in"));
      } catch {}
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Standard sign up
  const signup = async (username, email, password, fullName) => {
    setError(null);
    try {
      const response = await fetch("/auth-api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          full_name: fullName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.errors?.message || data?.message || "Đăng ký thất bại");
      }

      localStorage.setItem("token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      setUser(data.user);
      markFreshLogin();
      // Notify app that a fresh signup just happened (treat like login)
      try {
        window.dispatchEvent(new Event("auth-just-logged-in"));
      } catch {}
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Google Sign-In
  const googleLogin = async (googleIdToken) => {
    setError(null);
    try {
      const response = await fetch("/auth-api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: googleIdToken }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.errors?.message || data?.message || "Đăng nhập bằng Google thất bại");
      }

      localStorage.setItem("token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      setUser(data.user);
      markFreshLogin();
      // Notify app that a fresh Google login just happened
      try {
        window.dispatchEvent(new Event("auth-just-logged-in"));
      } catch {}
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    googleLogin,
    logout,
    refreshAuthTokens,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

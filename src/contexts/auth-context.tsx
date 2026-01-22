"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "~/trpc/react";

interface User {
  id: string;
  email: string;
  username: string;
  imageUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_token", newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  // Fetch user info when token changes
  const { data: currentUser, isLoading: isLoadingUser, error } =
    api.auth.getCurrentUser.useQuery(undefined, {
      enabled: !!token,
      retry: false,
    });

  // Handle error - invalid token
  useEffect(() => {
    if (error) {
      // Invalid token, clear it
      logout();
    }
  }, [error]);

  useEffect(() => {
    if (currentUser) {
      setUser({
        id: currentUser.id,
        email: currentUser.email,
        username: currentUser.username,
        imageUrl: currentUser.imageUrl,
      });
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: isLoading || isLoadingUser,
        login,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

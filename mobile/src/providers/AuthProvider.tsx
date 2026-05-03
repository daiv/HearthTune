import { AuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { AuthContextData } from "@/types/types";
import React from "react";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { login, createAccount, userId } = useAuth();
  const contextValue: AuthContextData = {
    userId, login, createAccount
  }
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>

}
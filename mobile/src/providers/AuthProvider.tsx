import { AuthPayload } from "@/common/types";
import { AuthContext } from "@/contexts/AuthContext";
import { setAuthToken } from "@/graphql/client";
import { loginService } from "@/services/authService";
import { AuthContextData } from "@/types/types";
import React, { useCallback, useEffect, useState } from "react";


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [tokens, setTokens] = useState<AuthPayload>();

  useEffect(() => {
    setAuthToken(tokens || null);
  }, [tokens]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await loginService(email, password);
      console.log('data received is', data);
      setTokens({ ...data });
      return data;
    } catch (error) {
      console.error('error', error);
      throw error;
    }

  }, []);

  const contextValue: AuthContextData = {
    login, tokens
  }
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>

}
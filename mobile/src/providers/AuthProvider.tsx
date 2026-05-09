import { AuthContext } from "@/contexts/AuthContext";
import { AuthContextData } from "@/types/types";
import React, { useCallback, useState } from "react";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [userId, setUserId] = useState<string>('mockUser');

  const login = useCallback(async (email: string, pwd: string) => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log('login resolved');
        resolve();
      }, 5000);
    });
  }, []);
  const createAccount = useCallback(async (email: string, pwd: string) => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log('createAccount resolved');
        resolve();
      }, 5000);
    });
  }, []);


  const contextValue: AuthContextData = {
    userId, login, createAccount
  }
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>

}
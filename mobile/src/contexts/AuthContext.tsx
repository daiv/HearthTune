import { AuthContextData } from "@/types/types";
import { createContext, useContext } from "react";

export const AuthContext = createContext<AuthContextData | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === null)
    throw new Error('useAuthContext must be used within a AuthProvider');
  return context;
}
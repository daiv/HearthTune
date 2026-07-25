import { AuthPayload } from "@/common/types";
import { AuthContext } from "@/contexts/AuthContext";
import { gqlManager } from "@/graphql/GraphQLClientManager";
import { loginService, refreshService } from "@/services/authService";
import { getDeviceIdSecure, getRefreshSecure, saveDeviceIdSecure, saveRefreshSecure } from "@/services/secureStorageService";
import { AuthContextData } from "@/types/types";
import React, { useCallback, useEffect, useState } from "react";
import uuid from 'react-native-uuid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [tokens, setTokens] = useState<AuthPayload>();
  const [deviceId, setDeviceId] = useState<string>();

  useEffect(() => {

    const initDevice = async () => {
      try {
        const storedId = await getDeviceIdSecure();
        if (storedId) {
          setDeviceId(storedId);
        } else {
          const newId = uuid.v4();
          setDeviceId(newId);
          await saveDeviceIdSecure(newId);
        }
      } catch (error) {
        console.error('error getting device id', error);
      }
    };

    initDevice();
  }, []);

  useEffect(function initializeGraphQlClient() {
    const tokenRefreshWithStorage = async (refreshToken: string) => {
      const tokens = await refreshService(refreshToken);
      if (tokens)
        await saveRefreshSecure(tokens.refreshToken);
      gqlManager.setAuthToken(tokens, deviceId);
      setTokens(tokens);
      return tokens;
    }
    gqlManager.setTokenRefreshHandler(tokenRefreshWithStorage);

  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    const loadStoredTokens = async () => {
      try {
        const refreshToken: string | null = await getRefreshSecure();
        if (!refreshToken) return;
        console.log('got tokens from safeStorage, getting new session');
        const tokens: AuthPayload = await refreshService(refreshToken);
        setTokens(tokens);
      } catch (error) {
        console.error('error retrieving tokens', error);
      }
    }
    loadStoredTokens();
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    gqlManager.setAuthToken(tokens || null, deviceId);
  }, [tokens, deviceId]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data: AuthPayload = await loginService(email, password);
      console.log('data received is', data);
      setTokens(data);
      await saveRefreshSecure(data.refreshToken);
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
import { AuthPayload } from "@/common/types";
import { AuthContext } from "@/contexts/AuthContext";
import { gqlManager } from "@/graphql/GraphQLClientManager";
import { loginService, logoutService, refreshService } from "@/services/authService";
import { secureStorage } from "@/services/SecureStorage";
import { AuthContextData } from "@/types/types";
import React, { useCallback, useEffect, useState } from "react";
import uuid from 'react-native-uuid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [tokens, setTokens] = useState<AuthPayload | null>(null);
  const [deviceId, setDeviceId] = useState<string>();
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const isAuthenticated = !!tokens;
  useEffect(function loadDeviceId() {
    const initDevice = async () => {
      try {
        const storedId = await secureStorage.getDeviceId();
        if (storedId) {
          setDeviceId(storedId);
        } else {
          const newId = uuid.v4();
          setDeviceId(newId);
          await secureStorage.saveDeviceId(newId);
        }
      } catch (error) {
        console.error('error getting device id', error);
      }
    };
    initDevice();
  }, []);


  const handleSaveTokens = useCallback(async (tokens: AuthPayload | null): Promise<boolean> => {
    try {
      if (!tokens) throw new Error();
      await secureStorage.saveRefreshToken(tokens.refreshToken);
      setTokens(tokens);
      return !!tokens;
    } catch (error) {
      await secureStorage.deleteRefreshToken();

      setTokens(null);
      return false;
    }
  }, []);

  const handleTokenRefresh = useCallback(async (refreshToken: string): Promise<AuthPayload> => {
    try {
      const tokens = await refreshService(refreshToken);
      await handleSaveTokens(tokens);
      return tokens;
    } catch (error) {
      handleSaveTokens(null);
      throw error;
    }
  }, [refreshService, handleSaveTokens]);

  useEffect(function initializeGraphQlClient() {
    gqlManager.setTokenRefreshHandler(handleTokenRefresh);
  }, [handleTokenRefresh]);

  useEffect(function loadStoredTokensWhenDeviceIdIsReady() {
    if (!deviceId) return;
    const loadStoredTokens = async () => {
      try {

        const refreshToken: string | null = await secureStorage.getRefreshToken();
        if (!refreshToken) return;
        await handleTokenRefresh(refreshToken);
      } catch (error) {
        console.error('error loading tokens');
      } finally {
        setIsInitializing(false);
      }
    }
    loadStoredTokens();
  }, [deviceId, handleTokenRefresh]);

  useEffect(() => {
    if (!deviceId) return;
    gqlManager.setAuthToken(tokens, deviceId);
  }, [tokens, deviceId]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      if (!deviceId) throw new Error('Missing deviceId');
      const tokens: AuthPayload = await loginService(email, password, deviceId);
      await handleSaveTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }, [deviceId, handleSaveTokens]);
  const logout = useCallback(async (): Promise<boolean> => {
    if (!tokens) return false;
    const isLogoutSuccessful = await logoutService(tokens?.refreshToken);
    if (isLogoutSuccessful) {
      handleSaveTokens(null);
      return true;
    }
    else {
      console.error('unable to logout, try again later');
      return false;
    }
  }, [tokens, handleSaveTokens, logoutService]);

  const contextValue: AuthContextData = {
    login, tokens, isAuthenticated, isInitializing, logout
  }
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>

}
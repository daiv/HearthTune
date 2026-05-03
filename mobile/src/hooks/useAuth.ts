import { useCallback, useState } from "react";

export function useAuth() {
  const [userId, setUserId] = useState<string>('');

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

  return { userId, login, createAccount };
}
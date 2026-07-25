import { useAuthContext } from "@/contexts/AuthContext";
import { Navigation } from '@/navigation/Navigation';
import { Login } from "./Login";

export function Router() {
  const { tokens } = useAuthContext();
  return <>
    {
      tokens ? <Navigation />
        : <Login />
    }
  </>

}
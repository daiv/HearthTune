import { useAuthContext } from "@/contexts/AuthContext";
import { Navigation } from '@/navigation/Navigation';
import { AuthGateway } from "./AuthGateway";

export function Router() {
  const { userId } = useAuthContext();
  return <>
    {
      userId ? <Navigation />
        : <AuthGateway />
    }
  </>

}
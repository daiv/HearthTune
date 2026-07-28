import { PlayListContextData } from "@/types/types";
import { PlayerContext } from "@/contexts/PlayerContext";
import { usePlayerManager } from "@/hooks/usePlayerManager";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect } from "react";

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const player = usePlayerManager();
  const { isAuthenticated, isInitializing } = useAuthContext();

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) player.resetQueue();
  }, [player, isAuthenticated]);
  return (
    <PlayerContext.Provider value={player as PlayListContextData}>
      {children}
    </PlayerContext.Provider>
  )
};
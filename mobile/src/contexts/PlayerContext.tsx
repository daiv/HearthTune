
import { PlayListContextData } from "@/types/types";
import { createContext, useContext, } from "react";

export const PlayerContext = createContext<PlayListContextData | null>(null);

export const usePlayListContext = () => {
  const context = useContext(PlayerContext);
  if (context === null)
    throw new Error('usePlayListContext must be used whithin a PlayListProvider');
  return context;
};


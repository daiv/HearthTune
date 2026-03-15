import Player from "@/components/Player";
import { PlayListProvider } from "@/context/PlayListContext";

export function Main() {

  return <PlayListProvider>
    <Player />
  </PlayListProvider>
}
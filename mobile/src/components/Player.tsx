import { View } from "react-native";
import TrackPlayer from "react-native-track-player";
import { useEffect, useState } from "react";
import { PlayList } from "./PlayList";
import { SearchBar } from "./searchBar";
import { Controls } from "./controls/Controls";

export default function Player() {
  useEffect(() => { TrackPlayer.reset() }, []);
  const [showPlayList, setShowPlayList] = useState(false);

  return (
    <View style={{ backgroundColor: "pink", flex: 1, }}>
      {showPlayList ?
        <PlayList />
        :
        <SearchBar />
      }
      <Controls />
    </View>
  )
}
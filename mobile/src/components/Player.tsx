import { View } from "react-native";
import SearchBar from "./searchBar/SearchBar";
import Controls from "./Controls/Controls";
import PlayList from "./PlayList/PlayList";
import TrackPlayer from "react-native-track-player";
import { useEffect, useState } from "react";

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
      <Controls setPlayListVisibility={setShowPlayList} />
    </View>
  )
}
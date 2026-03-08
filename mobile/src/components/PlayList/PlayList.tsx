import usePlayList from "@/hooks/usePlayList";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function PlayList() {

  const { playList, syncSongs } = usePlayList();
  useEffect(syncSongs, []);
  return <View style={{ flex: 1 }}>
    <Text>PlayList</Text>
    {playList.map(song => {
      return <Text>{song.title}</Text>
    })}
  </View>
}
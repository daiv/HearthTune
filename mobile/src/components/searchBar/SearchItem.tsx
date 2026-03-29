import { Song } from "@/common/types";
import { memo } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import { usePlayListContext } from "@/context/PlayListContext";

export const SearchItem = memo(({ song }: { song: Song }) => {

  const durationInSecs = song.duration;
  const mins = Math.floor(durationInSecs / 60);
  const secsRem = durationInSecs % 60;
  const hours = Math.floor(mins / 60);
  const minsRem = mins % 60;
  const localString = song.local ? 'true' : 'false';
  const { addSong } = usePlayListContext();

  const handleItemPress = () => {
    Alert.alert('Add song', `Do you want to add \n${song.title} \n to current playlist?`,
      [{
        text: 'Cancel',
        onPress: () => { console.log('canceled') }
      },
      {
        text: 'Ok',
        // onPress: () => TrackPlayer.add({ mediaId: song.title, title: song.title, url: PLAYER_URL + song.id })
        onPress: () => addSong(song)
      }
      ]
    );
  }
  const finalDuration =
    (hours == 0 ? "" :
      (hours < 10 ? ("0" + hours) : ("" + hours)) + ":") +
    (minsRem < 10 ? ("0" + minsRem) : minsRem) + ":" +
    (secsRem < 10 ? ("0" + secsRem) : secsRem);

  return (
    <TouchableOpacity style={styles.searchItem}
      onPress={handleItemPress}>
      <View >
        <Text>id is{song.id}</Text>
        <Text>{song.title}</Text>
        <Text>local is {localString}</Text>
        <Text>{finalDuration}</Text>
        <Text></Text>
      </View>
    </TouchableOpacity>
  );
});
import { View } from "react-native";

import { styles } from "./styles";

import { PlayButton, LikeButton, SkipButton } from "../buttons";
import { SongTitle } from "../SongTitle";
import { SongProgressBar } from "../SongProgressBar";


export function Controls() {

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <LikeButton />
        <SongTitle />
      </View>
      <SongProgressBar />
      <View style={[styles.controlPanel]}>
        <SkipButton to='prev' />
        <PlayButton />
        <SkipButton to='next' />
      </View >
    </View>
  )
}


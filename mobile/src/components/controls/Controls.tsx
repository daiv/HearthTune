import { View } from "react-native";

import { styles } from "./styles";

import { PlayButton, LikeButton, SkipButton } from "../buttons";
import { SongTitle } from "../SongTitle";
import { SongProgressBar } from "../SongProgressBar";
import { RepeatButton } from "../buttons/RepeatButton";


export function Controls() {

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <LikeButton />
        <SongTitle />
      </View>
      <SongProgressBar />
      <View style={[styles.controlPanel]}>
        <SkipButton to='Prev' />
        <PlayButton />
        <RepeatButton />
        <SkipButton to='Next' />
      </View >
    </View>
  )
}


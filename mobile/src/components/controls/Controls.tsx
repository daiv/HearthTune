import { View } from "react-native";

import { styles } from "./styles";
import SongProgressBar from "../SongProgressBar";
import { PlayButton, SkiptoNextButton, SkiptoPrevButton } from "../buttons"
import { SongTitle } from "../SongTitle";

export function Controls() {

  return (
    <View>
      <SongTitle />
      <SongProgressBar />
      <View style={[styles.controlPanel]}>
        <SkiptoPrevButton />
        <PlayButton />
        <SkiptoNextButton />
      </View >
    </View>
  )
}


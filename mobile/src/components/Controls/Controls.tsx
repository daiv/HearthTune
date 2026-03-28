import { StyleProp, Text, View, ViewStyle } from "react-native";

import { globalStyles } from "../../globalStyles";
import { styles } from "./styles";
import SongProgressBar from "../SongProgressBar";
import { PlayButton, SkiptoNextButton, SkiptoPrevButton, TogglePlayListButton } from "../buttons"
import { SongTitle } from "../SongTitle";

export default function Controls(
  { style, setPlayListVisibility }:
    {
      style?: StyleProp<ViewStyle>,
      setPlayListVisibility: React.Dispatch<React.SetStateAction<boolean>>
    }) {

  return (
    <>
      <SongTitle />
      <SongProgressBar />
      <View style={[globalStyles.mainContainer, styles.controlPanel, style]}>
        <SkiptoPrevButton />
        <PlayButton />
        <SkiptoNextButton />
        <TogglePlayListButton setPlayListVisibility={setPlayListVisibility} />
      </View >
    </>
  )
}


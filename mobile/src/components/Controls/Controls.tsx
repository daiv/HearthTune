import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PlayButton from "../PlayButton";
import { globalStyles } from "../../globalStyles";
import AntDesign from '@expo/vector-icons/AntDesign';
import { styles } from "./styles";
import TrackPlayer, { useProgress } from "react-native-track-player";
import SongProgressBar from "../SongProgressBar";

export default function Controls({ style, setPlayListVisibility }: { style?: StyleProp<ViewStyle>, setPlayListVisibility: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <>
      <SongProgressBar />
      <View style={[globalStyles.mainContainer, styles.controlPanel, style]}>
        <TouchableOpacity
          onPress={() => TrackPlayer.skipToPrevious()}>
          <FontAwesome name="step-backward" size={54} color="black" />
        </TouchableOpacity>

        <PlayButton />

        <TouchableOpacity
          onPress={() => TrackPlayer.skipToNext()}>
          <FontAwesome name="step-forward" size={54} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPlayListVisibility(visible => !visible)}>
          <AntDesign name="ordered-list" size={24} color="black" />
        </TouchableOpacity>
      </View >
    </>
  )
}


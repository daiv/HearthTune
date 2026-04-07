import { TouchableOpacity, View } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { PlayListControlProps } from "@/types/types";
export function PlayListControls({ showPanel, enqueueRelatedSong, savePlayList }: PlayListControlProps) {

  const margin = 10;
  const size = 24;
  return <View style={{ flexDirection: 'row' }}>
    {showPanel && <>
      <TouchableOpacity
        onPress={() => enqueueRelatedSong()}
        style={{ margin }}
      >
        <SimpleLineIcons name="magic-wand" size={size} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => savePlayList()}
        style={{ margin }}
      >
        <Entypo name="save" size={size} color="black" />
      </TouchableOpacity>
    </>
    }
  </View >
}
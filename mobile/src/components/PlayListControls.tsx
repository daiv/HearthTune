import { Alert, TouchableOpacity, View } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { PlayListControlButton, PlayListControlProps } from "@/types/types";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const margin = 10;
const size = 24;

export function PlayListControls({ showPanel, enqueueRelatedSong, savePlayList, resetQueue }: PlayListControlProps) {

  const buttons: PlayListControlButton[] = [
    {
      view: <SimpleLineIcons name="magic-wand" size={size} color="black" />,
      onPress: enqueueRelatedSong,
    },

    {
      view: <Entypo name="save" size={size} color="black" />,
      onPress: savePlayList
    },

    {
      view: <FontAwesome name="trash" size={24} color="black" />,
      onPress: () => {
        Alert.alert('Remove current playList', 'Are you sure?',
          [{
            text: 'Cancel',
            onPress: () => { console.log('canceled') }
          },
          {
            text: 'Ok',
            onPress: () => resetQueue()
          }
          ]
        );
      }
    }
  ];

  return <View style={{ flexDirection: 'row' }}>
    {showPanel && <>

      {buttons.map(button => (
        <TouchableOpacity
          style={{ margin }}
          onPress={() => button.onPress()}>
          {button.view}
        </TouchableOpacity>
      )
      )}

    </>
    }
  </View >
}
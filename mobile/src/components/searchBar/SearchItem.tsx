import { Song } from "@/common/types";
import { memo } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { usePlayListContext } from "@/contexts/PlayerContext";
import { formatTime } from "@/helpers/helpers";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { styles } from "./styles";

export const SearchItem = memo(({ song }: { song: Song }) => {

  const { enqueue } = usePlayListContext();

  const formattedTime = formatTime(song.duration);
  const color =
    song.local === undefined ? 'orange' : song.local === true ? '#10b981' : '#ef4444';

  const handleItemPress = () => {
    Alert.alert('Add song', `Do you want to add \n${song.title} \n to current playlist?`,
      [{
        text: 'Cancel',
        onPress: () => { console.log('canceled') }
      },
      {
        text: 'Ok',
        onPress: () => enqueue(song)
      }
      ]
    );
  }

  return (
    <TouchableOpacity style={styles.card}
      onPress={handleItemPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer} >
        <Text style={styles.title}>{song.title}</Text>

        <View style={styles.subInfo}>
          <Text style={styles.duration}>{formattedTime}</Text>
          <Text style={[styles.source, { color }]}>· {(song.provider ?? "").substring(0, 1)}</Text>
        </View>
      </View>
      <View style={styles.actionIcon}>
        <FontAwesome name="plus-circle" size={20} color="#0d9488" />
      </View>

    </TouchableOpacity>
  );
});
import { Song } from "@/common/types";
import { memo } from "react";
import { StyleSheet, Alert, Text, TouchableOpacity, View } from "react-native";
import { usePlayListContext } from "@/contexts/PlayerContext";
import { formatTime } from "@/helpers/helpers";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export const SearchItem = memo(({ song }: { song: Song }) => {

  const durationInSecs = song.duration;
  const mins = Math.floor(durationInSecs / 60);
  const secsRem = durationInSecs % 60;
  const hours = Math.floor(mins / 60);
  const minsRem = mins % 60;
  const localString = song.local ? 'true' : 'false';
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
          <Text style={[styles.source, { color }]}>· {song.source.substring(0, 1)}</Text>
        </View>
      </View>
      <View style={styles.actionIcon}>
        <FontAwesome name="plus-circle" size={20} color="#0d9488" />
      </View>

    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  subInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  duration: {
    fontSize: 13,
    color: '#64748b',
  },
  source: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionIcon: {
    paddingLeft: 8,
  },
});
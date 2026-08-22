import { Song } from "@/common/types"
import { StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { usePlayListContext } from "@/contexts/PlayerContext";
import { BlinkingPlayButton } from "../buttons/BlinkingPlayButton";
import { formatTime } from "@/helpers/helpers";
import { useProgress } from "react-native-track-player";
import { useEffect, useRef } from "react";

export function PlayListItem({ song, index, isPlaying }: { song: Song, index: number, isPlaying: boolean }) {

  const { dequeue, skipToByInstanceId } = usePlayListContext();
  const titlelower = song.title
    .toLowerCase()
    .replace('(videoclip oficial)', '')
    .replace('(visualizer)', '')
    .replace('(videoclip)', '');
  const title = titlelower.substring(0, 1).toUpperCase().concat(titlelower.substring(1));
  const formattedTime = formatTime(song.duration);
  const { position, duration } = useProgress();
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const color =
    song.local === undefined ? 'orange' : song.local === true ? '#10b981' : '#ef4444';

  useEffect(() => {
    if (!isPlaying) {
      animatedProgress.setValue(0);
      return;
    }
    const progressPercent = duration > 0 ? Math.min(position / duration, 1) : 0;

    Animated.timing(animatedProgress, {
      toValue: progressPercent,
      duration: 200,
      useNativeDriver: false
    }).start()
  }, [position, duration, isPlaying]);

  const widthInterpolated = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  return <View style={[styles.card, isPlaying && styles.playingCardBase]}>

    {isPlaying && (
      <Animated.View
        style={[
          styles.progressBarBackground,
          { width: widthInterpolated }
        ]}
      />
    )}

    <TouchableOpacity
      style={styles.mainContent}
      onPress={() => skipToByInstanceId(song.instanceId!)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {isPlaying && <BlinkingPlayButton />}
        <View style={styles.infoContainer}>
          <Text style={[styles.title, isPlaying && styles.playingText]}>
            {title}
          </Text>
          <View style={styles.subInfo}>
            <Text style={styles.duration}>  {formattedTime}</Text>
            <Text style={[styles.source, { color }]}>· {song.provider.substring(0, 1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => dequeue(song.instanceId!)}>
      <FontAwesome name="trash-o" size={20} color="#94a3b8" />
    </TouchableOpacity>
  </View >

}
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
    overflow: 'hidden', 
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  playingCardBase: {
    borderColor: '#0d9488',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#f0fdf4',
    zIndex: 0,
  },
  mainContent: {
    flex: 1,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  playingText: {
    color: '#047857',
    fontWeight: '700',
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
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    zIndex: 1,
  },
});
import { View, StyleSheet } from "react-native";
import { PlayButton, LikeButton, SkipButton } from "../buttons";
import { SongTitle } from "../SongTitle";
import { SongProgressBar } from "../SongProgressBar";
import { RepeatButton } from "../buttons/RepeatButton";

export function Controls() {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <LikeButton />
        <View style={styles.titleContainer}>
          <SongTitle />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <SongProgressBar />
      </View>

      <View style={styles.controlPanel}>
        <SkipButton to='Prev' />
        <PlayButton />
        <RepeatButton />
        <SkipButton to='Next' />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 8,
  },
  controlPanel: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: '#0d9488',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});


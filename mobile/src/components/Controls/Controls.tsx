import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PlayButton from "../PlayButton";
import { globalStyles } from "../../globalStyles";
import AntDesign from '@expo/vector-icons/AntDesign';
import { styles } from "./styles";
import TrackPlayer, { Event, useProgress, useTrackPlayerEvents } from "react-native-track-player";
import SongProgressBar from "../SongProgressBar";
import { usePlayListContext } from "@/context/PlayListContext";
import { useEffect, useRef } from "react";
import { useGraphQl } from "@/hooks/useGraphql";
import { Song } from "@/common/types";
import { GET_RELATED_SONGS } from "@/graphql/queries";
import { useQueryClient } from "@tanstack/react-query";

export default function Controls({ style, setPlayListVisibility }: { style?: StyleProp<ViewStyle>, setPlayListVisibility: React.Dispatch<React.SetStateAction<boolean>> }) {

  const { position, duration } = useProgress();
  const { playList, addSong } = usePlayListContext();

  const isLastSong = useRef<boolean>(false);
  const isTrigered = useRef(false);

  const lastSongId = playList.length > 0 ? playList[playList.length - 1].id : "";

  const queryClient = useQueryClient();

  const { refetch } = useGraphQl<{ getRelated: Song[] }, { id: string, numberOfSongs: number }>(
    GET_RELATED_SONGS,
    { id: lastSongId, numberOfSongs: 1 },
    { enabled: false }
  );

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (event.type === Event.PlaybackActiveTrackChanged) {
      const index = await TrackPlayer.getActiveTrackIndex();
      if (index === undefined || index === null) return;
      const queue = await TrackPlayer.getQueue();
      isLastSong.current = queue.length - 1 === index;
      if (isLastSong.current) isTrigered.current = false;
    }
  });

  const intPosition = Math.floor(position);

  useEffect(function addSongAtTheEnd() {
    if (duration <= 0 ||
      !isLastSong.current ||
      !intPosition ||
      !duration ||
      isTrigered.current
    ) return;

    const middle = Math.floor(duration / 2);
    if (intPosition < middle) return;

    isTrigered.current = true;

    refetch()
      .then(({ data }) => {
        console.log('the id asked for to the server is', lastSongId);
        if (data?.getRelated && data.getRelated.length > 0) {
          addSong(data.getRelated[0], false);
          console.log('added related song');

        } else console.log('tried to add song but get no results from server');
      })
      .catch(console.error);

    console.log(intPosition, "trigered=" + isTrigered.current + " middle =" + middle + " if= " + (intPosition >= middle));
  }, [intPosition, duration]);

  return (
    <>
      <SongProgressBar progression={{ duration, position }} />
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


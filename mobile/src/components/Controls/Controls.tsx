import { useEffect, useRef, useState } from "react";
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import TrackPlayer, { Event, useActiveTrack, useProgress, useTrackPlayerEvents } from "react-native-track-player";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { GET_RELATED_SONGS } from "@/graphql/queries";

import PlayButton from "../PlayButton";
import { globalStyles } from "../../globalStyles";
import { styles } from "./styles";
import SongProgressBar from "../SongProgressBar";
import { usePlayListContext } from "@/context/PlayListContext";
import { useGraphQl } from "@/hooks/useGraphql";
import { Song } from "@/common/types";

export default function Controls(
  { style, setPlayListVisibility }:
    {
      style?: StyleProp<ViewStyle>,
      setPlayListVisibility: React.Dispatch<React.SetStateAction<boolean>>
    }) {

  const { position, duration } = useProgress();
  const { playList, addSong } = usePlayListContext();
  const activeTrack = useActiveTrack();

  const isLastSong = useRef<boolean>(false);
  const isTrigered = useRef(false);

  const lastSongId = playList.length > 0 ? playList[playList.length - 1].id : "";
  const [relatedId, setRelatedId] = useState<string>(lastSongId);

  const { refetch } = useGraphQl<{ getRelated: Song[] }, { id: string, numberOfSongs: number }>(
    GET_RELATED_SONGS,
    { id: relatedId, numberOfSongs: 1 },
    { enabled: false }
  );

  useTrackPlayerEvents(
    [
      Event.PlaybackActiveTrackChanged,
      Event.PlaybackQueueEnded
    ],
    async event => {
      switch (event.type) {
        case Event.PlaybackActiveTrackChanged:
          const index = await TrackPlayer.getActiveTrackIndex();
          if (index === undefined || index === null) return;
          setRelatedId(playList[index].id);
          const queue = await TrackPlayer.getQueue();
          isLastSong.current = queue.length - 1 === index;
          if (isLastSong.current) isTrigered.current = false;
          break;
        case Event.PlaybackQueueEnded:
          console.log('queue ended');
          isTrigered.current = false;
          break;
        default:
          console.log('untracked event captured');
          break;
      }
    });

  const intPosition = Math.floor(position);

  const fetchRelated = async (id?: string) => {
    const { data } = await refetch();
    console.log('the id asked for to the server is', relatedId);
    if (data?.getRelated && data.getRelated.length > 0) {
      if (playList.some(song => song.id === data.getRelated[0].id)) {
        setRelatedId(data.getRelated[0].id);
        isTrigered.current = false;
      } else {
        addSong(data.getRelated[0], false);
        console.log('added related song');
      }

    } else console.log('tried to add song but get no results from server');
  }
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
    fetchRelated();
    console.log(intPosition, "trigered=" + isTrigered.current + " middle =" + middle + " if= " + (intPosition >= middle));
  }, [intPosition, duration, relatedId]);

  const getTitle = () => {
    return playList.find(song => song.instanceId === activeTrack?.mediaId)?.title || 'unkown song';
  }

  return (
    <>
      <Text>{getTitle()}</Text>
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


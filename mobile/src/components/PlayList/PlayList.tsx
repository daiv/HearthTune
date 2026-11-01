import { Song } from "@/common/types";
import { FlatList, Text, View } from "react-native";
import { usePlayListContext } from "@/contexts/PlayerContext";
import { useActiveTrack } from "react-native-track-player";
import { PlayListItem } from "./PlayListItem";
import { PlayListControls } from "../PlayListControls";
import { formatTime } from "@/helpers/helpers";
import { useState } from "react";
import { SetPlaylistNameModal } from "../modals/setPlaylistNameModal";
import { useSavePlaylist } from "@/hooks/usePlaylist";


export function PlayList() {
  const activeTrack = useActiveTrack();
  const { activePlaylist, queue, enqueueRelatedSong, unloadPlaylist, shuffleQueue, setActivePlaylist, moveQueueItem: moveItem } = usePlayListContext();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);


  const { mutate: savePlayList } = useSavePlaylist();

  const formattedTime: string = formatTime(queue.reduce((acc, song) => acc + (song.duration || 0), 0));
  const DEFAULT_TITLE = 'Unknown title';

  const renderFunction = ({ item, index }: { item: Song, index: number }) => {
    const factory = (index: number) => (to: 'up' | 'down') => moveItem(index, to);
    const move = factory(index);
    return <PlayListItem
      song={item}
      move={move}
      isPlaying={activeTrack?.mediaId == item.instanceId
      } />
  }
  const handleSavePlaylist = (titleInput?: string) => {
    if ((!activePlaylist || activePlaylist.title === DEFAULT_TITLE) && !titleInput) {
      setIsModalVisible(true);
      return;
    }
    const songIds = queue.map(s => s.id);
    const finalTitle = titleInput || activePlaylist?.title || DEFAULT_TITLE;
    savePlayList({
      id: activePlaylist?.id || undefined,
      title: finalTitle,
      songs: songIds
    }, {
      onSuccess: data => {
        if (data.savePlaylist.id) {
          setActivePlaylist(
            {
              id: data.savePlaylist.id,
              title: data.savePlaylist.title
            }
          )
        }
        setIsModalVisible(false);
      },
      onError: error => {
        console.error('error', error);
      }
    })
  }

  return <View style={{ flex: 1 }}>
    <Text>Songs:{queue.length}, duration:{formattedTime}</Text>
    <PlayListControls
      showPanel={queue && queue.length > 0}
      enqueueRelatedSong={enqueueRelatedSong}
      resetQueue={unloadPlaylist}
      shuffleQueue={shuffleQueue}
      savePlayList={() => handleSavePlaylist()
      } />
    <SetPlaylistNameModal
      onRequestClose={() => setIsModalVisible(false)}
      visible={isModalVisible}
      onClick={(title: string) => handleSavePlaylist(title)}>
    </SetPlaylistNameModal>
    <FlatList<Song>
      data={queue}
      keyExtractor={item => item.instanceId!}
      renderItem={renderFunction}
    />
  </View>
}
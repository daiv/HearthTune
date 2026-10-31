import { Playlist, Song } from "@/common/types";
import { LibraryItem } from "@/components/LibraryItem";
import { usePlayListContext } from "@/contexts/PlayerContext";
import { useGetPlaylists, useRemovePlaylist, useSavePlaylist } from "@/hooks/usePlaylist";
import { getSongsFromPlaylistId } from "@/services/playlistService";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export function Library() {
  const { data, isLoading } = useGetPlaylists();
  const { mutate: removePlaylist } = useRemovePlaylist();
  const { mutate: updatePlaylist } = useSavePlaylist();
  const { loadPlaylist } = usePlayListContext();
  const { setActivePlaylist } = usePlayListContext();

  const handleSelectPlaylist = async (playlist: Playlist) => {
    if (!playlist.id) return;
    const { id, title } = playlist;
    const fullPlaylist: Playlist<Song> = await getSongsFromPlaylistId(id);
    await loadPlaylist(fullPlaylist);
  }
  const handleUpdateTitle = (id: string, title: string) => {
    updatePlaylist({ id, title });
  }
  const renderFunction = ({ item }: { item: Playlist }) => (
    <LibraryItem
      playlist={item}
      remove={id => removePlaylist({ id }, { onSuccess: () => setActivePlaylist(null) })}
      onSelect={handleSelectPlaylist}
      onUpdateTitle={handleUpdateTitle} />
  )
  return <View style={{ flex: 1 }}>
    <Text>Library</Text>
    {isLoading ? (

      <View >
        <ActivityIndicator size="large" color="#0d9488" />
        <Text>Loading...</Text>
      </View>
    )
      :
      <FlatList<Playlist>
        data={data}
        renderItem={renderFunction}
      />
    }
  </View>
}
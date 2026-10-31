import { memo, useState } from "react";
import { Playlist, Song } from "@/common/types";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface LibraryItemProps {
  playlist: Playlist;
  remove: (id: string) => void;
  onSelect: (playlist: Playlist) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}

export const LibraryItem = memo(
  ({ playlist, remove, onSelect, onUpdateTitle }: LibraryItemProps) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [title, setTitle] = useState<string>(playlist.title);
    const handleSave = () => {
      if (title.trim() && title !== playlist.title && playlist.id) {
        onUpdateTitle(playlist.id, title);
      }
      setIsEditing(false);
    }
    return <View style={styles.card}>
      {isEditing ? (
        <TextInput
          style={styles.textInput}
          onChangeText={setTitle}
          value={title}
          autoFocus
          onSubmitEditing={handleSave}
          onBlur={handleSave}
        />
      ) :
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => onSelect(playlist)}
        >
          <Text style={{ margin: 10 }}> {playlist.title}</Text>
        </TouchableOpacity>
      }

      <TouchableOpacity
        style={{ marginRight: 10 }}
        onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
        <FontAwesome name={isEditing ? "check" : "edit"} size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => { playlist.id && remove(playlist.id) }}>
        <FontAwesome name="trash-o" size={20} color="#94a3b8" />
      </TouchableOpacity>


    </View>
  }
);
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
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0d9488',
    borderRadius: 5,
    paddingHorizontal: 8,

  }
});
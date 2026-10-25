import { BaseModalProps } from "@/types/types";
import { BaseModal } from "./BaseModal";
import { Text, TextInput, View } from "react-native";
import { globalStyles } from "@/globalStyles";
import { useState } from "react";
import { Button } from "../buttons";

interface SetPlaylistNameModalProps extends Omit<BaseModalProps, 'children'> {
  onClick: (title: string) => void;
}

export function SetPlaylistNameModal({ visible, onClick, onRequestClose }: SetPlaylistNameModalProps) {

  const [title, setTitle] = useState<string>('');

  return <BaseModal
    visible={visible}
    onRequestClose={onRequestClose}>
    <View style={globalStyles.modalContainer}>
      <TextInput
        style={globalStyles.modalTextInput}
        placeholder="Enter playlist title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={globalStyles.modalPlaceHolder.color}
      />
      <Button
        style={globalStyles.button}
        onPress={() => onClick(title)}
      >
        <Text
          style={globalStyles.buttonText}> Set Title</Text>
      </Button>
    </View>
  </BaseModal>
}

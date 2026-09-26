import { Text, TextInput, View } from "react-native";
import { BaseModal } from "./BaseModal";
import { BaseModalProps } from "@/types/types";
import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "../buttons";
import { globalStyles } from "@/globalStyles";

interface ChangeNickModalProps extends Omit<BaseModalProps, 'children'> {
}
export function ChangeNickModal({ visible, onRequestClose }: ChangeNickModalProps) {
  const [nick, setNick] = useState<string>('');
  const { changeNickname } = useAuthContext();
  const handleClick = () => {
    if (nick !== '')
      changeNickname(nick);
    onRequestClose();
  }
  return (
    <BaseModal
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={globalStyles.modalContainer}>
        <TextInput
          style={globalStyles.modalTextInput}
          placeholder="Enter new nick"
          value={nick}
          onChangeText={setNick}
          placeholderTextColor={globalStyles.modalPlaceHolder.color}
        />
        <Button
          style={globalStyles.button}
          onPress={handleClick}
        >
          <Text
            style={globalStyles.buttonText}>Change nick</Text>
        </Button>
      </View>

    </BaseModal>
  )
}

import { StyleSheet, Text, TextInput, View } from "react-native";
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

      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter new nick"
          value={nick}
          onChangeText={setNick}
          placeholderTextColor="#6b7280"
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
const styles = StyleSheet.create({
  container: {
    width: 260,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',

    fontSize: 16,
    marginBottom: 16,
  },

});
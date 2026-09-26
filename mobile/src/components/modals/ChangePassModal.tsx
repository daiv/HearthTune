import { BaseModalProps } from "@/types/types";
import { Text } from "react-native";
import { BaseModal } from "./BaseModal";

interface ChangePassProps extends Omit<BaseModalProps, 'children'> {

}
export function ChangePassModal({ visible, onRequestClose }: ChangePassProps) {
  
  return (
    <BaseModal
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <Text>Password change not available yet</Text>
    </BaseModal>
  )
}
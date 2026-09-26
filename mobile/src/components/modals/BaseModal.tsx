import { BaseModalProps } from "@/types/types";
import { Modal, StyleSheet, View } from "react-native";


export function BaseModal({ visible, onRequestClose, children }: BaseModalProps) {
  return <Modal visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onRequestClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        {children}
      </View>
    </View>
  </Modal>
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
  }
});
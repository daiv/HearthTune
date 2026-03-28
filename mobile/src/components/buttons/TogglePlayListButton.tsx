import AntDesign from '@expo/vector-icons/AntDesign';
import { TouchableOpacity } from "react-native";

export  function TogglePlayListButton({ setPlayListVisibility }:
  { setPlayListVisibility: React.Dispatch<React.SetStateAction<boolean>> }) {
  return <TouchableOpacity
    onPress={() => setPlayListVisibility(visible => !visible)}>
    <AntDesign name="ordered-list" size={24} color="black" />
  </TouchableOpacity>
}
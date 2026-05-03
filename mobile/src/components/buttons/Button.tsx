import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";

export function Button({ onPress: exec, children, style }: { onPress: () => void, children: React.JSX.Element, style?: StyleProp<ViewStyle> }) {

  return <TouchableOpacity
    onPress={exec}
    style={style}>
    {children}
  </TouchableOpacity>

}
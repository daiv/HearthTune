import { useState } from "react";
import { ActivityIndicator, StyleProp, TouchableOpacity, ViewStyle } from "react-native";

export function AsyncButton({ onPress: action, children, style }: { onPress: Function, children: React.JSX.Element, style?: StyleProp<ViewStyle> }) {
  const [isWorking, setIsWorking] = useState(false);


  return isWorking ?
    <ActivityIndicator />
    :
    <TouchableOpacity
      style={style}
      onPress={async () => {
        if (isWorking) return;
        setIsWorking(true);
        try {
          await action();

        } finally {
          setIsWorking(false);
        }
      }}>
      {children}
    </TouchableOpacity>

}
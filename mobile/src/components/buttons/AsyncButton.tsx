import { useState } from "react";
import { ActivityIndicator, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";

export function AsyncButton
  ({ onPress: action, children, style }:
    {
      onPress: () => void | Promise<void>,
      children: React.ReactNode,
      style?: StyleProp<ViewStyle>
    }) {
  const [isWorking, setIsWorking] = useState(false);

  return (
    <TouchableOpacity
      style={[style, { alignItems: 'center' }]}
      disabled={isWorking}
      onPress={async () => {
        if (isWorking) return;
        setIsWorking(true);
        try {
          await action();

        } finally {
          setIsWorking(false);
        }
      }}>

      {isWorking && (
        <View style={{ position: "absolute" }}>
          <ActivityIndicator color="white" />
        </View>
      )}
      {<View style={{ opacity: isWorking ? 0 : 1 }}>
        {children}
      </View>
      }
    </TouchableOpacity>
  );
}
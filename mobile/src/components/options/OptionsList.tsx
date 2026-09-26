import { Option, OptionsListProps } from "@/types/types";
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";

export function OptionsList({ options }: OptionsListProps
) {

  return <FlatList<Option>
    data={options}
    renderItem={({ item }) => {
      const action = () => item.action()
      return (
        <TouchableOpacity
          onPress={action}
        >
          <View
            style={styles.row}>
            <Text>{item.text}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    }
    keyExtractor={(option, index) => index.toString()
    }
    style={styles.list}
  />

}
const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    gap: 10,
    borderColor: 'white',
    padding: 15,
    borderWidth: 1,
  }
})
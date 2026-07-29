import { forwardRef, useState } from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from "./buttons/Button";
import { InputProps } from "@/types/types";


export const Input = forwardRef<TextInput, InputProps>((props, ref) => {
  const [isPwdHidden, setIsPwdHidden] = useState(true);
  const { type, errorMessage, nextRef, placeHolder, onChangeText } = props;
  const isPassword = type === 'password';

  return (
    <View style={styles.mainContainer}>
      <View style={styles.horView}>
        <TextInput
          ref={ref}
          style={styles.textInput}
          placeholderTextColor="#a4b0be"
          returnKeyType={nextRef ? 'next' : 'done'}
          onSubmitEditing={nextRef ? () => nextRef.current?.focus() : undefined}
          placeholder={placeHolder}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && isPwdHidden}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          autoCapitalize="none"
          autoCorrect={false}

        />
        {isPassword && <Button onPress={() => { setIsPwdHidden(visible => !visible) }}>
          <AntDesign name={isPwdHidden ? "eye-invisible" : "eye"} size={24} color="black" />
        </Button>
        }
      </View>
      {errorMessage && <Text style={{ color: 'red' }}>{errorMessage}</Text>}
    </View>
  );
});
const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
  },
  horView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'

  },
  textInput: {
    flex: 1,
    color: '#2f3640', // Color del texto al escribir (oscuro y legible)
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    marginLeft: 8, // Separa el icono del ojo del borde del input
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4757',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  }
})
import { forwardRef, useState } from "react"
import { Text, TextInput, View } from "react-native"
import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from "./buttons/Button";
import { InputProps } from "@/types/types";


export const Input = forwardRef<TextInput, InputProps>((props, ref) => {
  const [isPwdHidden, setIsPwdHidden] = useState(true);
  const { type, errorMessage, nextRef, placeHolder, onChangeText } = props;
  const isPassword = type === 'password';

  return (
    <View id="main-container">
      <View>
        <TextInput
          ref={ref}
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
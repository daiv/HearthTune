import { useRef } from "react";
import { Text, View } from "react-native";
import { Input, AsyncButton } from "@/components";
import { useValidation } from "@/hooks";
import { checkEmail, checkMainPwd } from "@/helpers/helpers";
import { useAuthContext } from "@/contexts/AuthContext";

export function Login() {
  const { login } = useAuthContext();
  const isBusy = useRef(false);

  const emailField = useValidation<string>('', checkEmail, 'email', "email");
  const pwdField = useValidation<string>('', checkMainPwd, 'password', 'password');

  const fields = [emailField, pwdField];

  const handleSubmit = async () => {
    isBusy.current = true;
    fields.forEach(f => f.validate());

    const fieldWithError = fields.find(f => f.validate() !== '');
    if (fieldWithError) {
      fieldWithError.ref.current?.focus();
      isBusy.current = false;
      return;
    }
    const [email, pwd] = [emailField.value, pwdField.value];
    try {
      await login(email, pwd);
    } catch (error) {
      console.error(error);
    }
    finally {
      isBusy.current = false;
    }
  }

  return <View id="container" style={{ backgroundColor: 'lightgray', flex: 1 }}>

    <Text>Login</Text>

    {
      fields.map((field, index) => {
        return <Input
          ref={field.ref}
          onChangeText={field.setValue}
          errorMessage={field.error}
          type={field.type}
          placeHolder={field.id}
          nextRef={index < fields.length - 1 ? fields[index + 1].ref : undefined}
          key={field.id}
        />
      })
    }

    <View id="button-container">
      <AsyncButton
        onPress={handleSubmit}>
        <Text>Login</Text>
      </AsyncButton>

    </View>
  </View>
}
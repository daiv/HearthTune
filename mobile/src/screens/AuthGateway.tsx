import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Input, AsyncButton } from "@/components";
import { useValidation } from "@/hooks";
import { checkEmail, checkNick, checkMatchingPwd, checkMainPwd } from "@/helpers/helpers";
import { useAuthContext } from "@/contexts/AuthContext";
import { Mode } from "@/types/types";


export function AuthGateway() {
  const { login, createAccount } = useAuthContext();
  const [mode, setMode] = useState<Mode>('Log in');

  const emailField = useValidation<string>('', checkEmail);
  const pwdField = useValidation<string>('', checkMainPwd);
  const nickField = useValidation<string>('', checkNick);
  const matchPwdField = useValidation<string>('', checkMatchingPwd(pwdField.value));

  const loginFields = [emailField, pwdField];
  const createAccountFields = [...loginFields, nickField, matchPwdField];

  const nextMode = (): Mode => mode === 'Create account' ? 'Log in' : 'Create account';
  const toggle = () => setMode(mode => nextMode());
  const isCreatingAccount = mode === 'Create account';

  const handleSubmit = async () => {
    const fields = isCreatingAccount ? createAccountFields : loginFields;
    fields.forEach(f => f.validate());

    const fieldWithError = fields.find(f => f.validate() !== '');
    if (fieldWithError) {
      fieldWithError.ref.current?.focus();
      return;
    }
    const [email, pwd, nick] = [emailField.value, pwdField.value, nickField.value];
    try {
      if (isCreatingAccount) await createAccount(email, pwd, nick);
      else await login(email, pwd);
    } catch (error) {
      console.error(error);
    }
  }

  return <View id="container" style={{ backgroundColor: 'lightgray', flex: 1 }}>

    <Text>{mode}</Text>
    {isCreatingAccount &&
      <Input
        ref={nickField.ref}
        onChangeText={nickField.setValue}
        type="text"
        placeHolder="Select your nickname"
        errorMessage={nickField.error}
        nextRef={emailField.ref} />
    }

    <Input
      ref={emailField.ref}
      onChangeText={emailField.setValue}
      type="email"
      placeHolder="email"
      errorMessage={emailField.error}
      nextRef={pwdField.ref} />

    <Input key={`pwd-${mode}`}
      ref={pwdField.ref}
      onChangeText={pwdField.setValue}
      type="password"
      placeHolder="password"
      nextRef={isCreatingAccount ? matchPwdField.ref : undefined}
      errorMessage={pwdField.error} />

    {isCreatingAccount &&
      <Input key={`pwdConfirm-${mode}`}
        ref={matchPwdField.ref}
        onChangeText={matchPwdField.setValue}
        type="password"
        placeHolder="Repeat password"
        errorMessage={matchPwdField.error} />
    }

    <View id="button-container">
      <AsyncButton
        onPress={handleSubmit}>
        <Text>{mode}</Text>
      </AsyncButton>
      <Button
        onPress={toggle}>
        <Text>
          {nextMode()}
        </Text>
      </Button>
    </View>
  </View>
}
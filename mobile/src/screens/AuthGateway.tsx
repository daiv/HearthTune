import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { Button, Input, AsyncButton } from "@/components";
import { useValidation } from "@/hooks";
import { checkEmail, checkNick, checkMatchingPwd, checkMainPwd } from "@/helpers/helpers";
import { useAuthContext } from "@/contexts/AuthContext";
import { Mode } from "@/types/types";

export function AuthGateway() {
  const { login, createAccount } = useAuthContext();
  const [mode, setMode] = useState<Mode>('Log in');
  const isBusy = useRef(false);

  const emailField = useValidation<string>('', checkEmail, 'email', "email");
  const nickField = useValidation<string>('', checkNick, 'nick');
  const pwdField = useValidation<string>('', checkMainPwd, 'password', 'password');
  const matchPwdField = useValidation<string>('', checkMatchingPwd(pwdField.value), 'matchpassword', 'password');

  const loginFields = [emailField, pwdField];
  const createAccountFields = [nickField, ...loginFields, matchPwdField];

  const nextMode = (): Mode => mode === 'Create account' ? 'Log in' : 'Create account';
  const toggle = () => !isBusy.current && setMode(_ => nextMode());
  const isCreatingAccount = mode === 'Create account';

  const handleSubmit = async () => {
    isBusy.current = true;
    const fields = isCreatingAccount ? createAccountFields : loginFields;
    fields.forEach(f => f.validate());

    const fieldWithError = fields.find(f => f.validate() !== '');
    if (fieldWithError) {
      fieldWithError.ref.current?.focus();
      isBusy.current = false;
      return;
    }
    const [email, pwd, nick] = [emailField.value, pwdField.value, nickField.value];
    try {
      if (isCreatingAccount) await createAccount(email, pwd, nick);
      else await login(email, pwd);
    } catch (error) {
      console.error(error);
    }
    finally {
      isBusy.current = false;
    }
  }

  const renderFields = isCreatingAccount ? createAccountFields : loginFields;

  return <View id="container" style={{ backgroundColor: 'lightgray', flex: 1 }}>

    <Text>{mode}</Text>

    {
      renderFields.map((field, index) => {
        return <Input
          ref={field.ref}
          onChangeText={field.setValue}
          errorMessage={field.error}
          type={field.type}
          placeHolder={field.id}
          nextRef={index < renderFields.length - 1 ? renderFields[index + 1].ref : undefined}
          key={field.type === 'password' ? `${field.id}-${mode}` : field.id}
        />
      })
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
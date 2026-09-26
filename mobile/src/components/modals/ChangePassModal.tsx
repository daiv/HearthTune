import { BaseModalProps } from "@/types/types";
import { Text, View } from "react-native";
import { BaseModal } from "./BaseModal";
import { Button } from "../buttons";
import { globalStyles } from "@/globalStyles";
import { useValidation } from "@/hooks";
import { checkMainPwd } from "@/helpers/helpers";
import { Input } from "../Input";
import { useAuthContext } from "@/contexts/AuthContext";

interface ChangePassProps extends Omit<BaseModalProps, 'children'> {

}
export function ChangePassModal({ visible, onRequestClose }: ChangePassProps) {
  const { changePass } = useAuthContext();
  const oldPasswordField = useValidation<string>('', txt => txt === '' ? 'password can not be empty' : '', 'oldPass', 'password', 'Enter old password');
  const newPasswordField = useValidation<string>('', checkMainPwd, 'newPass', 'password', 'Enter new password');
  const matchPasswordField = useValidation<string>(
    '',
    txt => txt !== newPasswordField.value ? 'Passwords do not match' : '',
    'matchPass',
    'password',
    'Repeat new password'
  );
  const fields = [oldPasswordField, newPasswordField, matchPasswordField];

  const changePasswordAndCloseModal = async () => {
    const success = await changePass(oldPasswordField.value, newPasswordField.value);
    console.log('password changed', success);
    onRequestClose();
  }
  const handleClick = () => {
    const firstError = fields
      .map(field => ({ field, error: field.validate() }))
      .find(field => field.error !== '');

    if (firstError)
      firstError.field.ref.current?.focus();
    else changePasswordAndCloseModal();
  }

  return (
    <BaseModal
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View
        style={globalStyles.modalContainer}>
        {
          fields.map((field, index) => (
            <Input
              onChangeText={field.setValue}
              type={field.type}
              placeHolder={field.placeHolder}
              nextRef={(index + 1) < fields.length ? fields[index + 1].ref : undefined}
              errorMessage={field.error}
              ref={field.ref}
              key={field.id}
              
            ></Input>))
        }
        <Button
          style={globalStyles.button}
          onPress={handleClick} >
          <Text
            style={globalStyles.buttonText}>Change password</Text>
        </Button>

      </View>
    </BaseModal >
  );
}


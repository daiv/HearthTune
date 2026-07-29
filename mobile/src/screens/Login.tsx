import { useRef } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mainContainer}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputsContainer}>
          {
            fields.map((field, index) => {
              return (
                <Input
                  ref={field.ref}
                  onChangeText={field.setValue}
                  errorMessage={field.error}
                  type={field.type}
                  placeHolder={field.type}
                  nextRef={index < fields.length - 1 ? fields[index + 1].ref : undefined}
                  key={field.id}
                />
              )
            })
          }
        </View>

        <View style={styles.buttonContainer}>
          <AsyncButton
            onPress={handleSubmit}
            style={styles.loginButton}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </AsyncButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
const shadows = { ios: 0.1, android: 0.2 };


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa', // Un gris muy suave y moderno
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400, // Evita que se estire demasiado en tablets
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    // Sombras sutiles y profesionales (iOS y Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: shadows[Platform.OS as keyof typeof shadows],
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2f3640',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputsContainer: {
    gap: 16, // Separa los inputs de forma uniforme (requiere versiones recientes de RN, si falla usa marginBottom en los inputs)
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#007aff', // Color corporativo típico (Azul iOS)
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
import { ValidatedFields } from "@/types/types";
import { useCallback, useRef, useState } from "react";
import { TextInput } from "react-native";

export function useValidation<T>(initialState: T, validator: (state: T) => string)
  : ValidatedFields<T> {
  const [state, setState] = useState<T>(initialState);
  const [error, setError] = useState<string>('');
  const isFirstRender = useRef(true);
  const ref = useRef<TextInput>(null);

  const setValue = useCallback((state: T) => {
    setState(state);
    if (isFirstRender.current)
      isFirstRender.current = false;
    else
      setError(validator(state));
  }, [validator]);

  const validate = useCallback(() => {
    const validationError = validator(state);
    setError(validationError);
    return validationError;
  }, [state, validator]);

  return { value: state, error, setValue, ref, validate }
}
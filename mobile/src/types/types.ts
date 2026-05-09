import { Song } from "@/common/types"
import { Dispatch } from "react";
import { TextInput } from "react-native";

export type Mode = 'Create account' | 'Log in';
export type PlayListContextData = {
  queue: Song[];
  enqueue: (song: Song, addedManually?: boolean) => Promise<void>;
  dequeue: (instanceId: string) => Promise<void>;
  enqueueRelatedSong: (isRetry?: boolean) => Promise<void>;
  skipToByInstanceId: (instanceId: string) => void;
  loadPlayList: (songs: Song[]) => void;
  resetQueue: () => void;
  pauseAutoQueue: (enabled: boolean) => void;
  shuffleQueue: () => Promise<void>;
}
export type PlayListControlProps = {
  enqueueRelatedSong: (isRetry?: boolean) => Promise<void>;
  resetQueue: () => void;
  savePlayList: () => void;
  showPanel: boolean;
  shuffleQueue: () => Promise<void>;
}
export type PlayListControlButton = {
  view: React.JSX.Element;
  onPress: () => Promise<void> | void;
}
export type AuthContextData = {
  userId: string;
  login: Function;
  createAccount: Function;
}
export type FieldType = 'email' | 'password' | 'text';

export type InputProps = {
  type: FieldType
  errorMessage?: string;
  nextRef?: React.RefObject<TextInput | null>;
  placeHolder?: string;
  onChangeText: (text: string) => void;
}
export type FormProps = {
  onChangeEmail: Dispatch<React.SetStateAction<string | undefined>>;
  onChangePwd: Dispatch<React.SetStateAction<string | undefined>>;
  emailRef: React.RefObject<TextInput | null>;
  pwdRef: React.RefObject<TextInput | null>;
}
export type ValidatedFields<T> = {
  value: T;
  setValue: (value: T) => void;
  error: string;
  validate: () => string;
  ref: React.RefObject<TextInput | null>;
  type: FieldType;
  id: string;
}
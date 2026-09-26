import { LogoutButton } from "@/components";
import { ChangeNickModal } from "@/components/modals/ChangeNickModal";
import { ChangePassModal } from "@/components/modals/ChangePassModal";
import { OptionsList } from "@/components/options/OptionsList";
import { Option } from "@/types/types";
import { useState } from "react";
import { View } from "react-native";

export function Settings() {
  const [action, setAction] = useState<'nick' | 'password' | null>(null);

  const options: Option[] = [{
    text: 'Change nick',
    action: () => setAction('nick')
  },
  {
    text: 'Change password',
    action: () => setAction('password')
  }];

  return <View style={{ flex: 1 }}>
    <OptionsList options={options} />
    <LogoutButton />

    <ChangeNickModal
      onRequestClose={() => setAction(null)}
      visible={action === 'nick'}>
    </ChangeNickModal>

    <ChangePassModal
      onRequestClose={() => setAction(null)}
      visible={action === 'password'}
    />
  </View>
}


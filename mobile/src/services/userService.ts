import { gqlManager } from "@/graphql/GraphQLClientManager"
import { CHANGE_NICK_MUTATION, CHANGE_PASS_MUTATION } from "@/graphql/mutations";
import { GET_NICK } from "@/graphql/queries"

export const getNickname = async (): Promise<string> => {
  const data = await gqlManager.safeRequest<{ getNick: { nick: string } }>(GET_NICK, {});
  return data.getNick.nick;
}

export const setNickname = async (newNick: string): Promise<string | null> => {
  const data = await gqlManager
    .safeRequest<{ changeNick: { nick: string } }>
    (
      CHANGE_NICK_MUTATION,
      { nick: newNick }
    );

  return data.changeNick.nick;

}

export const setPassword = async (oldPass: string, newPass: string): Promise<boolean> => {
  const data = await gqlManager
    .safeRequest<{ changePassword: boolean }>(
      CHANGE_PASS_MUTATION,
      { old: oldPass, new: newPass }
    );
  return data.changePassword;


}
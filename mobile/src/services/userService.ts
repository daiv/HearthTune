import { gqlManager } from "@/graphql/GraphQLClientManager"
import { GET_NICK } from "@/graphql/queries"

export const getNick = async (): Promise<string> => {
  const data = await gqlManager.safeRequest<{ getNick: { nick: string } }>(GET_NICK, {});
  return data.getNick.nick;
}
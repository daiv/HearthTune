import { protect } from "@/middleware";
import { UserContext } from "../context.types";
import { atLeast } from "@/helpers";

export const userResolvers = {
  Query: {
    getNick: protect<undefined, UserContext, {}>(
      atLeast('basic'),
      (_, { }, context) => {
        console.log('getNick reached');
        return { nick: context.user?.nick }
      }
    ),
  },
  Mutation: {
    changeNick: protect<undefined, UserContext, { newNick: string }>(
      atLeast('basic'),
      async (_, { newNick }, context): Promise<{ nick: string } | null> => {
        if (!context || !context.user || !context.user.id) return null;
        const updatedUser = await context.services.user.setUserNick(context.user.id, newNick);
        if (!updatedUser || !updatedUser.nick) return null;
        return { nick: updatedUser.nick }
      }
      , {
        sanitizeFields: ['newNick']
      }
    ),
    changePassword: protect<undefined, UserContext, { oldPass: string, newPass: string }>(
      atLeast('basic'),
      async (_, { oldPass, newPass }, context): Promise<boolean> => {
        if (!context || !context.user || !context.user.id) return false;
        const isValid = await context.services.auth.checkUserPassword(context.user.id, oldPass);
        if (!isValid) return false;
        await context.services.user.setUserPassword(context.user.id, newPass);
        return true;
      }
    )
  }
}
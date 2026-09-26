import { protect } from "@/middleware";
import { UserContext } from "../context.types";
import { atLeast } from "@/helpers";

export const userResolvers = {
  Query: {
    getNick: protect<undefined, UserContext, {}>(
      atLeast('recruiter'),
      (_, { }, context) => {
        console.log('getNick reached');
        return { nick: context.user?.nick }
      }
    ),
  },
  Mutation: {
    changeNick: protect<undefined, UserContext, { newNick: string }>(
      atLeast('recruiter'),
      async (_, { newNick }, context): Promise<{ nick: string } | null> => {
        if (!context || !context.user || !context.user.id) return null;
        const updatedUser = await context.services.user.setUserNick(context.user.id, newNick);
        if (!updatedUser || !updatedUser.nick) return null;
        return { nick: updatedUser.nick }
      }
      , {
        sanitizeFields: ['newNick']
      }
    )
  }
}
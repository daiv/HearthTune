import { protect } from "@/middleware";
import { BaseContext, UserContext } from "../context.types";
import { atLeast } from "@/helpers";

export const userResolvers = {
  Query: {
    getNick: protect<undefined, UserContext, {}>(
      atLeast('recruiter'),
      (_, { }, context) => {
        return { nick: context.user?.nick }
      }
    ),
  },
}
import { MongoUser, User } from "@/types/types";
import { Document, HydratedDocument } from "mongoose"

export interface IUserRepository {

  save(user: User): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmailHash(emailHash: string): Promise<User | null>;

}
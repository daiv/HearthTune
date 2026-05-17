import { IUserRepository } from "@/interfaces/IUserRepository";
import { UserModel } from "../models/userModel";
import { User } from "@/types/types";

export class UserRepository implements IUserRepository {

  async save(user: User) {
    const savedUserDoc = await UserModel.findOneAndUpdate(
      { _id: user.id },
      { $set: user },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    if (!savedUserDoc) throw new Error('error');
    return savedUserDoc.toJSON();
  }

  async getUserById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ _id: id });
    return userDoc ? userDoc.toJSON() : null;
  }

  async getUserByEmailHash(emailHash: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ emailHash });
    return userDoc ? userDoc.toJSON() : null;
  }
}

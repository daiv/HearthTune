import { IUserRepository } from "@/interfaces/IUserRepository";
import { UserModel } from "../models/userModel";
import { User } from "@/types/types";
import { hashEmail } from "../helpers";

export class UserRepository implements IUserRepository {

  async save(user: User) {
    const existingId = (await this.getUserByEmailHash(hashEmail(user.email)))?.id;

    const idToQuery = existingId || user.id;

    const savedUserDoc = await UserModel.findOneAndUpdate(
      { _id: idToQuery },
      { $set: user },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    if (!savedUserDoc) throw new Error('Unable to save user document');
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
  async getUserByToken(token: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ "credentials.token": token });
    return userDoc ? userDoc.toJSON() : null;
  }
  async getAllUsers(): Promise<User[] | null> {
    const userDoc = await UserModel.find({});
    return userDoc ? userDoc.map(user => user.toJSON()) : null;
  }
  async getWhiteListedUsers(): Promise<User[] | null> {
    const userDoc = await UserModel.find({ status: 'whiteListed' });
    return userDoc ? userDoc.map(user => user.toJSON()) : null;
  }
}

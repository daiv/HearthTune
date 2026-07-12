import { IUserRepository } from "@/interfaces/IUserRepository";
import { UserModel } from "../models/userModel";
import { User, UserCredential, UserStatus } from "@/types/types";
import { hashData } from "../helpers";
import { UserNotFoundException } from "../errors/ServerError";
import { HydratedDocument } from "mongoose";

export class UserRepository implements IUserRepository {

  async save(user: User) {
    const userToSave = { ...user, emailHash: hashData(user.email) }
    const existingId = (await this.getUserByEmail(user.email))?.id;

    const idToQuery = existingId || user.id;

    const savedUserDoc = await UserModel.findOneAndUpdate(
      { _id: idToQuery },
      { $set: userToSave },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    if (!savedUserDoc) throw new Error('Unable to save user document');
    return savedUserDoc.toJSON();

  }

  async getAllUsers(): Promise<User[] | null> {
    const userDoc = await UserModel.find({});
    return userDoc ? userDoc.map(user => user.toJSON()) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ _id: id });
    return userDoc ? userDoc.toJSON() : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ emailHash: hashData(email) });
    return userDoc ? userDoc.toJSON() : null;
  }

  async getUserByToken(token: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ "credentials.token": token });
    return userDoc ? userDoc.toJSON() : null;
  }

  async getUserByStatus(status: UserStatus): Promise<User[] | null> {
    const userDoc = await UserModel.find({ status });
    return userDoc ? userDoc.map(user => user.toJSON()) : null;
  }

  async getCredentialsFromValidationToken(token: string): Promise<UserCredential | null> {
    const userDoc: HydratedDocument<User> | null = await UserModel.findOne({ "credentials.token": token });
    return (this.extractCredentialFromUser(userDoc));
  }

  async getCredentialsFromId(userId: string): Promise<UserCredential | null> {
    const userDoc: HydratedDocument<User> | null = await UserModel.findOne({ _id: userId });
    return (this.extractCredentialFromUser(userDoc));
  }

  private extractCredentialFromUser(userDoc: HydratedDocument<User> | null): UserCredential | null {
    if (!userDoc || !userDoc.credentials) return null;
    const { id, credentials } = userDoc;
    return { id, credentials };
  }

  async removeCredentials(id: string): Promise<boolean> {
    const userDoc = await UserModel.findOne({ _id: id });
    if (!userDoc) throw new UserNotFoundException();
    const user = userDoc.toObject();

    const { credentials } = user;
    if (!credentials) return false;

    userDoc.credentials = undefined;
    await userDoc.save();
    return true;
  }

  async getUserPassword(userId: string): Promise<string | null> {
    const userDoc = await UserModel.findOne({ _id: userId });
    if (!userDoc) throw new UserNotFoundException();
    return userDoc.password || null;
  }
  async setUserStatus(userId: string, status: UserStatus): Promise<User | null> {
    const user = await UserModel.findOneAndUpdate({ _id: userId }, { status });
    return user ? user.toJSON() : null;
  }
}

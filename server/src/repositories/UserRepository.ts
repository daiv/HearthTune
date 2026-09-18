import { IUserRepository } from "@/interfaces/IUserRepository";
import { UserModel } from "../models/userModel";
import { Credential, ResetPasswordCredential, User, UserCredential, UserStatus } from "@/types/types";
import { hashData } from "../helpers";
import { UserNotFoundException } from "../errors/ServerError";
import { HydratedDocument } from "mongoose";

export class UserRepository implements IUserRepository {

  
  // async save(user: User): Promise<User> {
  //   const userToSave = { ...user, emailHash: hashData(user.email) }
  //   const existingId = (await this.getUserByEmail(user.email))?.id;

  //   const idToQuery = existingId || user.id;

  //   const savedUserDoc = await UserModel.findOneAndUpdate(
  //     { _id: idToQuery },
  //     { $set: userToSave },
  //     {
  //       upsert: true,
  //       returnDocument: 'after'
  //     }
  //   );

  //   if (!savedUserDoc) throw new Error('Unable to save user document');
  //   return savedUserDoc.toJSON();

  // }
  async save(user: User) {
    const userToSave = { ...user, emailHash: hashData(user.email) };

    const savedUserDoc = await UserModel.findOneAndUpdate(
      { _id: user.id },
      { $set: userToSave },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true
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

  async saveResetPasswordCredentials(userId: string, resetPasswordCredential: Credential): Promise<boolean> {

    const userDoc = await UserModel.findById(userId);
    if (!userDoc) throw new UserNotFoundException();
    const { token, expiresAt } = resetPasswordCredential;
    if (!token || !expiresAt) return false;
    const credentialToSave: ResetPasswordCredential = {
      token: hashData(token),
      expiresAt,
      createdAt: new Date(),
      active: true
    }
    userDoc.resetPassword = credentialToSave;
    await userDoc.save();
    return true;
  }

  async getResetPasswordCredentials(token: string): Promise<ResetPasswordCredential | null> {

    const userId = await this.getUserIdByResetPasswordToken(token);
    if (!userId) {
      console.warn('nobody has this token', token);
      return null;
    }

    const userDoc = await UserModel.findById(userId);
    if (!userDoc || !userDoc.resetPassword) return null;

    return userDoc.resetPassword;
  }

  async removeResetPasswordCredentials(userId: string): Promise<boolean> {
    const userDoc = await UserModel.findById(userId);
    if (!userDoc) throw new UserNotFoundException();
    userDoc.resetPassword = undefined;
    await userDoc.save();
    return true;
  }
  async getMinutesSinceLastResetPassword(userId: string): Promise<number | null> {
    const userDoc = await UserModel.findById(userId);
    if (!userDoc) throw new UserNotFoundException();

    if (!userDoc.resetPassword) return null;

    const { createdAt } = userDoc.resetPassword;

    const diffMilliseconds = Date.now() - new Date(createdAt).getTime();

    const minsElapsed = Math.floor(diffMilliseconds / (1000 * 60));

    if (minsElapsed < 0) return null;

    return minsElapsed;
  }
  async getUserIdByResetPasswordToken(token: string): Promise<string | null> {
    const userDoc = await UserModel.findOne({ "resetPassword.token": hashData(token) });
    if (!userDoc) return null;
    return userDoc.id;
  }
  async getUserPassword(userId: string): Promise<string | null> {
    const userDoc = await UserModel.findOne({ _id: userId });
    return userDoc && userDoc.password || null;
  }
  async setUserStatus(userId: string, status: UserStatus): Promise<User | null> {
    const user = await UserModel.findOneAndUpdate({ _id: userId }, { status });
    return user ? user.toJSON() : null;
  }
}

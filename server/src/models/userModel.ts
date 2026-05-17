import { MongoUser } from "@/types/types";
import mongoose, { model } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";
import { hashEmail } from "../helpers";

const userSchema = new mongoose.Schema<MongoUser>({
  _id: {
    type: String,
    required: true,
    alias: 'id',
  },
  email: {
    type: String,
    required: true,
  },
  emailHash: {
    type: String,
    unique: true,
    index: true,
  },
  nick: {
    type: String
  },
  status: {
    type: String,
    required: true,
    unique: false,
  },
  password: {
    type: String,
  }

}
  , {
    _id: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Partial<MongoUser>) => {
        delete ret._id;
        delete ret.__v;
        delete ret.__enc_email;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

userSchema.pre("save", async function (this: mongoose.Document & MongoUser) {
  if (this.isModified("email") && this.email) {
    const cleanEmail = this.email.toLowerCase().trim();
    this.emailHash = hashEmail(cleanEmail);
  }
});

userSchema.plugin(fieldEncryption, {
  fields: ["email"],
  secret: process.env.ENCRYPTION_KEY
});

export const UserModel = model<MongoUser>('User', userSchema);
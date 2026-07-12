import { MongoUser } from "@/types/types";
import mongoose, { model } from "mongoose";
import { fieldEncryption } from "mongoose-field-encryption";

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
    required: true,
  },

  nick: {
    type: String,
    required: false,
  },

  status: {
    type: String,
    required: true,
    unique: false,
  },

  password: {
    type: String,
    required: false,
  },

  role: {
    type: String,
    required: true,
  },
  activatedAt: {
    type: Date,
    required: false,
  },

  credentials: {
    token: { type: String, required: false },
    expiresAt: { type: Date, required: false }
  }
}
  , {
    timestamps: true,
    _id: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Partial<MongoUser>) => {
        delete ret._id;
        delete ret.__v;
        delete ret.__enc_email;
        delete ret.password;
        delete ret.credentials;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

userSchema.plugin(fieldEncryption, {
  fields: ["email"],
  secret: process.env.ENCRYPTION_KEY
});

export const UserModel = model<MongoUser>('User', userSchema);
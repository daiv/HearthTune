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
  internalTag: {
    type: String,
    required: true
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
  resetPassword: {
    token: { type: String, required: false },
    expiresAt: { type: Date, required: false },
    createdAt: Date,
    active: { type: Boolean, default: true },
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
    },
    toObject: { virtuals: true }
  }
);

userSchema.plugin(fieldEncryption, {
  fields: ["email"],
  secret: process.env.ENCRYPTION_KEY
});

export const UserModel = model<MongoUser>('User', userSchema);
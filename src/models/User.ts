import { Schema, model } from 'mongoose';
import {ObjectId} from "mongodb"

// 1. Create an interface representing a document in MongoDB.
export interface IUser {
  _id: ObjectId,
  created_at: Date,
  username: string;
  email?: string;
  role: string
}
export const  ROLES = { 
  "ADMIN": "ADMIN",
  "READER": "READER",
  "WRITER": "WRITER"
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    _id: {type: Schema.Types.ObjectId, default: new ObjectId},
    created_at: { type: Date, default: Date.now },
    username: { type: String, required: true },
    email: {type: String,  unique: true, required: true},
    role: { type: String, enum: Object.values(ROLES), required: true }
});

export const User = model<IUser>('User', userSchema);


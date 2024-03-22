import { ObjectId, Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface ITopic {
  slug: String;
  created_at: Date,
  updated_at: Date,
  created_by: ObjectId;
  name: string;
  active: Boolean;
  content_types: Array<string>;
  image_url: string;
}

// 2. Create a Schema corresponding to the document interface.
const catSchema = new Schema<ITopic>({
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String,  unique: true, required: true },
    content_types: { type: [String], default: [] },
    image_url:{ type: String, required: true },
});

export const Topic = model<ITopic>('Topic', catSchema);


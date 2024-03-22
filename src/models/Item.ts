import { ObjectId, Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IItem {
  author: String,
  file?: File
  item_type: String,
  item_name: String,
  item_video_url: String,
  topic_name: String,
  topic_slug: String,
  created_at: Date,
  updated_at: Date
}

export interface File {
  name: String,
  original_name: String,
  folder_name: String,
  extension: String,
}

// 2. Create a Schema corresponding to the document interface.
const fileSchema = new Schema<File>({
  name: String,
  original_name: String,
  folder_name: String,
  extension: String,
});

const itemSchema = new Schema<IItem>({
  author: String,
  file: { type: fileSchema },
  item_type: String,
  item_name: String,
  item_video_url: String,
  topic_name: String,
  topic_slug: String,
  created_at: Date,
  updated_at: Date
});

export const Item = model<IItem>('Item', itemSchema);
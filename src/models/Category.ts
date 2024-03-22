import { ObjectId, Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface ICategory {
  id: String,
  name: String,
  include_external_url: boolean,
  extensions: Array<String>,
}



// 2. Create a Schema corresponding to the document interface.
const catSchema = new Schema<ICategory>({
  include_external_url: Boolean,
  id: { type: String, required: true, unique: true },
  name: String,
  extensions: { type: [String] }
});

export const Category = model<ICategory>('Category', catSchema);
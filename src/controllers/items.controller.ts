import { Request, Response, NextFunction } from "express"
import { Category, Topic } from "../models";
import { createSlug, isYoutubeLink, onError } from "../utils";
import { IItem, Item } from "../models/Item";
import { ObjectId } from "mongodb";
import Path from "path";
import fs from "fs";
import { base64ToArrayBuffer } from "../utils";

const DIR_NAME = `${__dirname}/../../uploads`;

const ITEM_TYES = {
  "png": "IMAGE",
  "jpg": "IMAGE",
  "webp": "IMAGE",
  "jpeg": "IMAGE",
  "plain": "TXT",
  "pdf": "PDF"
}



export async function createItem(req: Request, res: Response, next: NextFunction) {
  let {
    topic_slug,
    name,
    file,
    video_url, // for yt video
  } = req.body;

  const topic = await Topic.findOne({ slug: topic_slug });
  if (!topic)  return onError(res, "Topic not found");
  if(!name) return onError(res, "Required item name");
  let alreadyExist = await Item.countDocuments({
    $and: [
      {
        topic_slug: topic_slug
      },
      {
        item_name: name
      }
    ]
  });
  if (alreadyExist) return onError(res, "Ya existe un elemento en la temática con ese nombre");

  let item = new Item({
    author: req["user"]?.username, 
    item_name: name,
    topic_slug,
    topic_name: topic.name,
    created_at: new Date(),
    updated_at: new Date()
  });
  //Check type
  if(video_url){
    if (!isYoutubeLink(video_url)) return onError(res, "Invalid Youtube link");
    item.item_type = "VIDEO_URL"
    item.item_video_url = video_url;
  }else{ //Check file
    if(!file) return onError(res, "Required file");
    if(!file.b64)return onError(res, "Required b64 file");
    //Save the file 
    const folder = `${DIR_NAME}/${topic_slug}`
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    let _ = new ObjectId().toString();
    const [errors, filename, extension] = base64ToArrayBuffer(file.b64, folder, _);
    if (errors) return onError(res, "Error guardando archivo: "+ filename);

    item.item_type = ITEM_TYES[extension];
    item.file = {
      name: filename,
      original_name: file.name,
      folder_name: topic_slug,
      extension: extension,
    }
  }

  await item.save();

  return res.status(200).send(item);

}

export async function getItem(req: Request, res: Response) {

  let file = req.query.filename;
  let path = Path.resolve("uploads/" + file);
  if (!fs.existsSync(path)) {
    return res.status(404).send({ "message": "Not found" })
  }
  res.sendFile(path)
};
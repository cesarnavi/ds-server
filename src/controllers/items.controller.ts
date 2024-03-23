import { Request, Response, NextFunction } from "express"
import { Category, ROLES, Topic } from "../models";
import { createSlug, isYoutubeLink, onError } from "../utils";
import { IItem, Item } from "../models/Item";
import { ObjectId } from "mongodb";
import Path from "path";
import fs from "fs";
import { base64ToArrayBuffer } from "../utils";
import logger from "../lib/logger";
import { Console } from "console";


const DIR_NAME = `${__dirname}/../../uploads`;

const ITEM_TYES = {
  "png": "IMAGE",
  "jpg": "IMAGE",
  "webp": "IMAGE",
  "jpeg": "IMAGE",
  "plain": "TXT",
  "pdf": "PDF"
}

const deleteFile =(folder:string,filename:string)=>{
  try{
    fs.rmSync(`${DIR_NAME}/${folder}/${filename}`);
  }catch(e){
    logger.error("Error deleting file: ", folder, filename)
  }
  
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  let {
    topic_slug,
    name,
    file,
    video_url, // for yt video
  } = req.body;

  const topic = await Topic.findOne({ slug: topic_slug });
  if (!topic)  return onError(res, "Temática no existe");
  if(!name) return onError(res, "name es requerido para el elemento");
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
    if (!isYoutubeLink(video_url)) return onError(res, "Formato de video Youtube inválido");
    item.item_type = "VIDEO_URL";
    item.item_video_url = video_url;
  }else{ //Check file
    if(!file) return onError(res, "Se requiere un archivo o url de video youtube");
    if(!file.name)return onError(res, "Se requiere un nombre para el elemento");
    if(!file.b64)return onError(res, "Se requiere el archivo en formato base64 ");
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

export async function getItems(req: Request, res: Response) {
  const {
    name
  } = req.query;

  let filter:any = {}

  if(name){
    filter.item_name = {
      $regex:  name,
      $options: "i"
    }
  }

  let items = await Item.find(filter,null,{ lean: true});
  if(req["user"].role == ROLES.WRITER){
    return res.json(items.map((el)=>({...el, item_video_url: null})))
  }

  return res.json(items);
}
export async function updateItemById(req: Request, res: Response) {
  let{
    _id
  } = req.params;

  if(!_id) return onError(res, "Necesita _id del elemento");
  if(!ObjectId.isValid(_id)) return onError(res, "_id inválido");

  let item = await Item.findById(_id);
  if(!item) return onError(res, "Elemento no encontrado");

  let {
    topic_slug,
    name,
    file,
    video_url, // for yt video
  } = req.body;

  if(topic_slug){
    const topic = await Topic.findOne({ slug: topic_slug });
    if (!topic)  return onError(res, "Temática no existe");

    item.topic_slug = topic_slug;
  }

  if(name){
    let alreadyExist = await Item.countDocuments({
      $and: [
        {
          topic_slug: item.topic_slug
        },
        {
          item_name: name
        }
      ]
    });
    if(alreadyExist) return onError(res,"Ya existe el nombre")
  }

  if(video_url){
    if (!isYoutubeLink(video_url)) return onError(res, "Formato de video Youtube inválido");
    item.item_type = "VIDEO_URL";
    item.item_video_url = video_url;
    if(item.file){//elimianmos item actual
      deleteFile(item.file.folder_name as string,item.file.name as string);
      item.file = null;
    }
  }else if(file){
    if(!file.name)return onError(res, "Se requiere un nombre para el elemento");
    if(!file.b64)return onError(res, "Se requiere el archivo en formato base64 ");
    //Save the file 
    const folder = `${DIR_NAME}/${item.topic_slug}`
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    let _ = new ObjectId().toString();
    const [errors, filename, extension] = base64ToArrayBuffer(file.b64, folder, _);
    if (errors) return onError(res, "Error guardando archivo: "+ filename);

    item.item_type = ITEM_TYES[extension];
    if(item.file){ // Eliminamos el archivo actual
      deleteFile(item.file.folder_name as string,item.file.name as string);
    }
    if(item.item_video_url){
      item.item_video_url = null;
    }

    item.file = {
      name: filename,
      original_name: file.name,
      folder_name: item.topic_slug,
      extension: extension,
    }
  }
  
  await item.save();
  return res.status(200).send(item);

}

export async function deleteItemById(req: Request, res: Response) {
  let{
    _id
  } = req.params;

  if(!_id) return onError(res, "Necesita _id del elemento");
  if(!ObjectId.isValid(_id)) return onError(res, "_id inválido");

  let item = await Item.findById(_id);
  if(!item) return onError(res, "Elemento no encontrado");

  if(item.file){
    deleteFile(item.file.folder_name as string, item.file.name as string);
  }
  let deleted = await Item.deleteOne({ _id: item._id });
  if (deleted.deletedCount == 1) {
    return res.status(202).send("ok");
  } else {
    return onError(res, "Error eliminando elemento");
  }
}

export async function getFileFromItem(req: Request, res: Response) {
  let{
    _id
  } = req.params;

  if(!_id) return onError(res, "Necesita _id del elemento");
  if(!ObjectId.isValid(_id)) return onError(res, "_id inválido");

  let item = await Item.findById(_id);
  if(!item) return onError(res, "Elemento no encontrado");

  if(item.item_video_url){
    return res.redirect(item.item_video_url as string);
  }

  if(!item.file){
    return onError(res, "Archivo no encontrado");
  }

  const f = Path.resolve(`${DIR_NAME}/${item.file.folder_name}/${item.file.name}`);
  if(!fs.existsSync(f)){
    return onError(res, "Archivo no existe");
  }

  return res.sendFile(f);
  
}
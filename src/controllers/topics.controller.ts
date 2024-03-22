import { Request, Response } from "express"
import { Category, Topic } from "../models";
import { createSlug, onError } from "../utils";
import { Item } from "../models/Item";

const normalizeStr = (str:string)=>str.toLowerCase().trim();
export async function getTopics(req: Request, res: Response){
  
    const topics = await Topic.aggregate([{$match: {
        active: true
       }}, {$unwind: {
        path: '$content_types',
        preserveNullAndEmptyArrays: true
       }}, {$lookup: {
        from: 'items',
        localField: 'content_types',
        foreignField: 'item_type',
        as: 'items'
       }}, {$group: {
        _id: '$slug',
        name: {
         $first: '$name'
        },
        slug: {
         $first: '$slug'
        },
        image_url: {
         $first: '$image_url'
        },
        content_types: {
         $push: {
          key: '$content_types',
          items: {
           $size: '$items'
          }
         }
        }
       }}]);
    // Return the JWT in our response.
    return res.type('json').send(topics);
}
export async function getTopicBySlug(req: Request, res: Response){

    const {
        slug
    } = req.params;

    const topic = await Topic.findOne({slug: slug, active: true},null,{ lean: true});
    if(!topic){
        return onError(res,"Invalid topic");
    }

    const items = await Item.find({ topic_slug: slug },null,{ lean: true }).sort({updated_at:-1});

    return res.type('json').send({...topic, items });
}
export async function createTopic(req: Request, res: Response) {
    let {
        image_url,
        content_types,
        slug,
        name
    } = req.body;
  
    if (!slug) {
       slug = createSlug(name);
    }
    if (!name) {
      return onError(res, "Topic name is required");
    }
    if (!image_url) {
        return onError(res, "Image URL is required");
      }
    if (!content_types) {
      return onError(res, "content types is required");
    }
    if (!Array.isArray(content_types)) {
        return onError(res, "content types is required");
    }
    if (content_types.length  == 0) {
        return onError(res, "content types is required");
    }

    content_types = content_types.map((c:string)=>c.toUpperCase());

    let categories = (await Category.find({},null,{ lean : true})).map((c)=>c.id);
  
    if(content_types.some((ct:string)=>!categories.includes(ct))){
        return onError(res, "Invalid content type");
    }

    slug = normalizeStr(slug).normalize("NFC");
    name = normalizeStr(name);
  
    let alreadyExistSlug = await Topic.countDocuments({ $or: [
        {
            name: name
        },
        {
            slug: slug
        }
    ]});
    if (alreadyExistSlug) {
      return onError(res, "Topic already exists");
    }
    
    let topic = null;

    try {
      topic = await new Topic({
        image_url,
        created_by: req["user"]?.username,
        slug,
        content_types,
        name
      }).save();
    } catch (e) {
      console.log("[Category] Error creating category: ", e.message);
      return res.status(400).send({ message: "Error, please contact support" });
    }
    console.log(" [Category] Created successfully: ", topic);
  
    return res.status(200).send(topic);
}
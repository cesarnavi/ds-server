import { Request, Response } from "express"
import { Category, Topic } from "../models";
import { createSlug, onError } from "../utils";
import { Item } from "../models/Item";

const normalizeStr = (str: string) => str.toLowerCase().trim();

export async function getTopics(req: Request, res: Response) {

  const { name } = req.query;

  let filter: any = {
    active: true
  }

  if (name) {
    filter.name = {
      $regex: name,
      $options: "i"
    }
  }

  const topics = await Topic.aggregate([{$match:filter},{$unwind: {
    path: '$content_types',
    preserveNullAndEmptyArrays: true
   }}, {$lookup: {
    from: 'items',
    'let': {
     content_type: '$content_types',
     slug: '$slug'
    },
    pipeline: [
     {
      $match: {
       $expr: {
        $and: [
         {
          $eq: [
           '$topic_slug',
           '$$slug'
          ]
         },
         {
          $eq: [
           '$item_type',
           '$$content_type'
          ]
         }
        ]
       }
      }
     }
    ],
    as: 'items'
   }}, {$lookup: {
    from: 'categories',
    localField: 'content_types',
    foreignField: 'id',
    as: 'cat'
   }}, {$unwind: {
    path: '$cat'
   }}, {$group: {
    _id: '$_id',
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
      id: '$content_types',
      name: '$cat.name',
      items: {
       $size: '$items'
      }
     }
    }
   }}, {$sort: {
    name: 1
   }}]);
  // Return the JWT in our response.
  return res.type('json').send(topics);
}
export async function getTopicBySlug(req: Request, res: Response) {

  const {
    slug
  } = req.params;

  const topic = await Topic.findOne({ slug: slug, active: true }, null, { lean: true });
  if (!topic) {
    return onError(res, "Invalid topic");
  }

  const items = await Item.find({ topic_slug: slug }, null, { lean: true }).sort({ updated_at: -1 });

  return res.type('json').send({ ...topic, items });
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
    return onError(res, "Nombre de la temática es requerido");
  }
  if (!image_url) {
    return onError(res, "Image URL es requerido");
  }
  if (!content_types) {
    return onError(res, "content types es requerido");
  }
  if (!Array.isArray(content_types)) {
    return onError(res, "content types es requerido");
  }
  if (content_types.length == 0) {
    return onError(res, "content types es requerido");
  }

  content_types = content_types.map((c: string) => c.toUpperCase());

  let categories = (await Category.find({}, null, { lean: true })).map((c) => c.id);

  if (content_types.some((ct: string) => !categories.includes(ct))) {
    return onError(res, "Tipo de contenido invalido, permitidos: " + categories.map((ca: any) => ca.id).join(","));
  }

  slug = normalizeStr(slug).normalize("NFC");
  name = normalizeStr(name);

  let alreadyExistSlug = await Topic.countDocuments({
    $or: [
      {
        name: name
      },
      {
        slug: slug
      }
    ]
  });
  if (alreadyExistSlug) {
    return onError(res, "Temática ya existe");
  }

  let topic = null;

  try {
    topic = await new Topic({
      image_url,
      author: req["user"]?._id,
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
export async function deleteTopicBySlug(req: Request, res: Response) {

  const {
    slug
  } = req.params;

  const topic = await Topic.findOne({ slug: slug }, null, { lean: true });
  if (!topic) {
    return onError(res, "Temática no encontrada");
  }

  let deleted = await Topic.deleteOne({ slug: slug });
  if (deleted.deletedCount == 1) {
    return res.status(200).send("ok");
  } else {
    return onError(res, "Error eliminando temática");
  }
}
export async function updateTopicBySlug(req: Request, res: Response) {
  let id = req.params.slug;
  if (!id) return onError(res, "Slug es requerido");

  let {
    image_url,
    content_types,
    slug,
    name
  } = req.body;

  let topic = await Topic.findOne({ slug: id });
  if (!topic) return onError(res, "Temática no encontrada");

  if (content_types && Array.isArray(content_types)) {
    let categories = (await Category.find({}, null, { lean: true })).map((c) => c.id);
    if (content_types.some((ct: string) => !categories.includes(ct))) {
      return onError(res, "Tipo de contenido invalido, permitidos: " + categories.map((ca: any) => ca.id).join(","));
    }
    topic.content_types = content_types;
  }

  if (image_url) {
    topic.image_url = image_url;
  }
  if (name) {
    name = normalizeStr(name);
    slug = createSlug(name);

    let alreadyExistName = await Topic.countDocuments({
      $or: [
        {
          name: name
        }
      ]
    });
    if (alreadyExistName) {
      return onError(res, "Nombre temática ya existe");
    }
    topic.name = name;
  }
  if (slug) {
    let alreadyExistSlug = await Topic.countDocuments({
      $or: [
        {
          slug: slug
        }
      ]
    });
    if (alreadyExistSlug) {
      return onError(res, "Slug temática ya existe");
    }
    topic.slug = createSlug(slug);
  }

  await topic.save();

  return res.status(202).send(topic)

}
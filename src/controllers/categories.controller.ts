import { Request, Response } from "express"
import { Category } from "../models";
import { createSlug, onError } from "../utils";


const normalizeStr = (str:string)=>str.toLowerCase().trim();

export async function getCategories(req: Request, res: Response){
  
    const cats = await Category.aggregate([

        {
            "$lookup":{
                "from": "topics",
                "let": { ct: "$id" },
                pipeline:[
                  {
                    $match:{
                      content_types: { $in: ["$$ct"]}
                    }
                  }

                ],
                "as": "topics"
            }
        },
        {
            "$project": {
              include_external_url:1,
              id:1,
              name:1,
              extensions:1,
                topics: {
                    $size: "$topics"
                }
            }
        }
    ]);
    // Return the JWT in our response.
    return res.type('json').send(cats);
}

export async function createCategory(req: Request, res: Response) {
    let {
        id,
        name,
        include_external_url,
        extensions,
    } = req.body;
  
   
    if (!name) {
      return onError(res, "name is required");
    }
    if (!id) {
      return onError(res, "id is required");
    }
 
    if(!extensions) {
        return onError(res, "Extensions is required");
    }
  
    name = normalizeStr(name);
    id = normalizeStr(id).toUpperCase();

    
    let alreadyExistCat = await Category.countDocuments({ $or: [
        {
            id: id
        },
        {
            name: name
        }
    ]});
    if (alreadyExistCat) {
      return onError(res, "name or content type already exists");
    }
    
    let cat = null;

    try {
      cat = await new Category({
        id,
        name,
        include_external_url,
        extensions
      }).save();
    } catch (e) {
      console.log("[Category] Error creating category: ", e.message);
      return res.status(400).send({ message: "Error, please contact support" });
    }
    console.log(" [Category] Created successfully: ", cat);
  
    return res.status(200).send(cat);
}
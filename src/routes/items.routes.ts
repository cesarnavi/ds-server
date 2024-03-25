import { Router} from "express";
import { authentication } from "../middlewares";
import { authorization } from "../middlewares/authorization";
import { ROLES } from "../models";
import { createItem, deleteItemById, getFileFromItem, getItems, updateItemById } from "../controllers/items.controller";
const router = Router();

/**
 * @swagger
 * components:
 *    schemas:
 *      File:
 *        type: object
 *        required:
 *          -name
 *          -b64
 *        properties:
 *          b64: 
 *            type: string
 *            description: Representation of a file in Base 64 Data Uri
 *          name:
 *            type: string
 *            description: The original name of the file
 *      Item:
 *        type: object
 *        required:
 *          -topic_slug
 *          -name
 *        properties:
 *          topic_slug: 
 *            type: string
 *            description: The id of the specified category
 *          name:
 *            description: Item name to be shown 
 *            type: string
 *          file:  
 *            type: object
 *            properties:
 *              $ref: "#/components/schemas/Item"
 *          video_url:
 *            description: Youtube link to specified video
 *            type: string
 */

/**
 * @swagger
 *  /items:
 *    post:   
 *      summary: Create a item
 *      description: Create a new item with youtube video or file 
 *      requestBody:
 *        description: required fields are (topic_id, name, file or video url)
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id: 
 *                  type: string
 *                  description: An descriptive ID for the category files, UPPERCASE
 *                name:
 *                  description: Category name; human readable example-> Maths Science Sports
 *                  type: string
 *                video_url:
 *                  description: Youtube link to specified video, required if file is missing
 *                  type: string
 *                file:  
 *                  description: File to be uploaded, required if video_url is missing
 *                  type: object
 *                  properties:
 *                    b64: 
 *                      type: string
 *                      description: Representation of a file in Base 64 Data Uri
 *                    name:
 *                      type: string
 *                      description: The original name of the file
 *      responses:
 *        200:
 *          description: Item created successfully
 *              
 */
router.post("/",
authentication, 
authorization(ROLES.ADMIN, ROLES.WRITER), 
createItem,
);

router.get("/",authentication,getItems);
router.put("/:_id",authentication, authorization(ROLES.WRITER, ROLES.ADMIN),updateItemById);
router.delete("/:_id",authentication, authorization(ROLES.ADMIN),deleteItemById);
router.get("/:_id/file",authentication, authorization(ROLES.READER, ROLES.ADMIN),getFileFromItem);

export default router;
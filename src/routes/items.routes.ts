import { Router} from "express";
import { authentication } from "../middlewares";
import { authorization } from "../middlewares/authorization";
import { ROLES } from "../models";
import { createItem, deleteItemById, getFileFromItem, getItems, updateItemById } from "../controllers/items.controller";
const router = Router();

/**
 * @swagger
 *  /items:
 *    post:   
 *      summary: Create a new item
 *      description: Use to create a new item
 *      requestBody:
 *        description: required fields are (description, slug, cover_url)
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Topic'
 *      responses:
 *        200:
 *          description: Topic created successfully
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                propierties:
 *                  $ref: "#/components/schemas/Topic"
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
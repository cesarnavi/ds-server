import { Router} from "express";
import { authentication } from "../middlewares";
import { authorization } from "../middlewares/authorization";
import { createCategory, getCategories } from "../controllers/categories.controller";
const router = Router();

/**
 * @swagger
 *  /categories:
 *    get:
 *      summary: Get all categories
 *      description: Use to request all available categories
 *      responses:
 *        '200':
 *          description: A response object with an array of categories 
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  items:
 *                    type: array
 *                    items:
 *                      $ref: "#/components/schemas/Category"
*/
router.get("/",getCategories);

/**
 * @swagger
 *  /users:
 *    post:   
 *      summary: Create a new category
 *      description: Use to create a new category
 *      requestBody:
 *        description: required fields are (description, slug, cover_url)
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Category'
 *      responses:
 *        200:
 *          description: Category created successfully
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                propierties:
 *                  $ref: "#/components/schemas/Category"
 */
router.post("/",authentication, authorization("ADMIN"), createCategory);

export default router;
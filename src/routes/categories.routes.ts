import { Router} from "express";
import { authentication } from "../middlewares";
import { authorization } from "../middlewares/authorization";
import { createCategory, deleteCategoryById, editCategoryById, getCategories } from "../controllers/categories.controller";
import { ROLES } from "../models";
const router = Router();
/**
 * @swagger
 * components:
 *    schemas:
 *      Category:
 *        type: object
 *        required:
 *          -id
 *          -name
 *          -extensions
 *          -include_external_url
 *      
 *        properties:
 *          id: 
 *            type: string
 *            description: An descriptive ID for the category files, UPPERCASE
 *          name:
 *            description: Category name, human readable example-> Maths, Science, Sports
 *            type: string
 *          extensions:  
 *            type: array
 *            items:
 *              type: string
 *            example: [".pdf", ".mp3"]
 *          include_external_url:
 *            type: boolean
 *          topics:  
 *            type: array
 *            items:
 *              type: object
 *          items:  
 *            type: array
 *            items:
 *              type: object
 */

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
 *  /categories:
 *    post:   
 *      summary: Create a new category
 *      description: Use to create a new category
 *      requestBody:
 *        description: JSON body with required fields
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Category'
 *    put:   
 *      summary: Edit a current category
 *      description: Use to update an existing category
 *      requestBody:
 *        description: JSON body with required fields
 *        content:
 *          application/json:
 *              schema:      # Request body contents
 *                   type: object
 *                   properties:
 *                       active:
 *                           type: boolean
 *                       name:
 *                           type: string
 *                   example:   # Sample object
 *                       name: Nuevo Nombre
 *                       active: false
 *
 */
router.post("/",authentication, authorization(ROLES.ADMIN, ROLES.WRITER), createCategory);
router.put("/:id",authentication, authorization(ROLES.ADMIN, ROLES.WRITER),editCategoryById);
router.delete("/:id",authentication, authorization(ROLES.ADMIN), deleteCategoryById );


export default router;
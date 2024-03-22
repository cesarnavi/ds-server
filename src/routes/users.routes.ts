import { Router} from "express";
import { authentication } from "../middlewares";
import { createUser, getUsers} from "../controllers"
import { authorization } from "../middlewares/authorization";
const router = Router();

/**
 * @swagger

 * components:
 *    securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          -email
 *          -username
 *          -role
 *        properties:
 *          _id: 
 *            type: string
 *            description: The auto-generated id of the user
 *          username:
 *            type: string
 *          role:  
 *            type: string
 *          email:
 *            type: string   
 *      Category:
 *        type: object
 *        required:
 *          -cover_url
 *          -name
 *          -slug
 *        properties:
 *          cover_url:
 *            type: string
 *          name:  
 *            type: string
 *          slug:
 *            type: string
 *          topics:
 *            type: integer
 *      Topic:
 *        type: object
 *        required:
 *          -category_slug
 *          -name
 *          -slug
 *        properties:
 *          category_slug:
 *            type: string
 *          name:  
 *            type: string
 *          slug:
 *            type: string
 *          category_name:
 *            type: string
 */

/**
 * @swagger
 *  /users:
 *    get:
 *      security:
 *        - bearerAuth: []       
 *      summary: Get all users
 *      description: Use to request all users from the database
 *      responses:
 *        '200':
 *          description: A response object with an array of users 
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  items:
 *                    type: array
 *                    items:
 *                      $ref: "#/components/schemas/User"
 *        '400':
 *          description: Bad request. User ID must be an integer and larger than 0 or user does not exists
 *        '401':
 *          description: Authorization information is missing or invalid.
 *        '5XX':
 *          description: Unexpected error.
 *                
 *                 

*/
router.get("/", authentication, authorization("ADMIN"), getUsers);

/**
 * @swagger
 *  /users:
 *    post:   
 *      summary: Create a new user
 *      description: Use to create a new user
 *      requestBody:
 *        description: required fields are (email, username, role)
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        200:
 *          description: User created successfully
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                propierties:
 *                  $ref: "#/components/schemas/User"
 */
router.post("/",createUser);

export default router;
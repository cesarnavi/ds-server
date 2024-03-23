import { Router} from "express";
import { authentication } from "../middlewares";
import { createUser, deleteUserById, getUsers, updateUserById} from "../controllers"
import { authorization } from "../middlewares/authorization";
import { ROLES } from "../models";
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
 *            enum: ["ADMIN", "READER", "WRITER"]
 *            type: string
 *          email:
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
router.get("/", authentication, authorization(ROLES.ADMIN), getUsers);
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
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                role:  
 *                  enum: [ADMIN,READER,WRITER"]
 *                  type: string
 *                email:
 *                 type: string   
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
router.put("/:_id", authentication, authorization(ROLES.ADMIN), updateUserById);
router.delete("/:_id", authentication, authorization(ROLES.ADMIN), deleteUserById);

export default router;
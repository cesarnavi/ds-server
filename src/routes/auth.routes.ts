import { authentication, authorization } from "../middlewares";
import { login, me } from "../controllers/auth.controller";
import { Router } from "express";
const authRoutes = Router();
/**
 * @swagger
 *  /auth/login:
 *    get:
 *      summary: Login with username and email
 *      requestBody:
 *        description: required fields are (email  username)
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                email:
 *                 type: string   
 *      responses:
 *       '200':
 *         description: Get a 1 hour valid token and user info
 *       '4XX':
 *         description: Invalid credentials.
 *       '5XX':
 *         description: Unexpected error.
*/
authRoutes.post("/login", login);
/**
 * @swagger
 *  /auth/me:
 *    get:
 *      summary: Get the informacion based on jwt in headers and returns a refresh token
 *      responses:
 *       '200':
 *         description: Get a 1 hour valid token and session info
 *       '4XX':
 *         description: Invalid credentials.
 *       '5XX':
 *         description: Unexpected error.
 * 
*/
authRoutes.get("/me",authentication, me);
export default authRoutes;
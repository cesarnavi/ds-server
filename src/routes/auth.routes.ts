import { authentication, authorization } from "../middlewares";
import { login, me } from "../controllers/auth.controller";
import { Router } from "express";
const authRoutes = Router();
/**
 * @swagger
 * /auth/login:
 *    get:
 *      summary: Login with username and email
 *      responses:
 *       '200':
 *         description: Get a 1 hour valid token
 *       '5XX':
 *         description: Unexpected error.
 * 
 * 
 *  /auth/me:
 *    get:
 *      summary: Get the informacion based on jwt in headers and returns a refresh token
 *       '200':
 *         description: Get a 1 hour valid token and session info
 *       '5XX':
 *         description: Unexpected error.
 * 
 * 
*/
authRoutes.post("/login", login);
authRoutes.get("/me",authentication, me);
export default authRoutes;
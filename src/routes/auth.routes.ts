import { authentication, authorization } from "../middlewares";
import { login, me } from "../controllers/auth.controller";
import { Router } from "express";
import { ROLES } from "../models";
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
*/
authRoutes.post("/login", login);
authRoutes.get("/me",authentication,authorization(ROLES.ADMIN,ROLES.READER, ROLES.WRITER), me);
export default authRoutes;
import { login } from "../controllers/auth.controller";
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
*/
authRoutes.post("/login", login);
export default authRoutes;
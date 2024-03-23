import { Router} from "express";
import { authentication } from "../middlewares";
import { authorization } from "../middlewares/authorization";
import { createTopic, deleteTopicBySlug, getTopicBySlug, getTopics, updateTopicBySlug } from "../controllers/topics.controller";
import { ROLES } from "../models";

const router = Router();
/**
 * @swagger
 *  /topics:
 *    get:
 *      summary: Get all topics
 *      description: Use to request all available topics
 *      responses:
 *        '200':
 *          description: A response object with an array of topics 
 *          content: 
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  items:
 *                    type: array
 *                    items:
 *                      $ref: "#/components/schemas/Topic"
*/
router.get("/",getTopics);
/**
 * @swagger
 *  /topics/:slug:
 *    get:
 *      summary: Get an specific topic and its items
 *      description: Get an specific topic and its items
*/
router.get("/:slug",getTopicBySlug);
router.delete("/:slug",authentication, authorization(ROLES.ADMIN),deleteTopicBySlug);
/**
 * @swagger
 *  /topics:
 *    post:   
 *      summary: Create a new category
 *      description: Use to create a new category
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
router.post("/",authentication, authorization(ROLES.ADMIN), createTopic);
router.put("/:slug",authentication, authorization(ROLES.ADMIN), updateTopicBySlug);

export default router;
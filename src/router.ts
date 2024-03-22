import { Router } from 'express';
import usersRouter from './routes/users.routes';
import authRouter from './routes/auth.routes';
import catRouter from "./routes/categories.routes";
import topicRouter from "./routes/topics.routes";
import itemsRouter from "./routes/items.routes";


const router = Router();
router.use("/users", usersRouter);
router.use("/categories", catRouter);
router.use("/topics", topicRouter);
router.use("/auth", authRouter);
router.use("/items", itemsRouter);

export default router;
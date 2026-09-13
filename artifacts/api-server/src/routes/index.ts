import { Router, type IRouter } from "express";
import healthRouter from "./health";
import operationsRouter from "./operations";
import ridesRouter from "./rides";

const router: IRouter = Router();

router.use(healthRouter);
router.use(operationsRouter);
router.use(ridesRouter);

export default router;

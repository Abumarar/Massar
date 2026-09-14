import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import captainsRouter from "./captains";
import rideRequestsRouter from "./ride-requests";
import routesRouter from "./routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(captainsRouter);
router.use(rideRequestsRouter);
router.use(routesRouter);

export default router;

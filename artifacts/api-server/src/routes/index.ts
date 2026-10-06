import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import captainsRouter from "./captains";
import rideRequestsRouter from "./ride-requests";
import routesRouter from "./routes";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(captainsRouter);
router.use(rideRequestsRouter);
router.use(routesRouter);
router.use(adminRouter);

export default router;

import express from "express";
import campaignsV1Router from "./v1.js";
import decryptBody from "../common/middlewares/decryptBody.js";
import healthcheck from "../common/healthCheck.js";
import { verifyToken } from "../common/middlewares/verifyToken.js";
const router = express.Router();

router.use('/v1', [decryptBody, verifyToken], campaignsV1Router);
router.get('/healthcheck', healthcheck);

export default router;
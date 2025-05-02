const express = require("express");
const campaignsV1Router = require("./v1.js");
const decryptBody = require("../common/middlewares/decryptBody.js");
const healthcheck = require("../common/healthCheck.js");

const router = express.Router();

router.use('/v1', [decryptBody], campaignsV1Router);
router.get('/healthcheck', healthcheck);


module.exports = router;
const express = require("express");
const userRouter = require("../modules/User/User.route.js");
const templateLibraryRouter = require("../modules/TemplatesLibrary/TemplatesLibrary.route.js");
const channelRouter = require("../modules/Channel/Channel.route.js");
const masterDataRouter = require("../modules/MasterData/MasterData.route.js");
const razunaRouter = require("../modules/Razuna/Razuna.route.js")
const verifyAuth = require("../common/middlewares/verifyToken.js")

const campaignsV1Router = express.Router();

campaignsV1Router.use(verifyAuth.verifyToken);

campaignsV1Router.use("/user", userRouter);
campaignsV1Router.use("/template_library", templateLibraryRouter)
campaignsV1Router.use("/channel_data", channelRouter);
campaignsV1Router.use("/master_data", masterDataRouter);
campaignsV1Router.use("/razuna", razunaRouter)

module.exports = campaignsV1Router;
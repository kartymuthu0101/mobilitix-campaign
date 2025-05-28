import express from 'express';
import userRouter from '../modules/User/User.route.js';
import templateLibraryRouter from '../modules/TemplatesLibrary/TemplatesLibrary.route.js';
import channelRouter from '../modules/Channel/Channel.route.js';
import masterDataRouter from '../modules/MasterData/MasterData.route.js';
import razunaRouter from '../modules/Razuna/Razuna.route.js';
import templateLogRouter from '../modules/TemplateLog/TemplateLog.route.js';
import templateApprovalRouter from '../modules/TemplateApproval/TemplateApproval.route.js';

const campaignsV1Router = express.Router();

// Apply authentication middleware to all routes
// campaignsV1Router.use(verifyAuth.verifyToken);

// Register module routes
campaignsV1Router.use('/user', userRouter);
campaignsV1Router.use('/template_library', templateLibraryRouter);
campaignsV1Router.use('/channel_data', channelRouter);
campaignsV1Router.use('/master_data', masterDataRouter);
campaignsV1Router.use('/razuna', razunaRouter);
campaignsV1Router.use('/template_logs', templateLogRouter);
campaignsV1Router.use('/template_approval', templateApprovalRouter);

export default campaignsV1Router;
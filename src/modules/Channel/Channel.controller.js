
const BaseController = require("../../common/BaseController.js");
const statusCodes = require("../../helpers/constants/httpStatusCodes.js");
const statusMsg = require("../../helpers/constants/httpStatusMessage.js");
const ChannelService = require("./Channel.service.js");

class ChannelController extends BaseController {
    ChannelService;
    constructor() {
        super();
        this.channelService = new ChannelService();
    }

    create_channel = async (req, res) => {
        try {
            const data = await this.channelService.create(req.body);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg.HTTP_OK,
                data
            )
        } catch (error) {
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            )
        }
    }

    getAllChannels = async (req, res) => {
        try {
            const data = await this.channelService.getAll();
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg[200],
                data
            )
        } catch (error) {
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            )
        }
    }
}

module.exports = ChannelController;
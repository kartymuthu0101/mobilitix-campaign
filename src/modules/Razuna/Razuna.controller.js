
const BaseController = require("../../common/BaseController.js");
const statusCodes = require("../../helpers/constants/httpStatusCodes.js");
const statusMsg = require("../../helpers/constants/httpStatusMessage.js");
const RazonaService = require("./Razuna.service.js");
const path = require('path');

class RazonaController extends BaseController {
    ChannelService;
    constructor() {
        super();
        this.razonaService = new RazonaService();
    }

    uploadFiles = async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    'At least one image is required'
                );
            }
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
            const invalidFiles = req.files.filter(file => {
                const ext = path.extname(file.originalname).toLowerCase();
                return !allowedExtensions.includes(ext);
            });

            if (invalidFiles.length > 0) {
                req.files.forEach(file => fs.unlinkSync(file.path));
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    'Only image files are allowed (jpg, jpeg, png, gif)'
                );
            }

            const fileUrls = req.files.map(file => {
                return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            });

            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg.HTTP_OK,
                fileUrls
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

module.exports = RazonaController;
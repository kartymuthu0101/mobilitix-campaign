
const BaseController = require("../../common/BaseController.js");
const statusCodes = require("../../helpers/constants/httpStatusCodes.js");
const statusMsg = require("../../helpers/constants/httpStatusMessage.js");
const UserService = require("./User.service.js");

class UserController extends BaseController {
    userService;
    constructor() {
        super();
        this.userService = new UserService();
    }

    getAll = async (req, res) => {
        try {
            const data = await this.userService.getAll();
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

    create = async (req, res) => {
        try {
            const data = await this.userService.create(req.body);
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
}

module.exports = UserController;
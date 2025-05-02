
const BaseController = require("../../common/BaseController.js");
const statusCodes = require("../../helpers/constants/httpStatusCodes.js");
const statusMsg = require("../../helpers/constants/httpStatusMessage.js");
const MasterDataService = require("./MasterData.service.js")

class MasterController extends BaseController {
    masterDataService;
    constructor() {
        super();
        this.masterDataService = new MasterDataService();
    }

    create = async (req, res) => {
        try {
            const data = await this.masterDataService.create(req.body);

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

    getAll = async (req, res) => {
        const { page, limit, ...filters } = req.query || {};

        let skip = (page - 1) * limit;

        const data = await this.masterDataService.getPaginated({
            skip,
            limit,
            filters
        }, {
            select: "key value",
        });

        this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg.HTTP_OK,
            data
        )
    }

}

module.exports = MasterController;
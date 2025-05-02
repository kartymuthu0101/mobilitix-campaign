const BaseService = require("../../common/BaseService.js");
const MasterDataModel = require("./MasterData.model.js");

class UserService extends BaseService {
    constructor() {
        super(MasterDataModel);
    }
}

module.exports = UserService;
const BaseService = require("../../common/BaseService.js");
const channelModel = require("./Channel.model.js");

class ChannelService extends BaseService {
    constructor() {
        super(channelModel);
    }
}

module.exports = ChannelService;
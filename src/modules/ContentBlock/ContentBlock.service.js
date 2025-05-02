const BaseService = require("../../common/BaseService.js");
const ContentBlockModel = require("./ContentBlock.model.js");

class ContentBlockService extends BaseService {
    constructor() {
        super(ContentBlockModel);
    }

    async findByEmail(condition = {}, options = {}) {
        try {
            return await this.model.find({ _id: { $in: ids } })
                .lean(options.lean || false)
                .select(options.select || '');
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ContentBlockService;
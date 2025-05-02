const { sendResponse } = require("../helpers/response.js");

class BaseController {

    success;
    constructor() {
        this.sendResponse = sendResponse;
    }
}

module.exports = BaseController;
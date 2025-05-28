import { sendResponse } from "../helpers/response.js";

class BaseController {
  success;
  
  constructor() {
    this.sendResponse = sendResponse;
  }
}

export default BaseController;

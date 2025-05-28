import BaseInterServiceCommunication from "../../common/BaseInterServiceCommunication.js";
import { interServiceBaseUrl } from "../../config/config.js";

export default class NotificationService extends BaseInterServiceCommunication {
    constructor() {
        super(`${interServiceBaseUrl.auth}/notification`);
    }
    create = async (body) => {
        try {
            const result = await this.post("/", body);
            return result?.data;
        } catch (error) {
            console.error(error?.response?.data || error)
            return null;
        }
    }
}
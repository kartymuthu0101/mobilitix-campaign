import BaseInterServiceCommunication from "../../common/BaseInterServiceCommunication.js";
import { interServiceBaseUrl } from "../../config/config.js";

export default class EscalationMatrixService extends BaseInterServiceCommunication {
    constructor() {
        super(`${interServiceBaseUrl.auth}/escalation_matrix`);
    }
    getRules = async () => {
        try {
            const result = await this.get("/?limit=20");
            return result;
        } catch (error) {
            console.error(error)
            return null;
        }
    }
}
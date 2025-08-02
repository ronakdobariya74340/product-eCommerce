import Constant from "../config/constant.js";
import { errorResponse, log1, maintenance_error } from "../lib/general.lib.js";
import Setting from "../models/setting.model.js";

export const MaintenanceMiddleware = async (req, res, next) => {
    try {
        let settingResp = await Setting.findOne({ name: "login_secret_token" });

        if (Number(settingResp?.maintenanceMode)) {
            if (req.path !== "/maintenance") return res.redirect("/maintenance");
        } else if (!Number(settingResp?.maintenanceMode) && req.path === "/maintenance") {
            return res.redirect("/");
        }

        next();
    } catch (error) {
        log1(["maintenanceMiddleware Error----->", error]);
        return res.status(400).json(errorResponse(messages.unexpectedDataError));
    }
};

import messages from "../utils/messages.js";
import { log1, authErrorResponse } from "../lib/general.lib.js";
import Setting from "../models/setting.model.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        const secret = await Setting.findOne({ name: 'login_secret_token' });
        if (!secret || secret.value.includes(":")) {
            return res.render("error/404", {
                header: { title: 404 },
            });
        };
        
        const admin = req.session.admin;
        if (!admin) {
            return res.redirect(`/admin/login/${secret.value}`);
        };

        const token = admin.token;
    
        if (!token) {
            return res.redirect(`/admin/login/${secret.value}`);
        };

        const decoded = jwt.verify(token, process.env.AUTHSECRET);      

        if (!decoded) {
            return res.redirect(`/admin/login/${secret.value}`);
        }; 

        next();
    } catch (error) {
        log1(["Auth Middleware Error", error]);
        return res.json(authErrorResponse(messages.unexpectedDataError));
    }
};

export default authMiddleware;
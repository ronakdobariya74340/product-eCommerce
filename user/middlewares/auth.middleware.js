import jwt from "jsonwebtoken";
import { log1, errorResponse, successResponse } from "../lib/general.lib.js";
import constants from "../config/constant.js";
import User from "../models/user.models.js";
import UserToken from "../models/userToken.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.session.token;
        if (!token) return res.redirect("/");
        
        let authToken = await UserToken.findOne({ token: token });
        if (!authToken) {
            req.session.destroy();
            return res.redirect("/");
        }
        jwt.verify(token, process.env.AUTHSECRET, async (err, decoded) => {
            if (err) {
                log1(["Error in authMiddleware------------------>", err]);
                return res.redirect("/");
            };

            let userId = req.session.user._id;
            let userDetails = await User.findById(userId).select("-updated_at -updatedAt -__v");

            if(userDetails?.status === constants?.USER_STATUS?.SUSPEND){
                req.session.destroy();
                return res.redirect("/");
            };

            req.user = decoded;
            req.userId = userDetails?._id;
            next();
        });
    } catch (error) {
        log1(["Error in authMiddleware------------------>", error]);
        return res.redirect("/");
    };
};

export default authMiddleware;
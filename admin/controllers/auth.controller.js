import { custom_validation } from "../lib/validation.lib.js";
import Setting from "../models/setting.model.js";
import Admin from '../models/admin.model.js'
import bcrypt from 'bcrypt'
import { errorResponse, generateLoginToken, log1, successResponse } from "../lib/general.lib.js";
import messages from "../utils/messages.js";
import { ObjectId } from "mongodb";
import { encryption } from "../lib/mycrypt.lib.js";

// get admin login page
export const getLoginPage = async (req, res) => {
    try {
        if (!req.params?.token || req.params?.token.includes(':') || req.params?.token.includes('/')) {
            return res.render("/error/404");
        };
        
        const settings = await Setting.findOne({ name: "login_secret_token", value: req.params?.token });
        if (!settings) {
            return res.render("/error/404");
        };
        
        const admin = req.session.admin;
        if (admin) {
            return res.redirect("/admin/dashboard");
        };

        return res.render("login", {
            header: {
                title: "Admin Login",
            },
            body: {},
            footer: {
                js: ["login.js"],
            }
        });
    } catch (error) {
        log1(["Error in getLoginPage----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};

// post admin login functionality
export const postLogin = async (req, res) => {
    try {
        const param = req.body;
        const validate = custom_validation(param, "admin.login");
        if (validate.flag !== 1) {
            return res.json(validate);
        };

        const admin = await Admin.findOne({ email: param.email });
        if (!admin) {
            return res.json(errorResponse("Invalid Email"));
        };

        const isMatch = await bcrypt.compare(param.password, admin.password);
        if (!isMatch) {
            return res.json(errorResponse("Invalid Password"));
        };

        const token = await generateLoginToken({_id: admin._id});
        if (!token) {
            return res.json(errorResponse(messages.unexpectedDataError));
        };

        req.session.admin = {
            id : admin._id,
            name : admin.username,
            email : admin.email,
            token : token,
        };

        return res.json(successResponse(messages.loginSuccess));
    } catch (error) {
        log1(["Error in postLogin----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};

// post admin logout functionality
export const postLogout = async (req, res) => {
    try {
        let secret = await Setting.findOne({ name: "login_secret_token" });
        secret = secret.value;
        
        delete req.session.admin;

        return res.json(successResponse(messages.logoutSuccess, { secret }));
    } catch (error) {
        log1(["Error in postLogout----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};

export const postUpdateSettings = async (req, res) => {
    try {
        const param = req.body;

        const validate = custom_validation(param, "admin.update_settings");
        if (validate.flag !== 1) {
            return res.json(validate);
        };
        await Setting.findOneAndUpdate({ "name": "login_secret_token" }, { value: param.login_secret_token, maintenanceMode: param.maintenance_mode });
        
        return res.json(successResponse("Settings updated successfully", { login_secret_token: param.login_secret_token }));
    } catch (error) {
        log1(["Error in postUpdateSettings----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};

export const postUpdatePasswords = async (req, res) => {
    try {
        const admin = req.session.admin;
        const param = req.body;

        const adminData = await Admin.findOne({ _id: new ObjectId(admin.id) });
        if (!adminData) {
            return res.json(errorResponse("Admin not found"));
        };

        const validate = custom_validation(param, "admin.update_passwords");
        if (validate.flag !== 1) {
            return res.json(validate);
        };

        const isMatch = await bcrypt.compare(param.new_password, adminData.password);
        if (isMatch) {
            return res.json(errorResponse("New password cannot be the same as the current password."));
        };

        const hasedPassword = await encryption(param.new_password);

        await Admin.updateOne({ _id: new ObjectId(admin.id) }, { password: hasedPassword });

        delete req.session.admin;
        
        const secret = await Setting.findOne({ name: "login_secret_token" });
        const login_secret_token = secret ? secret.value : "";
        
        return res.json(successResponse("Passwords updated successfully" , { login_secret_token }));
    } catch (error) {
        log1(["Error in postUpdatePasswords----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};
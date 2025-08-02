import ejs from "ejs";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import messages from "../utils/messages.js";
import constant from "../config/constant.js";
import { sendMail } from "../utils/sendMail.helper.js";
import { errorResponse, log1, successResponse, generateLoginToken, dateFormatByTimezone, formatDeviceAndIp } from "../lib/general.lib.js";
import { custom_validation } from "../lib/validation.lib.js";
import { getCartFromCookies } from "../utils/cookieHelpers.js";
import User from "../models/user.models.js";
import RegisterToken from "../models/registerToken.model.js";
import ResetPasswordToken from "../models/resetPasswordToken.model.js";
import twofactor from "node-2fa";
import Cart from "../models/cart.model.js";
import UserToken from "../models/userToken.model.js";
import Setting from "../models/setting.model.js";
import {UAParser} from 'ua-parser-js'


// export const getLogin = async (req, res) => {
//     try {
//         if (req.session?.user) {
//             return res.redirect("/");
//         };

//         return res.render("./layouts/auth-layout", {
//             pageName: "login",
//             header: {
//                 title: "User Login",
//             },
//             body: {},
//             footer: {
//                 js: "login.js",
//             },
//         });
//     } catch (error) {
//         log1(["getLogin Error----->", error]);
//         return res.status(400).json(errorResponse(messages.unexpectedDataError));
//     };
// };

// export const getRegister = async (req, res) => {
//     try {
//         if (req.userId) {
//             return res.redirect("/dashboard");
//         };

//         return res.render("./layouts/auth-layout", {
//             pageName: "register",
//             header: {
//                 title: "User Register",
//             },
//             body: {},
//             footer: {
//                 js: "register.js",
//             },
//         });
//     } catch (error) {
//         log1(["getRegister Error----->", error]);
//         return res.status(400).json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getRegisterVerifyOtp = async (req, res) => {
//     try {
//         const { token } = req.query;

//         if (!token) {
//             return res.redirect("/");
//         };

//         const resetPasswordDataByToken = await RegisterToken.findOne({ token });
//         if (!resetPasswordDataByToken) {
//             return res.redirect("/");
//         };

//         return res.render("./layouts/auth-layout", {
//             pageName: "registration-verify",
//             header: {
//                 title: "Verify Account",
//             },
//             footer: {
//                 js: "register-verify-otp.js",   
//             },
//         });
//     } catch (error) {
//         log1(["Error in getRegisterVerifyOtp----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     };
// };

// // export const getForgotPassword = async (req, res) => {
// //     try {
// //         return res.render("./layouts/auth-layout", {
// //             pageName: "forgot-password",
// //             header: {
// //                 id: "forgot-password",
// //                 title: "Forgot Password",
// //             },
// //             body: {},
// //             footer: {
// //                 js: "forgot-password.js",
// //             },
// //         });
// //     } catch (error) {
// //         log1(["getForgotPassword Error----->", error]);
// //         return res.status(400).json(errorResponse(messages.unexpectedDataError));
// //     }
// // };

// export const getResetPaaswordVerifyOtp = async (req, res) => {
//     try {
//         const { token } = req.query;

//         if (!token) {
//             return res.redirect("/");
//         };

//         const resetPasswordDataByToken = await ResetPasswordToken.findOne({ token });
//         if (!resetPasswordDataByToken) {
//             return res.redirect("/");
//         };

//         return res.render("./layouts/auth-layout", {
//             pageName: "reset-password-verify",
//             header: {
//                 title: "Reset Password Verification",
//             },
//             footer: {
//                 js: "reset-password-verify.js",
//             },
//         });
//     } catch (error) {
//         log1(["Error in getResetPaaswordVerifyOtp--------->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     };
// };

// export const getResetPassword = async (req, res) => {
//     try {
//         const { token } = req.query;

//         if (!token) {
//             return res.redirect("/");
//         };

//         const resetPasswordDataByToken = await ResetPasswordToken.findOne({ token });
//         if (!resetPasswordDataByToken) {
//             return res.redirect("/");
//         };

//         return res.render("./layouts/auth-layout", {
//             pageName: "reset-password",
//             header: {
//                 title: "Reset Password",
//             },
//             footer: {
//                 js: "reset-password.js",
//             },
//         });
//     } catch (error) {
//         log1(["Error in getResetPassword--------->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     };
// };

// export const getDashboard = async (req, res) => {
//     try {
//         let user = req.session.user;

//         return res.render("users/dashboard", {
//             header: {
//                 page: "Dashboard",
//                 user,
//                 title: "Dashboard",
//                 id: "dashboard",
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getDashboard----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getProfile = async (req, res) => {
//     try {
//         let user = req.session.user;

//         return res.render("users/profile", {
//             header: {
//                 page: "Profile",
//                 user,
//                 title: "Profile",
//                 id: "profile",
//             },
//             body: {},
//             footer: {
//                 js: "profile.js"
//             },
//         });
//     } catch (error) {
//         log1(["Error in getProfile----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getCart = async (req, res) => {
//     try {
//         let user = req.session.user;

//         return res.render("users/cart", {
//             header: {
//                 page: "Cart",
//                 user,
//                 title: "Cart",
//                 id: "cart",
//             },
//             body: {},
//             footer: {
//                 js: "cart.js"
//             },
//         });
//     } catch (error) {
//         log1(["Error in getCart----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getPrivacyPolicy = async (req, res) => {
//     try {
//         return res.render("users/privacy-policy", {
//             header: {
//                 page: "Privacy Policy",
//                 title: "Privacy Policy",
//                 id: "privacy-policy",
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getPrivacyPolicy----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getFAQ = async (req, res) => {
//     try {
//         return res.render("users/faq", {
//             header: {
//                 page: "FAQ",
//                 title: "FAQ",
//                 id: "faq",
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getFAQ----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getTermsCondition = async (req, res) => {
//     try {
//         return res.render("users/terms-condition", {
//             header: {
//                 page: "terms-condition",
//                 title: "Terms And Condition",
//                 id: "terms-condition",
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getTermsCondition----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

export const postExclusiveAccessToken = async (req, res) => {
    try {
        let param = req?.body;

        const validate = custom_validation(param, "user.exclusiveAccessToken");
        if (validate.flag !== 1) {
            return res.json(validate);
        };

        let settingData = await Setting.findOne({ name: "login_secret_token" });
        if(!settingData){
            return res.json(errorResponse("InValid Token."));
        };

        let exclusive_access_token = settingData.exclusiveAccessToken;
        if(!exclusive_access_token){
            return res.json(errorResponse("Incorrect Code. Access Denied"));
        };

        if(param?.access_code !== exclusive_access_token){
            return res.json(errorResponse("Incorrect Code. Access Denied"));
        };

        return res.json(successResponse("Access Done"));
    } catch (error) {
        log1(["Error in postExclusiveAccessToken--------->", error]);
        return res.status(400).json(errorResponse(messages.unexpectedDataError));
    };
};

export const postLogin = async (req, res) => {
    try {
        const param = req.body;
        req.ua = param.ua

        const validate = custom_validation(param, "user.login");
        if (validate.flag !== 1) {
            return res.json(validate);
        };

        const user = await User.findOne({ email: param.email });
        if (!user) {
            return res.json(errorResponse("Invalid credentials."));
        };

        const isMatch = await bcrypt.compare(param.password, user.password);
        if (!isMatch) {
            return res.json(errorResponse("Please enter a valid password."));
        };

        if(user.status == constant.USER_STATUS.PENDING){
            const resp = await RegisterToken.findOne({ email: user.email });
            return res.json(errorResponse("Please complete the verification process", {status: constant.USER_STATUS.PENDING, token: resp?.token || null}));
        };

        if(user.status == constant.USER_STATUS.SUSPEND){
            return res.json(errorResponse("Your account has been suspended. Please contact support."));
        };

        delete user.password; // Remove password from user object
        if(Number(user.google2faStatus) === constant.GOOGLE_2FA_STATUS.ENABLED) {
            return res.json(successResponse("Please enter your 2FA code", user));
        };
        
        const jwtToken = await generateLoginToken({ _id: user._id, email: user.email }, req);
        if (!jwtToken) {
            return res.json(errorResponse(messages.unexpectedDataError));
        };

        req.session.user = user;
        req.session.token = jwtToken;

        res.cookie("user_id", user._id, {
            httpOnly: false,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        await syncCartToDB(req);

        res.clearCookie("celebrityCart");

        return res.json(successResponse("Login successfully."));
    } catch (error) {
        log1(["Error in postLogin----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};

export const postLoginWith2FA = async (req, res) => {
    try {
        const param = req.body;
        const email = param.email;
        const otp = param.otp;
        req.ua = param.ua
        
        
        if(otp && otp.length !== constant.OTP_LENGTH) return res.json(errorResponse("Invalid OTP."));

        // get userby email
        const user = await User.findOne({ email: email });
        if (!user) return res.json(errorResponse("Invalid credentials."));
    
        const result = twofactor.verifyToken(user.google2faSecret, otp);
        if (!result) return res.json(errorResponse("Invalid 2FA code. Please try again."));
        
        switch (result.delta) {
            case -1: return res.json(errorResponse("Your Google 2FA code is valid but it is expired"));
            case 1: return res.json(errorResponse("Your Google 2FA code is valid but it is not active yet"));
            case 0: break;
            default: return res.json(errorResponse("Invalid 2FA response"));
        }

        const jwtToken = await generateLoginToken({ _id: user._id, email: user.email }, req);
        if (!jwtToken) return res.json(errorResponse(messages.unexpectedDataError));

        delete user.password; // Remove password from user object    
        req.session.user = user;
        req.session.token = jwtToken;

        res.cookie("user_id", user._id, {
            httpOnly: false,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        await syncCartToDB(req);

        res.clearCookie("celebrityCart");

        return res.json(successResponse("2FA Verified successfully"));             
    } catch (error) {
        log1(["Error in postLoginWith2FA----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
}

export const postRegister = async (req, res) => {
    try {
        let param = req?.body;

        const validate = custom_validation(param, "user.register");
        if (validate.flag !== 1) {
            return res.json(validate);
        };

        const user = await User.findOne({ email: param?.email });
        if (user && user.status === constant?.USER_STATUS?.ACTIVE) {
            return res.json(errorResponse("This email is already used. Please try with another email."));
        };

        const otp = crypto.randomInt(100000, 999999);

        let responseMessage = `We've sent a ${constant.OTP_LENGTH} digit verification code to your email. Please enter it below.`;

        if (user && user.status === constant.USER_STATUS.PENDING) {
            let registerTokenData = await RegisterToken.findOne({ email: param?.email });
            if(registerTokenData){
                const mailFile = await ejs.renderFile('./views/emails/register_otp_email.ejs', {
                    otp: otp,
                    userName: param.username,
                    email: param.email,
                    expiry_time: constant.OTP_EXPIRATION_TIME / 60000,
                });

                const mailOptions = {
                    from: `${process.env.SUPPORT_MAIL}`,
                    to: `${param.email}`,
                    subject: "One-Time Password for register",
                    html: mailFile,
                };
                sendMail(mailOptions);

                registerTokenData = await RegisterToken.findOneAndUpdate({ email: param?.email }, {
                    otp: otp,
                    expiryTime: new Date().getTime() + constant.OTP_EXPIRATION_TIME,
                }, { new: true });

                let data = {
                    token: registerTokenData.token,
                    endtime: registerTokenData.expiryTime,
                };

                return res.json(successResponse(responseMessage, data));
            };
        } else if (user && user.status === constant.USER_STATUS.SUSPEND) {
            return res.json(errorResponse("Your account is suspended. Please contact support"));
        };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(param?.password, salt);

        let userCreatePayload = {
            userName: param.username,
            email: param?.email,
            password: hashedPassword,
        };

        await User.create(userCreatePayload);

        const mailFile = await ejs.renderFile('./views/emails/register_otp_email.ejs', {
            otp: otp,
            userName: param.username,
            email: param.email,
            expiry_time: constant.OTP_EXPIRATION_TIME / 60000,
        });

        const mailOptions = {
            from: `${process.env.SUPPORT_MAIL}`,
            to: `${param.email}`,
            subject: `${otp} is your MDF account verification code.`,
            html: mailFile,
        };
        sendMail(mailOptions);

        const token = crypto.randomBytes(32).toString("hex");

        const registerTokenData = {
            token: token,
            otp: otp,
            userName: param.username,
            email: param.email,
            expiryTime: new Date().getTime() + constant.OTP_EXPIRATION_TIME,
        };

        await RegisterToken.create(registerTokenData);

        let data = {
           token: token,
           endtime: registerTokenData.expiryTime,
        };

        return res.json(successResponse(responseMessage, data));
    } catch (error) {
        log1(["Error in postRegister--------->", error]);
        return res.status(400).json(errorResponse(messages.unexpectedDataError));
    };
};

export const postVerifyOtp = async (req, res) => {
    try {
        const { token, otp } = req.body;
        req.ua = req.body.ua

        const validate = custom_validation(req.body, "user.verifyOtp");
        if (validate.flag !== 1) {
            return res.json(validate); 
        };

        const registerDataByToken = await RegisterToken.findOne({ token });

        if(!registerDataByToken){
            return res.json(errorResponse("Invalid token"));
        };

        const user = await User.findOne({ email: registerDataByToken.email });
        if (user.status === constant.USER_STATUS.ACTIVE) {
            return res.json(errorResponse("Your account is already verified"));
        };

        if(registerDataByToken.expiryTime < new Date().getTime()){
            return res.json(errorResponse("OTP expired"));
        };

        if(registerDataByToken.otp !== otp){
            return res.json(errorResponse("Invalid OTP"));
        };
        
        let newUser = await User.findOneAndUpdate({ _id: new ObjectId(user?._id) }, { status: constant.USER_STATUS.ACTIVE }, { new: true });
        await RegisterToken.deleteOne({ token });

        const jwtToken = await generateLoginToken({ _id: newUser._id, email: newUser.email }, req);
        if (!jwtToken) {
            return res.json(errorResponse(messages.unexpectedDataError));
        };

        req.session.user = newUser;
        req.session.token = jwtToken;

        await syncCartToDB(req);

        res.clearCookie("celebrityCart");

        const datte_formatted = dateFormatByTimezone(newUser.created_at);

        let ip = req.ip;
        ip = ip ? ip.split(":").pop() : "";

        const userTokenData = await UserToken.findOne({ userid: newUser._id });

        const user_device_ip = formatDeviceAndIp(userTokenData.userAgent, userTokenData.ip);

        const mailFile = await ejs.renderFile('./views/emails/new_user_register_email.ejs', {
            otp: otp,
            userName: newUser.userName,
            userEmail: newUser.email,
            userCreatedDate: datte_formatted,
            userDeviceIp: user_device_ip,
        });

        const mailOptions = {
            from: process.env.SUPPORT_MAIL,
            to: newUser.email,
            subject: "Welcome to MillionDollarFan – Your Account Has Been Created",
            html: mailFile,
        };
        sendMail(mailOptions);

        return res.json(successResponse("Account verified successfully"));
    } catch (error) {
        log1(["Error in postVerifyOtp--------->", error]);
        return res.status(400).json(errorResponse(messages.unexpectedDataError));
    };
};

export const postResendpostVerifyOtp = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.json(errorResponse("token required"));
        };

        const VerifyOtpRegisterDataByToken = await RegisterToken.findOne({ token });
        if (!VerifyOtpRegisterDataByToken) {
            return res.json(errorResponse("Invalid token"));
        };

        const newOtp = crypto.randomInt(100000, 999999);
        const user = await User.findOne({ email: VerifyOtpRegisterDataByToken.email });
        if (!user) {
            return res.json(errorResponse("User not found"));
        };

        const mailFile = await ejs.renderFile('./views/emails/register_otp_email.ejs', {
            otp: newOtp,
            userName: user.userName,
            email: user.email,
            expiry_time: constant.OTP_EXPIRATION_TIME / 60000,
        });

        const mailOptions = {
            from: `${process.env.SUPPORT_MAIL}`,
            to: `${user.email}`,
            subject: `${newOtp} is your MDF account verification code.`,
            html: mailFile,
        };
        sendMail(mailOptions);

        VerifyOtpRegisterDataByToken.otp = newOtp;
        VerifyOtpRegisterDataByToken.expiryTime = new Date().getTime() + constant.OTP_EXPIRATION_TIME;
        await VerifyOtpRegisterDataByToken.save();

        return res.json(successResponse("A new OTP has been sent to your email"));
    } catch (error) {
        log1(["Error in postResendpostVerifyOtp--------->", error]);
        return res.status(400).json(errorResponse(messages.unexpectedDataError));
    };
};

export const postResetPasswordSendOtp = async (req, res) => {
    try {
        const param = req.body;

        const validate = custom_validation(param, "user.resetPassOTP");
        if (validate.flag !== 1) {
            return res.json(validate);
        };

        const email = param.email;

        const userData = await User.findOne({ email: email });
        if (!userData) {
            return res.json(errorResponse("Your email is not registered with us."));
        };

        if(userData.status === constant.USER_STATUS.SUSPEND) {
            return res.status(400).json(errorResponse("Your account is suspended. Please contact support."));
        };

        const otp = crypto.randomInt(100000, 999999);

        const mailFile = await ejs.renderFile('./views/emails/reset_otp_mail.ejs', {
            otp: otp,
            userName: userData.userName,
            email: email,
            expiry_time: constant.OTP_EXPIRATION_TIME / 60000,
        });

        const mailOptions = {
            from: `${process.env.SUPPORT_MAIL}`,
            to: `${email}`,
            subject: "Password Request for Your MDF Account.",
            html: mailFile,
        };
        sendMail(mailOptions);

        const token = crypto.randomBytes(32).toString("hex");

        const resetPasswordTokenData = {
            token: token,
            otp: otp,
            userName: userData.userName,
            email: email,
            expiryTime: new Date().getTime() + constant.OTP_EXPIRATION_TIME,
        };

        await ResetPasswordToken.create(resetPasswordTokenData);

        let msg = "We've sent a 6 digit reset password code to your email. Please enter it below.";
        let data = {
            token: token,
            endtime: resetPasswordTokenData.expiryTime,
        };

        return res.json(successResponse(msg, data));
    } catch (error) {
        log1(["Error in postResetPasswordSendOtp--------->", error]);
        return res.status(400).json(errorResponse(messages.unexpectedDataError));
    };
};

export const postVerifyResetPasswordOtp = async (req, res) => {
    try {
        const { token, otp } = req.body;
        const validate = custom_validation(req.body, "user.verifyOtp");
        if (validate.flag !== 1) {
            return res.json(validate); 
        };

        const  resetPasswordDataByToken = await ResetPasswordToken.findOne({ token });
        if(!resetPasswordDataByToken){
            return res.json(errorResponse("Invalid token"));
        };

        const user = await User.findOne({ email:  resetPasswordDataByToken.email });
        if (user && user.status === constant.USER_STATUS.SUSPEND){
            return res.json(errorResponse("Your account is suspended. Please contact support"));
        };

        if( resetPasswordDataByToken.expiryTime < new Date().getTime()){
            return res.json(errorResponse("OTP expired"));
        };

        if(resetPasswordDataByToken.otp !== otp){
            return res.json(errorResponse("Invalid OTP"));
        };

        return res.json(successResponse("Account verified successfully"));
    } catch (error) {
        log1(["Error in postVerifyResetPasswordOtp----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    };
};

export const postResetPassword = async (req, res) => {
    try {
        const { token, password, otp } = req.body;

        const validate = custom_validation(req.body, "user.changePassword");
        if (validate.flag !== 1) {
            return res.json(validate); 
        };
    
        const resetPasswordDataByToken = await ResetPasswordToken.findOne({ token });
        if (!resetPasswordDataByToken) {
            return res.json(errorResponse("Invalid token"));
        };

        if( resetPasswordDataByToken.expiryTime < new Date().getTime()){
            return res.json(errorResponse("OTP expired"));
        };

        if(resetPasswordDataByToken.otp !== otp){
            return res.json(errorResponse("Invalid OTP"));
        };

        const user = await User.findOne({ email: resetPasswordDataByToken.email });
        if (!user) {
            return res.json(errorResponse("User not found"));
        };

        if (user.status === constant.USER_STATUS.SUSPEND){
            return res.json(errorResponse("Your account is suspended. Please contact support"));
        };
        
        const comparePassword = await bcrypt.compare(password, user?.password)
        if(comparePassword) return res.json(errorResponse(messages.newPasswordMustBeDifferentFromCurrent))
        
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        let updateResp = await user.save();
        await ResetPasswordToken.deleteOne({ token });

        let ua = new UAParser(req.headers["user-agent"])
        let result = ua.getResult();  

        let ip = req.ip.split(":").pop();

        //  send mail 
        const mailFile = await ejs.renderFile('./views/emails/password_reset_successfull_mail.ejs', {
            TimeofReset: dateFormatByTimezone(updateResp.updated_at),
            ip: ip,
            device: result.device?.type || result.browser?.name,
            userName: user?.userName
        });

        const mailOptions = {
            from: `${process.env.SUPPORT_MAIL}`,
            to: `${user?.email}`,
            subject: "Password Successfully Reset – Secure Your Account 🔒",
            html: mailFile,
        };
        sendMail(mailOptions);


        return res.json(successResponse("Password changed successfully"));
    } catch (error) {
        log1(["Error in postResetPassword----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    };
};

export const postResendResetPasswordOtp= async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.json(errorResponse("token required"));
        };

        const resetPasswordDataByToken = await ResetPasswordToken.findOne({ token });
        if (!resetPasswordDataByToken) {
            return res.json(errorResponse("Invalid token"));
        };

        const newOtp = crypto.randomInt(100000, 999999);
        const user = await User.findOne({ email: resetPasswordDataByToken.email });
        if (!user) {
            return res.json(errorResponse("User not found"));
        };

        if (user.status === constant.USER_STATUS.SUSPEND){
            return res.json(errorResponse("Your account is suspended. Please contact support"));
        };

        const mailFile = await ejs.renderFile('./views/emails/reset_otp_mail.ejs', {
            otp: newOtp,
            userName: user.userName,
            email: user.email,
            expiry_time: constant.OTP_EXPIRATION_TIME / 60000,
        });

        const mailOptions = {
            from: `${process.env.SUPPORT_MAIL}`,
            to: `${user.email}`,
            subject: "Reset Password Request for Your MDF Account.",
            html: mailFile,
        };
        sendMail(mailOptions);

        resetPasswordDataByToken.otp = newOtp;
        resetPasswordDataByToken.expiryTime = new Date().getTime() + constant.OTP_EXPIRATION_TIME;
        await resetPasswordDataByToken.save();

        return res.json(successResponse("A new OTP has been sent to your email"));
    } catch (error) {
        log1(["Error in postResendResetPasswordOtp----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    };
};

export const syncCartToDB = async (req, isServerLogout = false) => {
    try {
        let userId = req?.session?.user?._id;
        const cookieCart = req.cookies.celebrityCart ? JSON.parse(req.cookies.celebrityCart) : [];

        if (!cookieCart || cookieCart.length === 0) return;

        if(isServerLogout && !userId){
            userId = req.cookies.user_id;

            delete req.cookies.celebrityCart;
            delete req.cookies.user_id;
        };

        if (!userId) return;

        let userCart = await Cart.findOne({ userId });

        if (!userCart) {
            userCart = new Cart({
                userId,
                cartData: cookieCart,
            });
        } else {
            cookieCart.forEach(cookieItem => {
                const existingCeleb = userCart.cartData.find((c) => c.celebrityId === cookieItem.celebrityId);

                if (existingCeleb) {
                    cookieItem.membershipList.forEach((newMembership) => {
                        const existMembership = existingCeleb.membershipList.find((m) => m.membershipId === newMembership.membershipId);

                        if (existMembership) {
                            existMembership.totalQuantity += newMembership.totalQuantity;
                            existMembership.isSendGift = newMembership.isSendGift;
                        } else {
                            existingCeleb.membershipList.push(newMembership);
                        };
                    });
                } else {
                    userCart.cartData.push(cookieItem);
                };
            });
        };

        await userCart.save();

        return successResponse("Cart data add successfully.");
    } catch (error) {
        log1(["Error in syncCartToDB----->", error]);
        return errorResponse(messages.unexpectedDataError);
    };
};
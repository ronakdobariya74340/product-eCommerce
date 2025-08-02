import {Router} from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    // getLogin,
    // getRegister,
    // getRegisterVerifyOtp,
    // getForgotPassword,
    // getDashboard,
    // getProfile,
    // getCart,
    // getTermsCondition,
    // getPrivacyPolicy,
    // getFAQ,
    // getResetPaaswordVerifyOtp,
    // getResetPassword,
    postExclusiveAccessToken,
    postRegister,
    postVerifyOtp,
    postResendpostVerifyOtp,
    postLogin,
    postResetPasswordSendOtp,
    postVerifyResetPasswordOtp,
    postResendResetPasswordOtp,
    postResetPassword,
    postLoginWith2FA,
} from '../controllers/auth.controller.js';

const router = Router();

// get route
// router.get("/", getLogin);
// router.get("/register", getRegister);
// router.get("/register/verify-otp", getRegisterVerifyOtp);
// router.get('/forgot-password', getForgotPassword);
// router.get("/reset-password/verify-otp", getResetPaaswordVerifyOtp);
// router.get("/reset-password", getResetPassword);

// router.get("/dashboard", authMiddleware, getDashboard);
// router.get("/profile", authMiddleware, getProfile);
// router.get("/cart", authMiddleware, getCart);
// router.get("/terms-condition", getTermsCondition);
// router.get("/privacy-policy", getPrivacyPolicy);
// router.get("/faq", getFAQ);


// post route
router.post("/exclusive-access-token", postExclusiveAccessToken);
router.post("/register", postRegister);
router.post("/register/verify-otp", postVerifyOtp);
router.post("/register/resend-otp", postResendpostVerifyOtp);

router.post("/login", postLogin);

router.post("/reset-password/send-otp", postResetPasswordSendOtp);
router.post("/reset-password/verify-otp", postVerifyResetPasswordOtp);
router.post("/reset-password/resend-otp", postResendResetPasswordOtp);
router.post("/reset-password", postResetPassword);

// login with 2Fa
router.post("/login/with2fa", postLoginWith2FA);

export default router;
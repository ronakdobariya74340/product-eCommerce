import express from "express";
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    getHomePage,
    getProductDetails,
    getCart,
    // getPrivacyPolicy,
    // getTermsCondition,
    // getFAQ,
    // getContact,
    // getHowItWorksPage,
    // getAboutPage,
    postLogOut,
    postUpdateProfile,
    postAddMakePayment,
    postPaymentWebhook,
    getPaymentSuccessResponse,
    getPaymentCancelResponse,
    postChangePassword,
    getReviewOrderPage,
    postCartUpdate,
    getmaintenanceMode,
    getTotalCartItem,
} from "../controllers/home.controller.js";

const router = express.Router();

// Get Route
router.get("/", getHomePage);
router.get("/product-details/:id", getProductDetails);
router.get("/cart", getCart);
// router.get("/privacy-policy", getPrivacyPolicy);
// router.get("/terms-condition", getTermsCondition);
// router.get("/faq", getFAQ);
// router.get("/contact", getContact);
// router.get("/how-it-works", getHowItWorksPage);
// router.get("/about-us", getAboutPage);

router.get("/review-order/:paymentMethod", getReviewOrderPage);
router.get("/payment-success", authMiddleware, getPaymentSuccessResponse);
router.get("/payment-cancel", authMiddleware, getPaymentCancelResponse);
router.get("/maintenance", getmaintenanceMode);
router.get("/total-cart-item", getTotalCartItem);

// Post Route
router.post("/cart-update", postCartUpdate);


router.post("/make-payment", authMiddleware, postAddMakePayment);
router.post("/payment-webhook", express.raw({ type: 'application/json' }), postPaymentWebhook);

router.post("/change-password", authMiddleware, postChangePassword);
router.post("/profile/update", authMiddleware, postUpdateProfile);
router.post("/logout", authMiddleware, postLogOut);

export default router;
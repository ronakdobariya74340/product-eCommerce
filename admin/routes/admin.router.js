import {Router} from 'express';
import {
    getLoginPage,
    postLogin,
    postLogout,
    postUpdatePasswords,
    postUpdateSettings,
} from '../controllers/auth.controller.js';
import {
    deleteProduct,
    deleteProductCategory,
    getProductManagementPage,
    getDashboardPage,
    getProductCategory,
    getProductBanner,
    getSettingsPage,
    getTransactionManagement,
    getUserManagementPage,
    getUserDetails,
    getAllRecord,
    postRecordList,
    postAddProduct,
    postAddProductCategory,
    postProductList,
    postProductDetails,
    postProductWiseTransactionList,
    postDeleteUser,
    postUpdateProduct,
    postUpdateProductCategory,
    postEditUser,
    postProductCategoryList,
    postProductCategoryDetails,
    postTransactionList,
    postUserTransactionHistoryFilter,
    postUserGiftRedeemHistoryFilter,
    postUserList,
    getProductDetailsPage,
    postMyEntries,
    postProductBannerList,
    postProductBannerDetails,
    postAddProductBanner,
    postUpdateProductBanner,
    deleteProductBanner,
} from '../controllers/admin.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const adminroute = Router();

// get route
adminroute.get("/login/:token", getLoginPage);
adminroute.get("/dashboard", authMiddleware, getDashboardPage);
adminroute.get("/user-management", authMiddleware, getUserManagementPage);
adminroute.get("/user-details/:userId", authMiddleware, getUserDetails);
adminroute.get("/product-management", authMiddleware, getProductManagementPage);
adminroute.get("/product-details/:id", authMiddleware, getProductDetailsPage);
adminroute.get("/transaction", authMiddleware, getTransactionManagement);
adminroute.get("/product-category", authMiddleware, getProductCategory);
adminroute.get("/product-banner", authMiddleware, getProductBanner);
adminroute.get("/settings", authMiddleware, getSettingsPage);
adminroute.get("/reports", authMiddleware, getAllRecord);

// post route

adminroute.post("/record-list", postRecordList);

adminroute.post("/login", postLogin);
adminroute.post("/logout", postLogout);
adminroute.post("/user-list", authMiddleware, postUserList);

adminroute.post("/edit-user", authMiddleware, postEditUser);
adminroute.post("/delete-user", authMiddleware, postDeleteUser);
adminroute.post("/update-settings", authMiddleware, postUpdateSettings);
adminroute.post("/update-password", authMiddleware, postUpdatePasswords);

// product Route
adminroute.post("/product-list", authMiddleware, postProductList);
adminroute.post("/product-details", authMiddleware, postProductDetails);
adminroute.post("/product-transaction-list", authMiddleware, postProductWiseTransactionList);
adminroute.post("/add-product", authMiddleware, postAddProduct);
adminroute.post("/product-update", authMiddleware, postUpdateProduct);
adminroute.post("/product-delete", authMiddleware, deleteProduct);

// trasnaction Route
adminroute.post("/transaction-list", authMiddleware,  postTransactionList);

// User Filter
adminroute.post("/user-transaction-filter", authMiddleware, postUserTransactionHistoryFilter);
adminroute.post("/user-gift-redeem-filter", authMiddleware, postUserGiftRedeemHistoryFilter);
adminroute.post("/user-entries-filter",authMiddleware, postMyEntries);

// Product Category Route
adminroute.post("/product-category-list", authMiddleware, postProductCategoryList);
adminroute.post("/product-category-details", authMiddleware, postProductCategoryDetails);
adminroute.post("/product-category-add", authMiddleware, postAddProductCategory);
adminroute.post("/product-category-update", authMiddleware, postUpdateProductCategory);
adminroute.post("/product-category-delete", authMiddleware, deleteProductCategory);

// Product Banner Route
adminroute.post("/product-banner-list", authMiddleware, postProductBannerList);
adminroute.post("/product-banner-details", authMiddleware, postProductBannerDetails);
adminroute.post("/product-banner-add", authMiddleware, postAddProductBanner);
adminroute.post("/product-banner-update", authMiddleware, postUpdateProductBanner);
adminroute.post("/product-banner-delete", authMiddleware, deleteProductBanner);


export default adminroute;